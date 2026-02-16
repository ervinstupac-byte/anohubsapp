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
}
