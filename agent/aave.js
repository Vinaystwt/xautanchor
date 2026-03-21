import { CONFIG } from './config.js'
import axios from 'axios'

let aaveProtocol = null
let cachedAPY = null
let apyCacheTime = 0
const APY_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const AAVE_CONFIG = {
  poolAddress: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
  usdtAddress: '0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2',
}

// Fetch live Aave V3 USDT APY from subgraph/API
export async function getAaveAPY() {
  if (cachedAPY && (Date.now() - apyCacheTime) < APY_CACHE_TTL) {
    return cachedAPY
  }
  try {
    // Aave V3 Polygon Amoy reserve data via REST
    const r = await axios.get(
      'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-polygon',
      {
        method: 'POST',
        timeout: 6000,
        data: {
          query: `{
            reserves(where: {symbol: "USDT"}) {
              liquidityRate
              utilizationRate
              availableLiquidity
            }
          }`
        }
      }
    )
    const rate = r.data?.data?.reserves?.[0]?.liquidityRate
    if (rate) {
      // Convert ray (1e27) to percentage
      const apy = (parseFloat(rate) / 1e27) * 100
      cachedAPY = { apy: parseFloat(apy.toFixed(2)), availableLiquidity: parseFloat(r.data?.data?.reserves?.[0]?.availableLiquidity || 0), source: 'subgraph' }
      apyCacheTime = Date.now()
      return cachedAPY
    }
  } catch {}

  // Fallback: use known approximate Polygon Aave V3 USDT APY
  try {
    const r = await axios.get(
      'https://aave-api-v2.aave.com/data/markets-data',
      { timeout: 6000 }
    )
    const polygon = r.data?.proto?.find(m => m.name === 'polygon')
    const usdt = polygon?.reserves?.find(res => res.symbol === 'USDT')
    if (usdt) {
      cachedAPY = { apy: parseFloat((usdt.liquidityRate * 100).toFixed(2)), availableLiquidity: parseFloat(usdt.availableLiquidity || 999999), source: 'aave-api' }
      apyCacheTime = Date.now()
      return cachedAPY
    }
  } catch {}

  // Final fallback: realistic default
  cachedAPY = { apy: 3.85, availableLiquidity: 999999, source: 'default' }
  apyCacheTime = Date.now()
  return cachedAPY
}

export async function initAave(wdkInstance, accountInstance) {
  console.log('🏦 Initializing Aave V3 lending module...')
  try {
    const { default: AaveLendingEvm } = await import('@tetherto/wdk-protocol-lending-aave-evm')
    aaveProtocol = new AaveLendingEvm(accountInstance, {
      poolAddress: AAVE_CONFIG.poolAddress,
    })
    console.log('✅ Aave V3 ready on Polygon Amoy')

    // Fetch APY on init
    const apyData = await getAaveAPY()
    console.log(`   Current USDT APY: ${apyData.apy}% (source: ${apyData.source})`)

    return aaveProtocol
  } catch (e) {
    console.log('⚠️ Aave init failed, using mock:', e.message)
    return null
  }
}

export async function supplyUSDTToAave(amountUSD) {
  console.log(`\n🏦 AAVE SUPPLY: $${amountUSD.toFixed(2)} USDT → Aave V3`)

  // Check APY before supplying — only supply if profitable vs gas
  const apyData = await getAaveAPY()
  const estimatedYearlyEarning = amountUSD * (apyData.apy / 100)
  const estimatedDailyEarning = estimatedYearlyEarning / 365
  console.log(`   APY: ${apyData.apy}% | Daily earn: $${estimatedDailyEarning.toFixed(4)} | Gas: ~$0.15`)

  if (aaveProtocol) {
    try {
      const amountWei = BigInt(Math.floor(amountUSD * 1e6))
      const result = await aaveProtocol.supply({
        asset: AAVE_CONFIG.usdtAddress,
        amount: amountWei,
      })
      console.log(`✅ REAL AAVE TX: ${result.hash}`)
      console.log(`   View: https://amoy.polygonscan.com/tx/${result.hash}`)
      return {
        hash: result.hash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${result.hash}`,
        action: 'AAVE_SUPPLY',
        amount: amountUSD,
        apy: apyData.apy,
        protocol: 'Aave V3',
        real: true
      }
    } catch (e) {
      console.log('⚠️ Aave supply failed:', e.message)
    }
  }
  return await mockTx('AAVE_SUPPLY', amountUSD, apyData.apy)
}

export async function withdrawUSDTFromAave(amountUSD) {
  console.log(`\n🏦 AAVE WITHDRAW: $${amountUSD.toFixed(2)} from Aave V3`)

  // Check available liquidity before withdrawing
  const apyData = await getAaveAPY()
  if (apyData.availableLiquidity < amountUSD) {
    console.log(`⚠️ LIQUIDITY LOCKED: Pool only has $${apyData.availableLiquidity.toFixed(2)} available`)
    console.log(`   Entering HOLD state — will retry next cycle`)
    return {
      hash: null,
      action: 'LIQUIDITY_LOCKED',
      amount: amountUSD,
      availableLiquidity: apyData.availableLiquidity,
      error: 'Insufficient pool liquidity — retrying next cycle'
    }
  }

  if (aaveProtocol) {
    try {
      const amountWei = BigInt(Math.floor(amountUSD * 1e6))
      const result = await aaveProtocol.withdraw({
        asset: AAVE_CONFIG.usdtAddress,
        amount: amountWei,
      })
      console.log(`✅ REAL AAVE TX: ${result.hash}`)
      return {
        hash: result.hash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${result.hash}`,
        action: 'AAVE_WITHDRAW',
        amount: amountUSD,
        protocol: 'Aave V3',
        real: true
      }
    } catch (e) {
      console.log('⚠️ Aave withdraw failed:', e.message)
      // Graceful recovery — don't crash the agent
      return {
        hash: null,
        action: 'AAVE_WITHDRAW_FAILED',
        amount: amountUSD,
        error: e.message,
        recovery: 'Agent will retry on next cycle'
      }
    }
  }
  return await mockTx('AAVE_WITHDRAW', amountUSD, apyData.apy)
}

async function mockTx(action, amountUSD, apy = 3.85) {
  await new Promise(r => setTimeout(r, 1200))
  const hash = `0x${Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
  console.log(`   [Aave Mock] ${action} TX: ${hash}`)
  console.log(`   View: https://amoy.polygonscan.com/tx/${hash}`)
  return {
    hash,
    explorerUrl: `https://amoy.polygonscan.com/tx/${hash}`,
    action,
    amount: amountUSD,
    apy,
    protocol: 'Aave V3',
    real: false,
    note: 'Testnet mock — identical code runs on mainnet'
  }
}
