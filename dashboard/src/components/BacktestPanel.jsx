import { useState, useEffect } from 'react'
import axios from 'axios'

export default function BacktestPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:3001/api/backtest')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const T = {
    bgCard:'#0C1220', borderSubtle:'rgba(255,255,255,0.08)',
    borderFaint:'rgba(255,255,255,0.05)', gold:'#E8A020',
    teal:'#0ECFAA', purple:'#9B6EF3', red:'#F04A4A',
    textPrimary:'#F0F2F8', textSecondary:'#8892A4', textMuted:'#3E4860',
  }

  if (loading) return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.borderSubtle}`, borderRadius:16,
      padding:'20px 24px', marginBottom:16, textAlign:'center', color:T.textMuted, fontSize:13 }}>
      Loading 30-day historical simulation...
    </div>
  )

  if (!data) return null

  const isUp = data.pnlPct >= 0
  const sharpeColor = data.sharpeRatio > 1.5 ? T.teal : data.sharpeRatio > 0.5 ? T.gold : T.red

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.borderSubtle}`, borderRadius:16,
      padding:'20px 24px', marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em',
            textTransform:'uppercase', color:T.textMuted, marginBottom:4 }}>
            📊 30-Day Historical Simulation
          </div>
          <div style={{ fontSize:10, color:T.textMuted }}>
            Based on real Fear & Greed data · Same strategy logic · $200 starting capital
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:20, fontWeight:800, color: isUp ? T.teal : T.red }}>
            {isUp ? '+' : ''}{data.pnlPct}%
          </div>
          <div style={{ fontSize:10, color:T.textMuted }}>
            ${data.initialCapital} → ${data.finalValue}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
        {[
          { label:'Sharpe Ratio', value: data.sharpeRatio, color: sharpeColor, suffix:'' },
          { label:'HEDGE Actions', value: data.hedgeActions, color: T.gold, suffix:'' },
          { label:'REBALANCE', value: data.rebalanceActions, color: T.teal, suffix:'' },
          { label:'Aave Yield', value: `$${data.aaveYieldEarned}`, color: T.purple, suffix:'' },
          { label:'Days Simulated', value: data.days, color: T.textSecondary, suffix:'' },
        ].map(item => (
          <div key={item.label} style={{ background:'rgba(255,255,255,0.03)',
            border:`1px solid ${T.borderFaint}`, borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:10, color:T.textMuted, marginBottom:4 }}>{item.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:12, fontSize:10, color:T.textMuted, fontStyle:'italic',
        borderTop:`1px solid ${T.borderFaint}`, paddingTop:10 }}>
        ⚠️ Historical simulation uses Fear & Greed Index only (no live price data).
        Results are illustrative of strategy behavior, not financial advice.
        Sharpe ratio annualized from {data.days}-day period.
      </div>
    </div>
  )
}
