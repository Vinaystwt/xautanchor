export default function SignalCard({ signal, config }) {
  const getColor = (v) => v < 25 ? '#FF4444' : v < 45 ? '#FF8C00' : v < 55 ? '#FFD700' : v < 75 ? '#90EE90' : '#00D4AA'
  const getMoodEmoji = (m) => ({ EXTREME_FEAR: '😱', FEAR: '😰', NEUTRAL: '😐', GREED: '😁', EXTREME_GREED: '🤑' })[m] || '❓'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ margin: '0 0 12px', color: '#00D4AA', fontSize: '0.9rem' }}>📊 Market Signal</h3>
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: getColor(signal.fearGreedIndex) }}>
          {signal.fearGreedIndex}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#555' }}>Fear & Greed / 100</div>
        <div style={{ marginTop: '6px', fontSize: '1rem', color: getColor(signal.fearGreedIndex), fontWeight: 600 }}>
          {getMoodEmoji(signal.marketMood)} {signal.fearGreedLabel}
        </div>
      </div>
      <div style={{ background: '#222', borderRadius: '4px', height: '8px', marginBottom: '12px', overflow: 'hidden' }}>
        <div style={{
          width: `${signal.fearGreedIndex}%`, height: '100%',
          background: 'linear-gradient(90deg, #FF4444, #FFD700, #00D4AA)',
          borderRadius: '4px', transition: 'width 1s ease'
        }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[['BTC 24h', signal.btcChange24h], ['ETH 24h', signal.ethChange24h]].map(([label, val]) => (
          <div key={label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: parseFloat(val) >= 0 ? '#00D4AA' : '#FF4444' }}>
              {parseFloat(val) >= 0 ? '+' : ''}{val}%
            </div>
            <div style={{ fontSize: '0.65rem', color: '#555' }}>{label}</div>
          </div>
        ))}
      </div>
      {config && (
        <div style={{ marginTop: '10px', fontSize: '0.68rem', color: '#444', borderTop: '1px solid #222', paddingTop: '10px' }}>
          Hedge if FGI &lt; {config.volatilityHighThreshold} | Rebalance if FGI &gt; {config.volatilityLowThreshold}
        </div>
      )}
    </div>
  )
}
