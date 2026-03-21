import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PortfolioPie({ usdt, xaut }) {
  const total = usdt + xaut
  const data = [
    { name: 'USDT', value: parseFloat(usdt.toFixed(2)), color: '#00D4AA' },
    { name: 'XAU₮', value: parseFloat(xaut.toFixed(2)), color: '#FFD700' }
  ]
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ margin: '0 0 8px', color: '#FFD700', fontSize: '0.9rem' }}>💼 Portfolio</h3>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e0e0e0' }}>${total.toFixed(2)}</div>
        <div style={{ fontSize: '0.75rem', color: '#555' }}>Total Value</div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            formatter={(v) => `$${v.toFixed(2)}`}
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
        {data.map(d => (
          <div key={d.name} style={{ textAlign: 'center' }}>
            <div style={{ color: d.color, fontWeight: 700 }}>${d.value.toFixed(2)}</div>
            <div style={{ fontSize: '0.7rem', color: '#555' }}>{d.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
