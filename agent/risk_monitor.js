const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('--- AI-ONLY GOVERNANCE: SOVEREIGN RISK NODE ACTIVE ---');
console.log('STATUS: Awaiting WDK Multi-Sig Proposals from Execution Agent...');

const WATCHDOG_WALLET = '0x' + crypto.randomBytes(20).toString('hex');

setInterval(() => {
  const statePath = path.join(__dirname, '../portfolio-state.json');
  if (fs.existsSync(statePath)) {
    const data = JSON.parse(fs.readFileSync(statePath));
    const drawdown = data.drawdownPct || 0;
    
    if (drawdown >= 15) {
      console.error('\n🚨 [GOVERNANCE REJECTED] 15% Drawdown Breach Detected.');
      console.log(`[WDK MULTI-SIG] Node ${WATCHDOG_WALLET.substring(0,8)} REFUSING SIGNATURE.`);
      console.log('[ACTION] Initiating Emergency XAU₮/Scudo Capital Preservation Protocol...\n');
    } else {
      // Simulate standard governance approval
      const approvalHash = crypto.createHash('sha256').update(Date.now().toString()).digest('hex');
      console.log(`[GOVERNANCE APPROVED] Drawdown at ${drawdown}%. Co-signature granted: 0x${approvalHash.substring(0,16)}`);
    }
  }
}, 120000);
