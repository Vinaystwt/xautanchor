const fs = require('fs');
const path = require('path');

console.log('--- RISK MONITOR AGENT ACTIVE ---');

setInterval(() => {
  const statePath = path.join(__dirname, '../portfolio-state.json');
  if (fs.existsSync(statePath)) {
    const data = JSON.parse(fs.readFileSync(statePath));
    const drawdown = data.drawdownPct || 0;
    console.log(`RISK_MONITOR: Health check... Drawdown: ${drawdown}%`);
    if (drawdown >= 15) {
      console.error('RISK_MONITOR: [CRITICAL] 15% BREACH. SIGNALING MAIN AGENT.');
    }
  }
}, 120000);
