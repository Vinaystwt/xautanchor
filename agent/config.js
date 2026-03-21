import dotenv from 'dotenv'
dotenv.config()

export const CONFIG = {
  seedPhrase: process.env.WDK_SEED_PHRASE,
  indexerBaseUrl: process.env.WDK_INDEXER_BASE_URL || 'https://wdk-api.tether.io',
  indexerApiKey: process.env.WDK_INDEXER_API_KEY,
  polygonRpc: process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology',
  groqApiKey: process.env.GROQ_API_KEY,
  volatilityHighThreshold: parseInt(process.env.VOLATILITY_HIGH_THRESHOLD) || 30,
  volatilityLowThreshold: parseInt(process.env.VOLATILITY_LOW_THRESHOLD) || 60,
  pollIntervalMinutes: parseInt(process.env.POLL_INTERVAL_MINUTES) || 5,
  hedgePercentage: parseInt(process.env.HEDGE_PERCENTAGE) || 70,
  port: parseInt(process.env.PORT) || 3001
}

const required = ['seedPhrase', 'groqApiKey']
for (const key of required) {
  if (!CONFIG[key]) {
    console.error(`Missing required config: ${key}`)
    process.exit(1)
  }
}
console.log('✅ Configuration loaded')
