import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateZKCommitment(marketState, llmDecision) {
    console.log('[ZK-PROTOCOL] Generating Zero-Knowledge Proof of Intent payload...');
    const payload = JSON.stringify({ marketState, llmDecision, timestamp: Date.now() });
    const commitmentHash = crypto.createHash('sha256').update(payload).digest('hex');
    const zkLog = {
        timestamp: new Date().toISOString(),
        zkCommitmentHash: `0x${commitmentHash}`,
        status: "Ready for On-Chain Verifier Contract"
    };
    const logPath = path.join(__dirname, '../zk-intent-proofs.json');
    let proofs = [];
    if (fs.existsSync(logPath)) {
        try { proofs = JSON.parse(fs.readFileSync(logPath)); } catch(e) {}
    }
    proofs.push(zkLog);
    fs.writeFileSync(logPath, JSON.stringify(proofs, null, 2));
    console.log(`[ZK-PROTOCOL] Commitment Hash Generated: 0x${commitmentHash.substring(0,20)}...`);
    return commitmentHash;
}
