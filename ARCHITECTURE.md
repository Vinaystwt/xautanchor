# XAU₮Anchor System Architecture

XAU₮Anchor is built as a closed-loop autonomous system. It combines off-chain intelligence with on-chain execution via Tether WDK.

## The Autonomous Loop

```mermaid
graph TD
    A[4-Source Oracle] -->|Market Data| B[ATR Calculator]
    B -->|Volatility Score| C[Composite Risk Score]
    C -->|JSON Payload| D[Groq LLM Llama 3.1]
    E[Portfolio State] --> D
    F[Live Aave APY] --> D
    D -->|Decision| G{Circuit Breaker}
    G -->|Passed| H[WDK Execution]
    G -->|Tripped| I[Force REBALANCE]
    H --> J[Decision Logger]
    J --> K[Dashboard API]
```

## Component Breakdown

1.  **Observation Layer (`oracle.js`, `aave.js`):** Pulls Fear & Greed, BTC/ETH/Gold prices, and real-time Aave lending rates.
2.  **Reasoning Layer (`reasoner.js`):** Uses Groq Cloud (Free Tier) to process data and output structured JSON decisions.
3.  **Safety Layer (`index.js`):** Intercepts LLM decisions if a 15% drawdown is detected.
4.  **Execution Layer (`wallet.js`, `swapper.js`, `aave.js`):** Uses WDK to sign and broadcast transactions to Polygon Amoy.
5.  **Audit Layer (`logger.js`):** Writes every thought and action to a permanent JSON log.
