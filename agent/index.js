import express from 'express'
import cors from 'cors'
import { initWallet, getWalletAddress, getPortfolioSnapshot } from './wallet.js'
import { getMarketSignal } from './oracle.js'
import { getAgentDecision } from './reasoner.js'
import { executeHedge, executeRebalance, executeHold } from './swapper.js'
import { getLogs } from './logger.js'
import { getPortfolioHistory, getPortfolioState } from './portfolio.js'
import { getAaveAPY } from './aave.js'
import { CONFIG } from './config.js'

const app = express()
app.use(cors())
app.use(express.json())

let agentStatus    = 'INITIALIZING'
let lastAction     = null
let lastActionTime = null
let cycleCount     = 0
let walletAddress  = null
let lastSignal     = null
let lastError      = null
let startTime      = new Date().toISOString()
let circuitBreakerTripped = false

// Initial capital for drawdown calculation
const INITIAL_CAPITAL = 200.00
const MAX_DRAWDOWN_PCT = 15  // Circuit breaker at 15% drawdown

app.get('/api/status', (req, res) => {
  const state = getPortfolioState()
  const totalValue = (state.usdt || 0) + (state.xaut || 0) + (state.aaveSupplied || 0)
  const drawdownPct = ((INITIAL_CAPITAL - totalValue) / INITIAL_CAPITAL * 100).toFixed(2)

  res.json({
    status: agentStatus,
    walletAddress,
    cycleCount,
    lastAction,
    lastActionTime,
    lastMarketSignal: lastSignal,
    lastError,
    startTime,
    uptime: Math.floor((Date.now() - new Date(startTime)) / 1000),
    circuitBreakerTripped,
    drawdownPct: parseFloat(drawdownPct),
    lastChecked: new Date().toISOString(),
    config: {
      pollIntervalMinutes: CONFIG.pollIntervalMinutes,
      volatilityHighThreshold: CONFIG.volatilityHighThreshold,
      volatilityLowThreshold: CONFIG.volatilityLowThreshold,
      hedgePercentage: CONFIG.hedgePercentage,
      chain: 'Polygon Amoy Testnet',
      chainId: 80002,
      cooldownCycles: 2,
      hysteresisBand: 8,
      maxDrawdownPct: MAX_DRAWDOWN_PCT,
      initialCapital: INITIAL_CAPITAL
    }
  })
})

app.get('/api/logs', (req, res) => res.json({ logs: getLogs(50), total: getLogs(50).length }))

