import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function HistoryChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: '#444'
      }}>
        <h3 style={{ color: '#e0e0e0', fontSize: '0.9rem', margin: '0 0 12px' }}>📈 Portfolio History</h3>
        Waiting for more cycles to build history...
      </div>
    )
  }

  const data = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString(),
    USDT: parseFloat(h.usdt.toFixed(2)),
    'XAU₮': parseFloat(h.xaut.toFixed(2)),
    Total: parseFloat(h.total.toFixed(2))
  }))

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#e0e0e0', fontSize: '0.9rem' }}>
        📈 Portfolio History
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="usdtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="xautGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#555' }} />
          <YAxis tick={{ fontSize: 10, fill: '#555' }} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px', fontSize: '0.8rem' }}
            formatter={(v) => `$${v.toFixed(2)}`}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Area type="monotone" dataKey="USDT" stroke="#00D4AA" fill="url(#usdtGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="XAU₮" stroke="#FFD700" fill="url(#xautGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
