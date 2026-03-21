export default function ScaleNote() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(14,207,170,0.05)',
      border: '1px solid rgba(14,207,170,0.15)',
      borderRadius: 10,
      padding: '10px 16px',
      marginBottom: 16,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ECFAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <span style={{ fontSize: 11, color: '#8892A4', lineHeight: 1.5 }}>
        Running on Polygon Amoy testnet with $200 demo capital.{' '}
        <strong style={{ color: '#0ECFAA' }}>Architecture is capital-size invariant</strong>
        {' '}— economic thresholds, risk formula, and WDK modules scale to any treasury size.
        Deploy on mainnet with a DAO treasury of $10,000, $100,000, or more with zero structural changes.
      </span>
    </div>
  )
}
