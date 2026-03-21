export default function ActionFeed({ logs }) {
  const cfg = {
    HEDGE: { color: '#FFD700', bg: 'rgba(255,215,0,0.08)', icon: '🛡️', label: 'HEDGE TO GOLD' },
    REBALANCE: { color: '#00D4AA', bg: 'rgba(0,212,170,0.08)', icon: '🔄', label: 'REBALANCE TO USDT' },
    HOLD: { color: '#888', bg: 'rgba(136,136,136,0.08)', icon: '✋', label: 'HOLD POSITION' }
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px',
      maxHeight: '580px',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#e0e0e0', fontSize: '0.9rem' }}>🤖 Agent Actions</h3>
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#444', padding: '40px 0' }}>
          Agent initializing — first cycle running...
        </div>
      ) : logs.map((log, i) => {
        const c = cfg[log.action] || cfg.HOLD
        return (
          <div key={log.id || i} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ color: c.color, fontWeight: 700, fontSize: '0.8rem' }}>{c.icon} {c.label}</div>
              <div style={{ fontSize: '0.65rem', color: '#444' }}>
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: 1.5, marginBottom: '6px' }}>
              {log.reasoning}
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: '#555', flexWrap: 'wrap' }}>
              {log.marketSignal?.fearGreedIndex !== undefined && <span>FGI: {log.marketSignal.fearGreedIndex}/100</span>}
              {log.confidence && <span>Confidence: {log.confidence}/10</span>}
              {log.txHash && <span style={{ color: '#00D4AA' }}>TX: {log.txHash.slice(0, 12)}...</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
