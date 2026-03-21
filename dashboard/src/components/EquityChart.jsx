import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function EquityChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div style={{
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:16,
        padding:'20px 24px',
        marginBottom:16
      }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em',
          textTransform:'uppercase', color:'#8892A4', marginBottom:12 }}>
          📈 Portfolio Equity Curve
        </div>
        <div style={{ textAlign:'center', color:'#3E4860', padding:'30px 0', fontSize:13 }}>
          Building history — trigger more cycles to see the equity curve
        </div>
      </div>
    )
  }

  const data = history.map((h, i) => ({
    cycle: `#${i + 1}`,
    Total: parseFloat(h.total?.toFixed(2) || 0),
    USDT:  parseFloat(h.usdt?.toFixed(2)  || 0),
    XAU:   parseFloat(h.xaut?.toFixed(2)  || 0),
    Aave:  parseFloat(h.aaveSupplied?.toFixed(2) || 0),
    action: h.action
  }))

  const startVal = data[0]?.Total || 200
  const endVal   = data[data.length - 1]?.Total || 200
  const pnl      = endVal - startVal
  const pnlPct   = ((pnl / startVal) * 100).toFixed(2)
  const isUp     = pnl >= 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#0C1220', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:8, padding:'10px 14px', fontSize:11 }}>
        <div style={{ color:'#8892A4', marginBottom:6 }}>Cycle {label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color:p.color, marginBottom:2 }}>
            {p.name}: <strong>${p.value?.toFixed(2)}</strong>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      background:'rgba(255,255,255,0.03)',
      border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:16,
      padding:'20px 24px',
      marginBottom:16
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em',
            textTransform:'uppercase', color:'#8892A4' }}>
            📈 Portfolio Equity Curve
          </div>
          <div style={{ fontSize:10, color:'#3E4860', marginTop:3 }}>
            Total value across all {history.length} autonomous cycles
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:20, fontWeight:800,
            color: isUp ? '#0ECFAA' : '#F04A4A' }}>
            {isUp ? '+' : ''}{pnl.toFixed(2)} ({isUp ? '+' : ''}{pnlPct}%)
          </div>
          <div style={{ fontSize:10, color:'#3E4860' }}>
            ${startVal.toFixed(2)} → ${endVal.toFixed(2)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top:5, right:5, left:-20, bottom:0 }}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor="#E8A020" stopOpacity={0.3}/>
              <stop offset="95%"  stopColor="#E8A020" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="xauGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor="#F5C048" stopOpacity={0.2}/>
              <stop offset="95%"  stopColor="#F5C048" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="cycle" tick={{ fontSize:9, fill:'#3E4860' }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize:9, fill:'#3E4860' }} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <ReferenceLine y={startVal} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4"/>
          <Area type="monotone" dataKey="Total" stroke="#E8A020" fill="url(#totalGrad)"
            strokeWidth={2} dot={false}/>
          <Area type="monotone" dataKey="XAU" stroke="#F5C048" fill="url(#xauGrad)"
            strokeWidth={1.5} dot={false}/>
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display:'flex', gap:16, marginTop:10, justifyContent:'center' }}>
        {[
          { color:'#E8A020', label:'Total Value' },
          { color:'#F5C048', label:'XAU₮ Allocation' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:12, height:2, background:l.color, borderRadius:1 }}/>
            <span style={{ fontSize:10, color:'#8892A4' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
