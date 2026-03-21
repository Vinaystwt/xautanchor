import { getPortfolioSnapshot, executeSwap, executeAaveSupply, executeAaveWithdraw } from './wallet.js'
import { logAction } from './logger.js'
import { CONFIG } from './config.js'

// Dynamic target % based on LLM confidence
function getTargetFromConfidence(confidence, hedgePercentage) {
  if (confidence >= 9) return Math.min(80, hedgePercentage + 10) // Very high: +10%
  if (confidence >= 7) return hedgePercentage                    // Normal: target
  if (confidence >= 5) return Math.floor(hedgePercentage * 0.7)  // Moderate: -30%
  return Math.floor(hedgePercentage * 0.5)                       // Low: -50%
}

export async function executeHedge(decision, marketSignal) {
  console.log('\n🛡️ HEDGING: USDT → XAU₮')
  const portfolio = await getPortfolioSnapshot()

  // Withdraw from Aave first if needed
  let aaveTx = null
  if (portfolio.aaveSupplied > 1) {
    console.log(`   Withdrawing $${portfolio.aaveSupplied.toFixed(2)} from Aave first...`)
    aaveTx = await executeAaveWithdraw(portfolio.aaveSupplied)
  }

  const freshPortfolio = await getPortfolioSnapshot()

  // Dynamic sizing based on LLM confidence
  const dynamicTarget = getTargetFromConfidence(decision.confidence, CONFIG.hedgePercentage)
  const targetXautUSD = (freshPortfolio.total * dynamicTarget) / 100
  const swapAmount    = Math.max(0, targetXautUSD - freshPortfolio.xaut)

  if (swapAmount < 0.5) {
    console.log('⚠️ Already at target allocation.')
    return logAction({
      action: 'HOLD', reasoning: decision.reasoning,
      confidence: decision.confidence,
      note: 'Already hedged at target ratio',
      marketSignal: fmtSignal(marketSignal),
      portfolio: freshPortfolio, txHash: null
    })
  }

  const txResult = await executeSwap('USDT', 'XAU₮', swapAmount, 'HEDGE')

  return logAction({
    action:     'HEDGE',
    reasoning:  decision.reasoning,
    confidence: decision.confidence,
    urgency:    decision.urgency,
    riskLevel:  decision.riskLevel,
    keySignal:  decision.keySignal,
    marketSignal: fmtSignal(marketSignal),
    portfolio: {
      before:          { usdt: portfolio.usdt, xaut: portfolio.xaut, aaveSupplied: portfolio.aaveSupplied },
      swapAmount:      parseFloat(swapAmount.toFixed(2)),
      effectiveAmount: txResult.effectiveAmount,
      slippagePct:     txResult.slippagePct,
      gasCost:         txResult.gasCost,
      targetAllocation:`${dynamicTarget}% XAU₮ (confidence-adjusted)`,
      dynamicTarget
    },
    txHash:     txResult.hash,
    explorerUrl:txResult.explorerUrl,
    aaveTxHash: aaveTx?.hash || null,
    chain:      'Polygon Amoy'
  })
}

export async function executeRebalance(decision, marketSignal) {
  console.log('\n🔄 REBALANCING: XAU₮ → USDT')
  const portfolio = await getPortfolioSnapshot()

  if (portfolio.xaut < 0.5) {
    return executeHold(decision, marketSignal)
  }

  const txResult = await executeSwap('XAU₮', 'USDT', portfolio.xaut, 'REBALANCE')

  // After rebalance — supply idle USDT to Aave for yield
  let aaveTx = null
  const freshPortfolio = await getPortfolioSnapshot()
  const supplyAmount = freshPortfolio.usdt * 0.7  // supply 70% to Aave
  if (supplyAmount > 5) {
    console.log(`   Supplying $${supplyAmount.toFixed(2)} to Aave for yield...`)
    aaveTx = await executeAaveSupply(supplyAmount)
  }

  return logAction({
    action:     'REBALANCE',
    reasoning:  decision.reasoning,
    confidence: decision.confidence,
    urgency:    decision.urgency,
    riskLevel:  decision.riskLevel,
    keySignal:  decision.keySignal,
    marketSignal: fmtSignal(marketSignal),
    portfolio: {
      before:          { usdt: portfolio.usdt, xaut: portfolio.xaut },
      swapAmount:      parseFloat(portfolio.xaut.toFixed(2)),
      effectiveAmount: txResult.effectiveAmount,
      slippagePct:     txResult.slippagePct,
      gasCost:         txResult.gasCost,
      targetAllocation:'100% USDT → 70% to Aave for yield'
    },
    txHash:      txResult.hash,
    explorerUrl: txResult.explorerUrl,
    aaveTxHash:  aaveTx?.hash || null,
    aaveExplorer:aaveTx?.explorerUrl || null,
    chain:       'Polygon Amoy'
  })
}

export async function executeHold(decision, marketSignal) {
  const portfolio = await getPortfolioSnapshot()

  // HOLD = supply idle USDT to Aave to earn yield
  let aaveTx = null
  if (portfolio.usdt > 10 && portfolio.aaveSupplied < portfolio.usdt * 0.5) {
    const supplyAmt = portfolio.usdt * 0.6
    console.log(`   HOLD: Supplying $${supplyAmt.toFixed(2)} idle USDT to Aave V3 for yield...`)
    aaveTx = await executeAaveSupply(supplyAmt)
  }

  const freshPortfolio = await getPortfolioSnapshot()

  return logAction({
    action:     'HOLD',
    reasoning:  decision.reasoning + (aaveTx ? ' Idle USDT supplied to Aave V3 for yield while holding.' : ''),
    confidence: decision.confidence,
    urgency:    decision.urgency,
    riskLevel:  decision.riskLevel,
    keySignal:  decision.keySignal,
    marketSignal: fmtSignal(marketSignal),
    portfolio:  freshPortfolio,
    txHash:     null,
    aaveTxHash: aaveTx?.hash || null,
    aaveExplorer:aaveTx?.explorerUrl || null,
    aaveAction: aaveTx ? `Supplied $${(portfolio.usdt*0.6).toFixed(2)} USDT to Aave V3` : null
  })
}

function fmtSignal(s) {
  return {
    fearGreedIndex: s.fearGreedIndex,
    fearGreedLabel: s.fearGreedLabel,
    marketMood:     s.marketMood,
    btcChange24h:   s.btcChange24h,
    ethChange24h:   s.ethChange24h,
    goldChange24h:  s.goldChange24h,
    volatilityScore:s.volatilityScore
  }
}
