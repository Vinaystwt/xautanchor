import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 CHAOS TEST: Injecting Synthetic Market Crash...');

const statePath = path.join(__dirname, '../portfolio-state.json');
if(fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath));
    state.drawdownPct = 20;
    state.totalValueUSD = state.totalValueUSD * 0.8;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    console.log('CRASH INJECTED. Waiting for Sovereign Risk Node to detect...');
} else {
    console.log('portfolio-state.json not found. Run main agent first to generate it.');
}
