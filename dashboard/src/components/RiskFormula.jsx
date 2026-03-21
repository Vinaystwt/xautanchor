export default function RiskFormula({ signal }) {
  const fgi = signal?.fearGreedIndex ?? 50
  const btc = Math.abs(parseFloat(signal?.btcChange24h || 0))
  const eth = Math.abs(parseFloat(signal?.ethChange24h || 0))
  const atr = parseFloat(signal?.atrScore || 0)

  const fgiComponent  = ((100 - fgi) * 0.5).toFixed(1)
  const btcComponent  = (btc * 2.0).toFixed(1)
  const ethComponent  = (eth * 1.5).toFixed(1)
  const atrComponent  = (atr * 0.3).toFixed(1)
  const total = parseFloat(signal?.volatilityScore || 0)

  const T = {
    bgCard:'#0C1220', borderFaint:'rgba(255,255,255,0.05)',
    textMuted:'#3E4860', textSecondary:'#8892A4', textPrimary:'#F0F2F8',
    gold:'#E8A020', teal:'#0ECFAA', red:'#F04A4A', orange:'#F07B20', purple:'#9B6EF3'
  }

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.borderFaint}`, borderRadius:12, padding:'14px 16px', marginTop:8 }}>
      <div style={{ fontSize:10, color:T.textMuted, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:10 }}>
        Composite Risk Formula
      </div>
      <div style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:11, lineHeight:1.8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', borderBottom:`1px solid ${T.borderFaint}` }}>
          <span style={{ color:T.textSecondary }}>(100 - FGI) × 0.5</span>
          <span style={{ color:T.red, fontWeight:700 }}>= {fgiComponent}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', borderBottom:`1px solid ${T.borderFaint}` }}>
          <span style={{ color:T.textSecondary }}>|BTC 24h| × 2.0</span>
          <span style={{ color:T.orange, fontWeight:700 }}>= {btcComponent}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', borderBottom:`1px solid ${T.borderFaint}` }}>
          <span style={{ color:T.textSecondary }}>|ETH 24h| × 1.5</span>
          <span style={{ color:T.orange, fontWeight:700 }}>= {ethComponent}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', borderBottom:`1px solid ${T.borderFaint}` }}>
          <span style={{ color:T.textSecondary }}>ATR × 0.3</span>
          <span style={{ color:T.purple, fontWeight:700 }}>= {atrComponent}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0 0', marginTop:2 }}>
          <span style={{ color:T.textPrimary, fontWeight:700 }}>RISK SCORE</span>
          <span style={{ color: total > 70 ? T.red : total > 40 ? T.orange : T.teal, fontWeight:800, fontSize:14 }}>{total}</span>
        </div>
      </div>
    </div>
  )
}
