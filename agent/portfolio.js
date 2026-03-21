import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STATE_FILE = path.join(__dirname, '../portfolio-state.json')

const DEFAULT_STATE = {
  usdt:          120.00,  // Available USDT (not in Aave)
  xaut:          50.00,
  aaveSupplied:  30.00,   // USDT currently earning yield in Aave
  totalDeposited:200.00,
  lastUpdated:   new Date().toISOString(),
  history:       []
}

export function getPortfolioState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2))
      return DEFAULT_STATE
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
  } catch {
    return DEFAULT_STATE
  }
}

export function updatePortfolioState(action, amount, fromToken, toToken) {
  const state = getPortfolioState()

  switch (action) {
    case 'HEDGE':
      state.usdt = Math.max(0, state.usdt - amount)
      state.xaut = state.xaut + amount
      break
    case 'REBALANCE':
      state.xaut = Math.max(0, state.xaut - amount)
      state.usdt = state.usdt + amount
      break
    case 'AAVE_SUPPLY':
      state.usdt         = Math.max(0, state.usdt - amount)
      state.aaveSupplied = (state.aaveSupplied || 0) + amount
      break
    case 'AAVE_WITHDRAW':
      state.aaveSupplied = Math.max(0, (state.aaveSupplied || 0) - amount)
      state.usdt         = state.usdt + amount
      break
  }

  state.lastUpdated = new Date().toISOString()

  // Track history for chart
  state.history = state.history || []
  const totalUSDT = state.usdt + (state.aaveSupplied || 0)
  state.history.push({
    timestamp:    new Date().toISOString(),
    action,
    usdt:         parseFloat(state.usdt.toFixed(2)),
    xaut:         parseFloat(state.xaut.toFixed(2)),
    aaveSupplied: parseFloat((state.aaveSupplied||0).toFixed(2)),
    total:        parseFloat((totalUSDT + state.xaut).toFixed(2))
  })
  state.history = state.history.slice(-50)

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))

  const totalUSDTAll = state.usdt + (state.aaveSupplied || 0)
  console.log(`📊 Portfolio: USDT=$${state.usdt.toFixed(2)} | Aave=$${(state.aaveSupplied||0).toFixed(2)} | XAU₮=$${state.xaut.toFixed(2)} | Total=$${(totalUSDTAll+state.xaut).toFixed(2)}`)

  return state
}

export function getPortfolioHistory() {
  return (getPortfolioState().history || [])
}
