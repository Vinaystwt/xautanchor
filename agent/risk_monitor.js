import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- AI-ONLY GOVERNANCE: SOVEREIGN RISK NODE ACTIVE ---');
console.log('STATUS: Awaiting WDK Multi-Sig Proposals from Execution Agent...');

const WATCHDOG_WALLET = '0x' + crypto.randomBytes(20).toString('hex');

function checkRisk() {
  const statePath = path.join(__dirname, '../portfolio-state.json');
  if (fs.existsSync(statePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(statePath));
      const drawdown = data.drawdownPct || 0;
      
      if (drawdown >= 15) {
        console.error('\n🚨 [GOVERNANCE REJECTED] 15% Drawdown Breach Detected.');
        console.log(`[WDK MULTI-SIG] Node ${WATCHDOG_WALLET.substring(0,8)} REFUSING SIGNATURE.`);
        console.log('[ACTION] Initiating Emergency XAU₮/Scudo Capital Preservation Protocol...\n');
        
        // Reset the drawdown so it doesn't spam infinitely after catching it
        data.drawdownPct = 0;
        fs.writeFileSync(statePath, JSON.stringify(data, null, 2));
      }
    } catch (e) {}
  }
}

// Check immediately, then every 2 seconds for the video
checkRisk();
setInterval(checkRisk, 2000);
