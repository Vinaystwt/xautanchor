export default function StatusBar({ status, onTrigger, triggering }) {
  const statusColor = {
    RUNNING: '#00D4AA',
    IDLE: '#4CAF50',
    ERROR: '#FF5722',
    INITIALIZING: '#FF9800'
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '2px' }}>STATUS</div>
          <div style={{ color: statusColor[status?.status] || '#888', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor[status?.status] || '#888' }} />
            {status?.status || 'CONNECTING...'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '2px' }}>CYCLES</div>
          <div style={{ fontWeight: 700, color: '#e0e0e0' }}>{status?.cycleCount || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '2px' }}>NETWORK</div>
          <div style={{ fontWeight: 700, color: '#00D4AA', fontSize: '0.85rem' }}>Polygon Amoy</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '2px' }}>WALLET</div>
          <div style={{ fontWeight: 700, color: '#888', fontSize: '0.7rem', fontFamily: 'monospace' }}>
            {status?.walletAddress ? `${status.walletAddress.slice(0,8)}...${status.walletAddress.slice(-6)}` : '...'}
          </div>
        </div>
      </div>
      <button
        onClick={onTrigger}
        disabled={triggering}
        style={{
          background: triggering ? '#333' : 'linear-gradient(135deg, #FFD700, #FF8C00)',
          color: triggering ? '#666' : '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 700,
          cursor: triggering ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem'
        }}
      >
        {triggering ? '⏳ Running...' : '⚡ Trigger Cycle'}
      </button>
    </div>
  )
}
