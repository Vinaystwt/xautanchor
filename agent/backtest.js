import axios from 'axios'

// Fetch 30 days of historical Fear & Greed data
export async function getHistoricalFGI() {
  try {
    const r = await axios.get('https://api.alternative.me/fng/?limit=30&format=json', { timeout: 8000 })
    return r.data.data.map(d => ({
      date: new Date(d.timestamp * 1000).toLocaleDateString(),
      fgi: parseInt(d.value),
      label: d.value_classification
    })).reverse()
  } catch {
    return []
  }
}

export function runBacktest(fgiHistory, initialCapital = 200) {
  if (!fgiHistory.length) return null

  const HEDGE_THRESHOLD = 22
  const REBALANCE_THRESHOLD = 68
  const HYSTERESIS = 8
  const SLIPPAGE = 0.002
  const GAS = 0.15
  const AAVE_APY = 0.0385
  const DAILY_RATE = AAVE_APY / 365

  let usdt = initialCapital
  let xaut = 0
  let aave = 0
  let lastAction = 'HOLD'
  let hedgeCount = 0
  let rebalanceCount = 0
  let aaveYieldTotal = 0
  const equity = []
  const returns = []
  let prevTotal = initialCapital

  for (const day of fgiHistory) {
    const fgi = day.fgi
    const total = usdt + xaut + aave

    // Aave yield accrual
    if (aave > 0) {
      const dailyYield = aave * DAILY_RATE
      aave += dailyYield
      aaveYieldTotal += dailyYield
    }

    // Decision logic (simplified — no price data in historical FGI)
    const riskScore = (100 - fgi) * 0.5

    if (fgi < HEDGE_THRESHOLD - HYSTERESIS && lastAction !== 'HEDGE' && usdt > 10) {
      // HEDGE: move 70% of USDT to XAU₮
      const swapAmt = usdt * 0.7
      const effective = swapAmt * (1 - SLIPPAGE) - GAS
      xaut += effective
      usdt -= swapAmt
      lastAction = 'HEDGE'
      hedgeCount++
    } else if (fgi > REBALANCE_THRESHOLD + HYSTERESIS && xaut > 10) {
      // REBALANCE: move XAU₮ back to USDT, supply 70% to Aave
      const swapAmt = xaut * 0.8
      const effective = swapAmt * (1 - SLIPPAGE) - GAS
      usdt += effective
      xaut -= swapAmt
      aave += usdt * 0.7
      usdt *= 0.3
      lastAction = 'REBALANCE'
      rebalanceCount++
    } else if (usdt > 20 && aave === 0) {
      // HOLD: supply to Aave
      aave = usdt * 0.7
      usdt *= 0.3
    }

    const dayTotal = usdt + xaut + aave
    const dayReturn = (dayTotal - prevTotal) / prevTotal
    returns.push(dayReturn)
    prevTotal = dayTotal

    equity.push({
      date: day.date,
      total: parseFloat(dayTotal.toFixed(2)),
      fgi: day.fgi,
      action: lastAction
    })
  }

  // Sharpe ratio (annualized, risk-free = 0)
  const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length)
  const sharpe = stdDev > 0 ? parseFloat(((avgReturn / stdDev) * Math.sqrt(365)).toFixed(2)) : 0

  const finalTotal = usdt + xaut + aave
  const pnl = finalTotal - initialCapital
  const pnlPct = ((pnl / initialCapital) * 100).toFixed(2)

  return {
    initialCapital,
    finalValue: parseFloat(finalTotal.toFixed(2)),
    pnl: parseFloat(pnl.toFixed(2)),
    pnlPct: parseFloat(pnlPct),
    sharpeRatio: sharpe,
    hedgeActions: hedgeCount,
    rebalanceActions: rebalanceCount,
    aaveYieldEarned: parseFloat(aaveYieldTotal.toFixed(4)),
    days: fgiHistory.length,
    equity,
    summary: `Over ${fgiHistory.length} days: ${hedgeCount} HEDGE, ${rebalanceCount} REBALANCE. Aave yield: $${aaveYieldTotal.toFixed(4)}. Sharpe: ${sharpe}.`
  }
}
