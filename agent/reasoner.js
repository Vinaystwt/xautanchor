import Groq from 'groq-sdk'
import { CONFIG } from './config.js'

const groq = new Groq({ apiKey: CONFIG.groqApiKey })

export async function getAgentDecision({
  marketSignal, currentUSDT, currentXAUT, currentAaveSupplied,
  aaveAPY, lastAction, lastActionTime, cycleCount,
  highThreshold, lowThreshold
}) {
  const totalValue   = currentUSDT + currentXAUT + (currentAaveSupplied || 0)
  const xautPct      = totalValue > 0 ? ((currentXAUT / totalValue) * 100).toFixed(1) : 0
  const usdtPct      = totalValue > 0 ? ((currentUSDT / totalValue) * 100).toFixed(1) : 0
  const aavePct      = totalValue > 0 ? (((currentAaveSupplied || 0) / totalValue) * 100).toFixed(1) : 0

  const cyclesSince  = lastActionTime
    ? Math.floor((Date.now() - new Date(lastActionTime)) / (CONFIG.pollIntervalMinutes * 60 * 1000)) : 99
  const inCooldown   = cyclesSince < 2 && lastAction && lastAction !== 'HOLD'
  const hysteresisBand = 8

  // Aave yield economics
  const apy = aaveAPY || 3.85
  const dailyYieldRate = apy / 365 / 100
  const estimatedDailyYield = currentUSDT * dailyYieldRate
  const gasBreakeven = 0.15 / (currentUSDT * dailyYieldRate) // days to break even on gas

  const systemPrompt = `You are XAU₮Anchor, an elite autonomous DeFi treasury agent on Tether WDK.

MISSION: Maximize risk-adjusted returns by dynamically allocating between:
- USDT (liquid stablecoin — available for swaps)
- XAU₮ (Tether's gold-backed token — defensive hedge asset)
- Aave V3 aUSDT (currently earning ${apy}% APY — yield while holding)

ECONOMIC ARCHITECTURE:
1. HEDGE: Fear spike detected → withdraw Aave → swap USDT to XAU₮ (gold outperforms in fear)
2. REBALANCE: Recovery detected → swap XAU₮ to USDT → supply 70% to Aave for yield
3. HOLD: Neutral/ambiguous → supply idle USDT to Aave if gas breakeven < ${Math.ceil(gasBreakeven)} days

AAVE YIELD ECONOMICS (current):
- APY: ${apy}%
- Estimated daily yield on current USDT: $${estimatedDailyYield.toFixed(4)}
- Gas cost per supply tx: ~$0.15
- Break-even days: ${gasBreakeven.toFixed(1)}
- ONLY supply to Aave if breakeven < 45 days (i.e., amount > $14)

RISK RULES (strict):
1. HEDGE if: FGI < ${highThreshold - hysteresisBand} OR (FGI < ${highThreshold} AND ATR > 20)
2. REBALANCE if: FGI > ${lowThreshold + hysteresisBand}
3. HOLD if: signals mixed — but deploy idle USDT to Aave if economically justified
4. Max XAU₮: 80% of portfolio
5. Confidence 9-10 → full target; 7-8 → standard; 5-6 → 70% target; 1-4 → 50% target
6. COOLDOWN: ${inCooldown ? `ACTIVE — ${cyclesSince} cycles since last trade. Force HOLD.` : 'Clear'}

Respond ONLY with valid JSON. No markdown.`

  const userPrompt = `PORTFOLIO STATE:
- Available USDT: $${currentUSDT.toFixed(2)} (${usdtPct}%)
- Aave V3 Supply: $${(currentAaveSupplied || 0).toFixed(2)} @ ${apy}% APY (${aavePct}%)
- XAU₮ (Gold):   $${currentXAUT.toFixed(2)} (${xautPct}%)
- Total Value:   $${totalValue.toFixed(2)}

MARKET INTELLIGENCE:
- Fear & Greed:    ${marketSignal.fearGreedIndex}/100 (${marketSignal.fearGreedLabel})
- Market Mood:     ${marketSignal.marketMood}
- Composite Risk:  ${marketSignal.volatilityScore}/100
- ATR Volatility:  ${marketSignal.atrScore}/100
- BTC: $${marketSignal.btcPrice} (${marketSignal.btcChange24h}% 24h)
- ETH: $${marketSignal.ethPrice} (${marketSignal.ethChange24h}% 24h)
- XAU₮: $${marketSignal.goldPrice} (${marketSignal.goldChange24h}% 24h)

YIELD CONTEXT:
- Current Aave USDT APY: ${apy}%
- Est. daily yield on idle USDT: $${estimatedDailyYield.toFixed(4)}
- Supply economically justified: ${gasBreakeven < 45 ? "YES" : 'NO'} (breakeven ${gasBreakeven.toFixed(1)} days)

EXECUTION CONTEXT:
- Last action: ${lastAction || 'NONE'} (${cyclesSince} cycles ago)
- Cooldown active: ${inCooldown}
- Cycle number: ${cycleCount}

Respond with:
{
  "action": "HEDGE" | "REBALANCE" | "HOLD",
  "reasoning": "3-4 sentences citing specific numbers including APY and yield context",
  "confidence": 1-10,
  "targetXAUTPercent": 0-80,
  "urgency": "LOW"|"MEDIUM"|"HIGH",
  "keySignal": "single most important factor",
  "riskLevel": "LOW"|"MEDIUM"|"HIGH"|"EXTREME",
  "cooldownApplied": true|false,
  "aaveRecommendation": "SUPPLY"|"WITHDRAW"|"HOLD_CURRENT",
  "aaveEconomical": true|false
}`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    })

    let decision
    try {
      decision = JSON.parse(response.choices[0].message.content)
    } catch {
      return safeHold(xautPct)
    }

    if (inCooldown && decision.action !== 'HOLD') {
      decision.action = 'HOLD'
      decision.reasoning = `Cooldown active (${cyclesSince} cycles since last trade). ` + decision.reasoning
      decision.cooldownApplied = true
    }

    console.log(`🤖 Decision: ${decision.action} | Conf: ${decision.confidence}/10 | Risk: ${decision.riskLevel} | Aave: ${decision.aaveRecommendation} (economical: ${decision.aaveEconomical})`)
    console.log(`   Key: ${decision.keySignal}`)
    return decision

  } catch (error) {
    console.error('❌ LLM error:', error.message)
    return safeHold(xautPct)
  }
}

function safeHold(xautPct) {
  return {
    action: 'HOLD',
    reasoning: 'Safety fallback: LLM unavailable. Holding current allocation to protect capital.',
    confidence: 5,
    targetXAUTPercent: parseFloat(xautPct),
    urgency: 'LOW',
    keySignal: 'System fallback',
    riskLevel: 'LOW',
    cooldownApplied: false,
    aaveRecommendation: 'HOLD_CURRENT',
    aaveEconomical: false
  }
}
