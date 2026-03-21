export default function StatsBar({ logs, portfolio }) {
  const hedgeCount = logs.filter(l => l.action === 'HEDGE').length
  const rebalanceCount = logs.filter(l => l.action === 'REBALANCE').length
  const holdCount = logs.filter(l => l.action === 'HOLD').length
  const avgConfidence = logs.length > 0
    ? (logs.reduce((sum, l) => sum + (l.confidence || 0), 0) / logs.length).toFixed(1)
    : 0

  const xautPercent = portfolio?.total > 0
    ? ((portfolio.xaut / portfolio.total) * 100).toFixed(1)
    : 0

  const stats = [
    { label: 'HEDGE Actions', value: hedgeCount, color: '#FFD700', icon: '🛡️' },
    { label: 'REBALANCE Actions', value: rebalanceCount, color: '#00D4AA', icon: '🔄' },
    { label: 'HOLD Actions', value: holdCount, color: '#888', icon: '✋' },
    { label: 'Avg Confidence', value: `${avgConfidence}/10`, color: '#BB86FC', icon: '🧠' },
    { label: 'Gold Allocation', value: `${xautPercent}%`, color: '#FFD700', icon: '⚖️' },
    { label: 'Total Decisions', value: logs.length, color: '#e0e0e0', icon: '📊' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{s.icon}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: '0.62rem', color: '#555', marginTop: '2px' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
