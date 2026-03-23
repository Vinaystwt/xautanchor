const fs = require('fs');
const path = require('path');

console.log('🔥 CHAOS TEST: Injecting Synthetic Market Crash...');

const statePath = path.join(__dirname, '../portfolio-state.json');
const state = JSON.parse(fs.readFileSync(statePath));

// Simulate a 20% drawdown instantly
state.drawdownPct = 20;
state.totalValueUSD = state.totalValueUSD * 0.8;

fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

console.log('CRASH INJECTED. Waiting for Risk Monitor to detect...');
