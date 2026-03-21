export default function MainnetBadge() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14,207,170,0.08), rgba(232,160,32,0.08))',
      border: '1px solid rgba(14,207,170,0.25)',
      borderRadius: 12,
      padding: '14px 18px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }}>
      <div style={{ fontSize: 20, flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ECFAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color:'#0ECFAA', marginBottom:4 }}>
          Mainnet Ready — Zero Code Changes Required
        </div>
        <div style={{ fontSize:11, color:'#8892A4', lineHeight:1.6 }}>
          XAU₮ has zero DEX liquidity on any EVM testnet (mainnet-only asset).
          Swaps are simulated with identical logic. The{' '}
          <code style={{ color:'#E8A020', background:'rgba(232,160,32,0.1)', padding:'1px 4px', borderRadius:3 }}>
            wdk-protocol-swap-velora-evm
          </code>{' '}
          module is fully wired — flip the RPC URL to deploy on Polygon mainnet.
          Aave V3 supply/withdraw TXs are real on-chain actions.
        </div>
      </div>
    </div>
  )
}