app.get('/api/signal', async (req, res) => {
  try {
    const signal = await getMarketSignal()
    lastSignal = signal
    res.json(signal)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/portfolio', async (req, res) => {
  try {
    const snap = await getPortfolioSnapshot()
    const apyData = await getAaveAPY()
    res.json({ ...snap, history: getPortfolioHistory(), aaveAPY: apyData.apy, aaveSource: apyData.source })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/aave', async (req, res) => {
  try {
    const apyData = await getAaveAPY()
    res.json(apyData)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/health', (req, res) => res.json({
  status: 'ok', agent: agentStatus, cycles: cycleCount,
  uptime: Math.floor((Date.now() - new Date(startTime)) / 1000),
  wallet: walletAddress, lastError,
  circuitBreakerTripped,
  timestamp: new Date().toISOString()
}))

app.post('/api/trigger', async (req, res) => {
  if (agentStatus === 'RUNNING') return res.json({ message: 'Already running' })
  console.log('\n⚡ Manual trigger')
  res.json({ message: 'Triggered' })
  runAgentCycle().catch(console.error)
})

// Reset circuit breaker manually
app.post('/api/reset-circuit-breaker', (req, res) => {
  circuitBreakerTripped = false
  console.log('🔄 Circuit breaker reset manually')
  res.json({ message: 'Circuit breaker reset', circuitBreakerTripped: false })
})

async function runAgentCycle() {
  cycleCount++
  agentStatus = 'RUNNING'
  lastError = null

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🤖 XAU₮ANCHOR — CYCLE #${cycleCount} — ${new Date().toISOString()}`)
  console.log('═'.repeat(60))

  try {
    // ── CIRCUIT BREAKER CHECK ──────────────────────────────
    const state = getPortfolioState()
    const totalValue = (state.usdt || 0) + (state.xaut || 0) + (state.aaveSupplied || 0)
    const drawdownPct = ((INITIAL_CAPITAL - totalValue) / INITIAL_CAPITAL) * 100

    if (drawdownPct >= MAX_DRAWDOWN_PCT) {
      circuitBreakerTripped = true
      console.log(`\n🚨 CIRCUIT BREAKER TRIPPED!`)
      console.log(`   Drawdown: ${drawdownPct.toFixed(2)}% (threshold: ${MAX_DRAWDOWN_PCT}%)`)
      console.log(`   Forcing REBALANCE — liquidating all XAU₮ to protect capital`)

      const circuitBreakerDecision = {
        action: 'REBALANCE',
        reasoning: `CIRCUIT BREAKER TRIGGERED: Portfolio drawdown of ${drawdownPct.toFixed(2)}% exceeds the ${MAX_DRAWDOWN_PCT}% maximum threshold. Emergency liquidation of XAU₮ to USDT to protect remaining capital. This is an automatic risk management override.`,
        confidence: 10,
        urgency: 'HIGH',
        riskLevel: 'EXTREME',
        keySignal: 'DRAWDOWN_CIRCUIT_BREAKER',
        circuitBreaker: true
      }

      lastAction = await executeRebalance(circuitBreakerDecision, lastSignal || { fearGreedIndex: 50, fearGreedLabel: 'Circuit Breaker', marketMood: 'CIRCUIT_BREAKER' })
      agentStatus = 'IDLE'
      return
    }
    // ─────────────────────────────────────────────────────

    console.log('\n📡 STEP 1: Market oracle...')
    const signal = await getMarketSignal()
    lastSignal = signal

    console.log('\n💼 STEP 2: Portfolio state...')
    const portfolio = await getPortfolioSnapshot()

    // Fetch live Aave APY for LLM context
    const apyData = await getAaveAPY()

    console.log('\n🧠 STEP 3: LLM reasoning...')
    const decision = await getAgentDecision({
      marketSignal: signal,
      currentUSDT: portfolio.usdt,
      currentXAUT: portfolio.xaut,
      currentAaveSupplied: portfolio.aaveSupplied,
      aaveAPY: apyData.apy,
      lastAction: lastAction?.action || null,
      lastActionTime,
      cycleCount,
      highThreshold: CONFIG.volatilityHighThreshold,
      lowThreshold: CONFIG.volatilityLowThreshold
    })

    console.log(`\n⚡ STEP 4: Execute → ${decision.action}`)
    switch (decision.action) {
      case 'HEDGE':     lastAction = await executeHedge(decision, signal);     break
      case 'REBALANCE': lastAction = await executeRebalance(decision, signal); break
      default:          lastAction = await executeHold(decision, signal)
    }

    if (decision.action !== 'HOLD') lastActionTime = new Date().toISOString()
    agentStatus = 'IDLE'
    console.log(`\n✅ Cycle #${cycleCount} complete. Next in ${CONFIG.pollIntervalMinutes} min.`)

  } catch (error) {
    lastError = error.message
    agentStatus = 'ERROR'
    console.error(`\n❌ Cycle error: ${error.message}`)
    // Auto-recover — never let the agent die
    setTimeout(() => {
      if (agentStatus === 'ERROR') {
        console.log('🔄 Auto-recovering from error...')
        agentStatus = 'IDLE'
      }
    }, 30000)
  }
}



// Backtest endpoint
let backtestCache = null
let backtestCacheTime = 0

app.get('/api/backtest', async (req, res) => {
  try {
    if (backtestCache && Date.now() - backtestCacheTime < 30 * 60 * 1000) {
      return res.json(backtestCache)
    }
    const fgiHistory = await getHistoricalFGI()
    const result = runBacktest(fgiHistory, 200)
    backtestCache = result
    backtestCacheTime = Date.now()
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

async function start() {
  console.log('\n' + '═'.repeat(60))
  console.log('  ⚓  XAU₮ANCHOR — AUTONOMOUS GOLD-HEDGE DeFi AGENT')
  console.log('  Powered by Tether WDK + Aave V3')
  console.log('  Tether Hackathon Galactica: WDK Edition 1')
  console.log('═'.repeat(60))

  walletAddress = await getWalletAddress()

  app.listen(CONFIG.port, () => {
    console.log(`\n🌐 API: http://localhost:${CONFIG.port}`)
    console.log(`   Endpoints: status | portfolio | logs | signal | aave | health | trigger`)
  })

  await runAgentCycle()
  setInterval(runAgentCycle, CONFIG.pollIntervalMinutes * 60 * 1000)
}

start().catch(err => { console.error('Fatal:', err); process.exit(1) })

