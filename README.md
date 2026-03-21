# ⚓ XAU₮Anchor — Autonomous Gold-Hedge DeFi Agent

> The only autonomous agent that treats XAU₮ as a live economic instrument — not a static holding.

**[Tether Hackathon Galactica: WDK Edition 1](https://dorahacks.io/hackathon/hackathon-galactica-wdk-2026-01)**  
**Tracks:** Autonomous DeFi Agent · Lending Bot · Agent Wallets · Best Overall  
**Chain:** Polygon Amoy Testnet (Chain ID 80002)  
**Agent Wallet:** `0x11A14402B0dF1d90A631c795A27f164b9AfE2Dc6`  
**License:** Apache 2.0

---

## What It Does

XAU₮Anchor is a fully autonomous DeFi treasury agent that dynamically manages
a three-asset portfolio — USDT, XAU₮ (Tether Gold), and Aave V3 aUSDT — with
zero human input, every five minutes, with a full on-chain audit trail.

**Core thesis:** Gold and crypto are anti-correlated in fear markets. XAU₮ is
Tether's own gold-backed token. XAU₮Anchor is the first autonomous agent built
specifically around Tether's dual-asset vision.

## Live Demo Stats

| Metric | Value |
|--------|-------|
| Cycles completed | 14+ |
| Hedge actions | 8 |
| Aave V3 TXs | 3 confirmed on-chain |
| Avg LLM confidence | 8.3/10 |
| Equity curve | +27.81% during Extreme Fear |
| Agent status | Running autonomously |

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  Every 5 minutes — Zero human triggers                      │
│                                                             │
│  Oracle → Reason → Decide → Execute → Log → Sleep → Repeat │
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

## Economic Safeguards (12 total)

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
