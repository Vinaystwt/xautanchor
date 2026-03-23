# ⚓ XAU₮Anchor — Autonomous Gold-Hedge DeFi Agent
<h2>🧠 Architecture at a Glance</h2>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d8e7ddd2-4a1b-492d-9aca-e4c70cd8916f" 
       alt="XAU₮Anchor Architecture" 
       width="900"/>
</p>

<p align="center"><i>Multi-agent sovereign execution system with cryptographic guarantees</i></p>

> The only autonomous agent that treats XAU₮ as a live economic instrument — not a static holding.

**[Tether Hackathon Galactica: WDK Edition 1](https://dorahacks.io/hackathon/hackathon-galactica-wdk-2026-01)**  
**Tracks:** Autonomous DeFi Agent · Lending Bot · Agent Wallets · Best Overall  
**Chain:** Polygon Amoy Testnet (Chain ID 80002)  
**Agent Wallet:** `0x11A14402B0dF1d90A631c795A27f164b9AfE2Dc6`  
**License:** Apache 2.0

---


**The first fully sovereign, self-governing, Scudo-native DeFi treasury agent that pays for its own intelligence, enforces cryptographic multi-agent governance, and preserves capital with verifiable intent under Tether’s official unit of account.**

## 📖 Overview

XAU₮Anchor is a fully autonomous DeFi treasury agent that dynamically manages a three-asset portfolio — USDT, XAU₮ (Tether Gold), and Aave V3 aUSDT — with zero human input, executing on a 5-minute reasoning loop with a full on-chain audit trail.

**Core Thesis:** Gold and crypto are anti-correlated in fear markets. XAU₮ is Tether's own gold-backed token. XAU₮Anchor is the first autonomous agent built specifically around Tether's dual-asset vision to preserve capital during periods of high volatility.

## 🏛️ Sovereign Economic Infrastructure

XAU₮Anchor executes tasks autonomously, manages capital, and interacts with on-chain logic (WDK-native Aave V3 lending, x402 micropayments) under strictly defined constraints. Builders defined the rules. The agent does the work. Value settles on-chain.

To elevate XAU₮Anchor from a trading script to institutional-grade economic infrastructure, XAU₮Anchor four critical trust layers:
1. **AI-to-AI Governance (Multi-Sig):** Execution is decoupled from risk. The primary agent cannot execute trades without a cryptographic co-signature from an independent, sovereign Risk Node.
2. **Zero-Knowledge Intent Proofs:** Before any WDK transaction is signed, the agent generates a SHA-256 cryptographic commitment of its LLM reasoning (), establishing a verifiable off-chain prep layer.
3. **Self-Sustaining Economy:** The agent utilizes the x402 protocol to autonomously fund its own oracle data via USDT micropayments.
4. **Native Scudo Accounting:** All internal XAU₮ treasury balances are strictly denominated in **Scudo** (1 XAU₮ = 1000 Scudo), aligning directly with Tether's micro-treasury unit-of-account standards.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  Every 5 minutes — Zero human triggers                      │
│                                                             │
│  Oracle → Reason → Decide → Execute → Log → [Watchdog Check] → Repeat │
│  (4 src)  (Groq)  (12 rules) (WDK)  (TX hash)             │
└─────────────────────────────────────────────────────────────┘
```

**OBSERVE:** Fear & Greed Index + BTC/ETH/XAU₮ prices + ATR volatility + live Aave APY  
**REASON:** Groq LLM (llama-3.1-8b-instant, JSON mode, <200ms) with full portfolio context  
**DECIDE:** HEDGE / REBALANCE / HOLD with confidence-based sizing  
**EXECUTE:** WDK wallet signs TX → Aave supply/withdraw on-chain → swap simulated  
**LOG:** Full reasoning + TX hashes + Polygonscan links per decision  

## WDK Integration

| Module | Depth | Usage |
|--------|-------|-------|
| `@tetherto/wdk` | Deep | Core wallet orchestration |
| `@tetherto/wdk-wallet-evm` | Deep | Self-custodial Polygon wallet, TX signing |
| `@tetherto/wdk-protocol-lending-aave-evm` | Deep | Real Aave V3 supply/withdraw on Polygon Amoy |
| `@tetherto/wdk-protocol-swap-velora-evm` | Wired | USDT↔XAU₮ swap — mainnet-ready |
| WDK MCP Toolkit | Medium | LLM tool-calling interface |
| WDK Indexer API | Medium | Real-time POL balance |
| WDK Agent Skills | High | **OpenClaw** compatibility layer for autonomous skills |

## Economic Safeguards (15 total)

| # | Safeguard | What it does |
|---|-----------|-------------|
| 1 | Hysteresis band ±8pts | Prevents whipsaw at threshold boundaries |
| 2 | 2-cycle cooldown | Min 10 min between any two trades |
| 3 | Max 80% XAU₮ cap | Always keeps 20% liquid USDT |
| 4 | Confidence sizing | 9-10→80%, 7-8→70%, 5-6→49%, 1-4→35% |
| 5 | Composite risk score | (100-FGI)×0.5 + BTC×2.0 + ETH×1.5 + ATR×0.3 |
| 6 | Slippage simulation | 0.1-0.4% + $0.08-0.20 gas per swap |
| 7 | Live Aave APY oracle | Real APY fetched from protocol |
| 8 | Gas breakeven check | Only supplies Aave if economically justified |
| 9 | Liquidity check | Checks pool depth before any Aave withdrawal |
| 10 | 3-source oracle cascade | Never fails on single API outage |
| 11 | 15% drawdown circuit breaker | Emergency rebalance regardless of LLM |
| 12 | Auto-recovery | Self-heals in 30s after any error |
| 13 | Multi-Agent Watchdog | Independent risk_monitor.js agent runs every 120s |
| 14 | OpenClaw Skill Wrap | Standardized skill registration for WDK orchestration |
| 15 | Heartbeat Proof | Continuous uptime logging in heartbeat-log.json |


## 🛡️ Trust & Transparency: The Audit Trail
XAU₮Anchor provides a verifiable record of every autonomous decision:
- **[DECISIONS_AUDIT.md](./DECISIONS_AUDIT.md):** A living markdown document appended by the agent in real-time.
- **WDK Integration Audit:** Detailed mapping of every WDK module in [WDK_INTEGRATION.md](./WDK_INTEGRATION.md).
- **Heartbeat Log:** JSON-formatted uptime proof for 24/7 autonomous monitoring.

## Setup
```bash
git clone https://github.com/vinaystwt/xautanchor
cd xautanchor
npm install

cp .env.example .env
# Add: WDK_SEED_PHRASE, GROQ_API_KEY, POLYGON_RPC_URL

# Terminal 1 — Agent
node agent/index.js

# Terminal 2 — Dashboard
cd dashboard && npm install && npm run dev
# Opens at http://localhost:5173
```

## API Endpoints
```
GET  /api/status      — agent status, config, drawdown, circuit breaker
GET  /api/portfolio   — 3-asset balances + history + live Aave APY
GET  /api/logs        — all decisions with reasoning + TX hashes
GET  /api/signal      — live multi-source market signal + ATR
GET  /api/aave        — live Aave APY + available liquidity
GET  /api/backtest    — 30-day historical simulation + Sharpe ratio
GET  /api/health      — uptime, last error, recovery status
POST /api/trigger     — manual cycle trigger (demo)
POST /api/reset-circuit-breaker — reset circuit breaker
```

## On-Chain Execution: What's Real, What's Simulated

**Aave V3 (lending layer) — FULLY ON-CHAIN**

Supply and withdraw execute via `wdk-protocol-lending-aave-evm` and return
real transaction hashes on Polygon Amoy, verifiable on Polygonscan.
Three supply transactions confirmed at time of submission.

**Velora USDT↔XAU₮ Swap — MAINNET-READY, TESTNET-SIMULATED**

XAU₮ has no DEX liquidity on any EVM testnet — this is a Velora/ecosystem
infrastructure gap, not a code limitation. The production code is wired
and runs unmodified:
```javascript
import SwapVeloraEvm from '@tetherto/wdk-protocol-swap-velora-evm'
wdk.registerProtocol('swap-velora', SwapVeloraEvm)

await wdk.executeProtocol('swap-velora', {
  fromToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT — Polygon mainnet
  toToken:   '0x45804880De22913dAFE09f4980848ECE6EcbAf78', // XAU₮ — Polygon mainnet
  amount:    BigInt(Math.floor(amountUSD * 1e6)),
  slippageTolerance: 50
})
```

Swaps are simulated with realistic slippage (0.1-0.4%) and gas ($0.08-0.20).
Zero code changes required to run on Polygon mainnet when Velora pool exists.

## Tech Stack

- **WDK:** 6 modules in production use
- **LLM:** Groq API, llama-3.1-8b-instant, JSON mode, temp 0.1, <200ms
- **Oracle:** Alternative.me + Binance + CoinGecko + CryptoCompare (cascade)
- **Backend:** Node.js v24, Express.js
- **Frontend:** React + Vite, Recharts, pure SVG components
- **Chain:** Polygon Amoy Testnet (Chain ID 80002)


## 🎯 Track Coverage
* **Agent Wallets:** WDK-native wallet instantiation for both main agent and sovereign co-signer.
* **Autonomous DeFi Agent:** Three-asset portfolio with full autonomous rebalancing loop.
* **Lending Bot:** Aave V3 supply/withdraw via @tetherto/wdk-protocol-lending-aave-evm.
* **Best Overall:** Complete earn + spend + govern economic swarm architecture.
