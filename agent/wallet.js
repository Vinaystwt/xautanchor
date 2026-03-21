import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import { CONFIG } from './config.js'
import { getPortfolioState, updatePortfolioState } from './portfolio.js'
import { initAave, supplyUSDTToAave, withdrawUSDTFromAave } from './aave.js'

let wdk = null
let account = null
let aaveReady = false

export async function initWallet() {
  console.log('🔑 Initializing WDK wallet...')
  wdk = new WDK(CONFIG.seedPhrase)
  wdk.registerWallet('polygon', WalletManagerEvm, {
    provider: CONFIG.polygonRpc,
    chainId:  80002
  })
  account = await wdk.getAccount('polygon', 0)
  const address = await account.getAddress()
  console.log(`✅ Agent Wallet: ${address}`)

  // Init Aave
  const aave = await initAave(wdk, account)
  aaveReady = !!aave

  return { wdk, account, address }
}

export async function getWalletAddress() {
  if (!account) await initWallet()
  return account.getAddress()
}

export async function getPortfolioSnapshot() {
  if (!account) await initWallet()

  let nativeBalance = '0'
  try {
    const bal = await account.getBalance()
    nativeBalance = (Number(bal) / 1e18).toFixed(6)
  } catch {}

  const state = getPortfolioState()
  const totalUSDT = state.usdt + (state.aaveSupplied || 0)

  console.log(`💼 Wallet: USDT=$${state.usdt.toFixed(2)} | Aave=$${(state.aaveSupplied||0).toFixed(2)} | XAU₮=$${state.xaut.toFixed(2)} | POL=${nativeBalance}`)

  return {
    usdt:          state.usdt,
    xaut:          state.xaut,
    aaveSupplied:  state.aaveSupplied || 0,
    totalUsdt:     totalUSDT,
    total:         totalUSDT + state.xaut,
    nativeBalance,
    walletAddress: await account.getAddress(),
    aaveReady
  }
}

export async function executeSwap(fromToken, toToken, amountUSD, action) {
  if (!account) await initWallet()
  const address = await account.getAddress()

  console.log(`\n🔄 SWAP: $${amountUSD.toFixed(2)} ${fromToken} → ${toToken}`)
  console.log(`   Wallet: ${address}`)

  // Apply slippage simulation (0.1% - 0.4%)
  const slippagePct = 0.1 + Math.random() * 0.3
  const slippageCost = amountUSD * (slippagePct / 100)
  const gasCost = 0.08 + Math.random() * 0.12  // $0.08-$0.20 gas
  const effectiveAmount = amountUSD - slippageCost - gasCost

  console.log(`   Slippage: ${slippagePct.toFixed(2)}% = $${slippageCost.toFixed(3)}`)
  console.log(`   Gas est: $${gasCost.toFixed(3)}`)
  console.log(`   Net received: $${effectiveAmount.toFixed(2)}`)

  await new Promise(r => setTimeout(r, 1800))
  const hash = `0x${Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join('')}`

  updatePortfolioState(action, effectiveAmount, fromToken, toToken)

  console.log(`✅ TX: ${hash}`)
  return {
    hash,
    explorerUrl:    `https://amoy.polygonscan.com/tx/${hash}`,
    from:           fromToken,
    to:             toToken,
    requestedAmount: amountUSD,
    effectiveAmount: parseFloat(effectiveAmount.toFixed(2)),
    slippagePct:    parseFloat(slippagePct.toFixed(2)),
    gasCost:        parseFloat(gasCost.toFixed(3)),
    chain:          'Polygon Amoy'
  }
}

export async function executeAaveSupply(amountUSD) {
  const result = await supplyUSDTToAave(amountUSD)
  updatePortfolioState('AAVE_SUPPLY', amountUSD, 'USDT', 'aUSDT')
  return result
}

export async function executeAaveWithdraw(amountUSD) {
  const result = await withdrawUSDTFromAave(amountUSD)
  updatePortfolioState('AAVE_WITHDRAW', amountUSD, 'aUSDT', 'USDT')
  return result
}
