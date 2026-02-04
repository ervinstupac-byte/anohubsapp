import { AlertJournal } from './AlertJournal';
import { EventJournal } from './EventJournal';

export class LedgerService {
    // Local signing wrapper: creates an ephemeral keypair, signs payload, and triggers download
    static async signAndExportAudit(payload: any) {
        try {
            const canonical = JSON.stringify(payload);
            const enc = new TextEncoder().encode(canonical);

            // Generate ephemeral ECDSA P-256 key pair
            const keyPair = await crypto.subtle.generateKey(
                { name: 'ECDSA', namedCurve: 'P-256' },
                true,
                ['sign', 'verify']
            );

            const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keyPair.privateKey, enc);
            const sigArray = Array.from(new Uint8Array(signature));
            const sigB64 = btoa(String.fromCharCode(...sigArray));

            const pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

            const exportObj = {
                payload,
                signature: sigB64,
                publicKey: pubJwk,
                algorithm: 'ECDSA-P256-SHA256',
                timestamp: Date.now()
            };

            // Persist event to EventJournal
            try { EventJournal.append('AUDIT_EXPORT', { summary: 'EXPORT', meta: { size: canonical.length }, ts: Date.now() }); } catch (e) { /* swallow */ }

            AlertJournal.logEvent('INFO', 'Audit exported with local signature', 'LEDGER_SERVICE');

            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            return exportObj;
        } catch (err) {
            AlertJournal.logEvent('CRITICAL', `Ledger signing/export failed: ${String(err)}`, 'LEDGER_SERVICE');
            throw err;
        }
    }
}

export default LedgerService;
