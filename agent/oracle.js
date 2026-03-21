import axios from 'axios'

let cache = null
let cacheTime = 0
const CACHE_TTL = 4 * 60 * 1000

// Rolling window for ATR calculation
let priceHistory = []

export async function getMarketSignal() {
  if (cache && (Date.now() - cacheTime) < CACHE_TTL) {
    console.log(`📊 Cached (${Math.floor((Date.now()-cacheTime)/1000)}s old)`)
    return cache
  }

  let fearGreedValue = 50, fearGreedLabel = 'Neutral'
  let btcChange=0, ethChange=0, goldChange=0
  let btcPrice=0, ethPrice=0, goldPrice=0
  let apiErrors=[]

  // Fear & Greed
  try {
    const r = await axios.get('https://api.alternative.me/fng/?limit=1', { timeout: 8000 })
    fearGreedValue = parseInt(r.data.data[0].value)
    fearGreedLabel = r.data.data[0].value_classification
  } catch(e) { apiErrors.push('FGI:'+e.message) }

  // Prices — cascade through 3 sources
  let fetched = false
  for (const fetcher of [fetchCoinGecko, fetchBinance, fetchCryptoCompare]) {
    if (fetched) break
    try {
      const r = await fetcher()
      if (r.btcPrice > 0) {
        ;({ btcPrice, ethPrice, goldPrice, btcChange, ethChange, goldChange } = r)
        fetched = true
      }
    } catch(e) { apiErrors.push(e.message) }
  }

  // Rolling ATR (Average True Range proxy — std dev of last 10 prices)
  priceHistory.push(btcPrice)
  priceHistory = priceHistory.slice(-10)
  let atrScore = 0
  if (priceHistory.length >= 3) {
    const mean = priceHistory.reduce((a,b)=>a+b,0) / priceHistory.length
    const variance = priceHistory.reduce((s,v)=>s+(v-mean)**2,0) / priceHistory.length
    const stdDev = Math.sqrt(variance)
    atrScore = Math.min(100, (stdDev / mean) * 1000)  // normalize to 0-100
  }

  // Composite risk score (now includes ATR)
  const volatilityScore = Math.min(100, Math.max(0,
    (100 - fearGreedValue) * 0.5 +
    (Math.abs(btcChange)  * 2.0) +
    (Math.abs(ethChange)  * 1.5) +
    (atrScore             * 0.3)
  ))

  const signal = {
    fearGreedIndex:  fearGreedValue,
    fearGreedLabel,
    btcChange24h:    parseFloat(btcChange).toFixed(2),
    ethChange24h:    parseFloat(ethChange).toFixed(2),
    goldChange24h:   parseFloat(goldChange).toFixed(2),
    btcPrice:        parseFloat(btcPrice).toFixed(0),
    ethPrice:        parseFloat(ethPrice).toFixed(0),
    goldPrice:       parseFloat(goldPrice).toFixed(0),
    volatilityScore: parseFloat(volatilityScore).toFixed(1),
    atrScore:        parseFloat(atrScore).toFixed(1),
    timestamp:       new Date().toISOString(),
    apiErrors:       apiErrors.length>0 ? apiErrors : undefined,
    marketMood:
      fearGreedValue < 25 ? 'EXTREME_FEAR' :
      fearGreedValue < 45 ? 'FEAR'         :
      fearGreedValue < 55 ? 'NEUTRAL'      :
      fearGreedValue < 75 ? 'GREED'        : 'EXTREME_GREED'
  }

  cache = signal
  cacheTime = Date.now()
  console.log(`📊 Oracle: ${fearGreedLabel} (${fearGreedValue}/100) | BTC: $${parseInt(btcPrice).toLocaleString()} (${parseFloat(btcChange).toFixed(2)}%) | ATR: ${atrScore.toFixed(1)} | Risk: ${volatilityScore.toFixed(1)}`)
  return signal
}

async function fetchCoinGecko() {
  const r = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether-gold&vs_currencies=usd&include_24hr_change=true',
    { timeout: 8000 }
  )
  return {
    btcPrice:  r.data.bitcoin?.usd || 0,
    ethPrice:  r.data.ethereum?.usd || 0,
    goldPrice: r.data['tether-gold']?.usd || 0,
    btcChange: r.data.bitcoin?.usd_24h_change || 0,
    ethChange: r.data.ethereum?.usd_24h_change || 0,
    goldChange:r.data['tether-gold']?.usd_24h_change || 0,
  }
}

async function fetchBinance() {
  const [b,e] = await Promise.all([
    axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', { timeout: 6000 }),
    axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT', { timeout: 6000 }),
  ])
  return {
    btcPrice:  parseFloat(b.data.lastPrice),
    btcChange: parseFloat(b.data.priceChangePercent),
    ethPrice:  parseFloat(e.data.lastPrice),
    ethChange: parseFloat(e.data.priceChangePercent),
    goldPrice: 0, goldChange: 0,
  }
}

async function fetchCryptoCompare() {
  const r = await axios.get(
    'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,XAUT&tsyms=USD',
    { timeout: 6000 }
  )
  const raw = r.data.RAW
  return {
    btcPrice:  raw?.BTC?.USD?.PRICE || 0,
    btcChange: raw?.BTC?.USD?.CHANGEPCT24HOUR || 0,
    ethPrice:  raw?.ETH?.USD?.PRICE || 0,
    ethChange: raw?.ETH?.USD?.CHANGEPCT24HOUR || 0,
    goldPrice: raw?.XAUT?.USD?.PRICE || 0,
    goldChange:raw?.XAUT?.USD?.CHANGEPCT24HOUR || 0,
  }
}

// Export Aave APY getter for use in API
export { getAaveAPY } from './aave.js'
