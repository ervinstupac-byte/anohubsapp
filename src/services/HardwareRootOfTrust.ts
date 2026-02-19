/**
 * HardwareRootOfTrust.ts
 * 
 * Simulated Hardware Security Module (HSM)
 * Ensures every control action is cryptographically signed.
 * Prevents unauthorized code execution or command injection.
 */

export interface SignedAction {
    actionId: string;
    payload: string;
    signature: string;
    publicKeyOfSender: string;
    verified: boolean;
}

export class HardwareRootOfTrust {
    // Simulated Keys (Normally stored in TPM/HSM)
    private static readonly TRUSTED_KEYS = [
        'PUB_KEY_SCADA_MASTER_01',
        'PUB_KEY_ENG_STATION_01'
    ];

    /**
     * VERIFY SIGNATURE (Simulated)
     */
    public static verifyAction(
        payload: string,
        signature: string,
        publicKey: string
    ): SignedAction {

        let verified = false;

        // 1. Check if Key is Trusted
        if (this.TRUSTED_KEYS.includes(publicKey)) {
            // 2. Verify Signature (Simulated crypto)
            // In real app: verify(payload, signature, publicKey)
            // Here: "valid_sig" is the magic string
            if (signature.startsWith('valid_sig_')) {
                verified = true;
            }
        }

        return {
            actionId: `ACT-${Date.now().toString().slice(-6)}`,
            payload,
            signature,
            publicKeyOfSender: publicKey,
            verified
        };
    }

    /**
     * GENERATE SIGNATURE (Simulated for testing)
     */
    public static signRequest(payload: string): string {
        return `valid_sig_${payload.length}_${Date.now()}`;
    }

    /**
     * SIGN STATE OBJECT (Digital Twin)
     * Creates a deterministic signature for an object
     */
    public static signState(state: any): string {
        try {
            // Deterministic stringify (simple)
            const payload = JSON.stringify(state, Object.keys(state).sort());
            // In reality: crypto.sign(payload, PRIVATE_KEY)
            // Here: Simulated hash + time
            const hash = this.simpleHash(payload);
            return `SIG-v1.${hash}.${Date.now().toString(36)}`;
        } catch (e) {
            console.error('Signing failed', e);
            return 'INVALID_SIGNATURE';
        }
    }

    /**
     * VERIFY STATE INTEGRITY
     */
    public static verifyState(state: any, signature: string): boolean {
        if (!signature || !signature.startsWith('SIG-v1.')) return false;

        try {
            const payload = JSON.stringify(state, Object.keys(state).sort());
            const currentHash = this.simpleHash(payload);

            // Extract hash from signature: SIG-v1.<HASH>.<TIMESTAMP>
            const parts = signature.split('.');
            if (parts.length !== 3) return false;

            const originalHash = parts[1];
            return originalHash === currentHash;
        } catch (e) {
            return false;
        }
    }

    private static simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }
}
