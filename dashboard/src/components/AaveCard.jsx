export default function AaveCard({ portfolio }) {
  const supplied = portfolio?.aaveSupplied || 0
  const total = (portfolio?.usdt || 0) + supplied + (portfolio?.xaut || 0)
  const aavePct = total > 0 ? ((supplied / total) * 100).toFixed(1) : 0
  const apy = portfolio?.aaveAPY || 3.85
  const dailyEarning = supplied > 0 ? (supplied * (apy / 100) / 365) : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(155,110,243,0.12), rgba(14,207,170,0.06))',
      border: '1px solid rgba(155,110,243,0.3)',
      borderRadius: 12,
      padding: '12px 14px',
      marginTop: 8,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(155,110,243,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B6EF3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#9B6EF3' }}>
              Aave V3 — {apy}% APY
            </div>
            <div style={{ fontSize:10, color:'#3E4860' }}>
              {supplied > 0
                ? `$${dailyEarning.toFixed(4)}/day earning`
                : 'Supply USDT to earn yield'}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#F0F2F8' }}>
            ${supplied.toFixed(2)}
          </div>
          <div style={{ fontSize:10, color:'#9B6EF3' }}>{aavePct}% deployed</div>
        </div>
      </div>
      {supplied > 0 && (
        <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid rgba(155,110,243,0.15)',
          display:'flex', justifyContent:'space-between', fontSize:10, color:'#3E4860' }}>
          <span>Monthly est: <strong style={{ color:'#9B6EF3' }}>${(supplied * apy / 100 / 12).toFixed(2)}</strong></span>
          <span>Annual est: <strong style={{ color:'#9B6EF3' }}>${(supplied * apy / 100).toFixed(2)}</strong></span>
        </div>
      )}
    </div>
  )
}
