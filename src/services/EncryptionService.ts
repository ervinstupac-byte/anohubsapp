/**
 * EncryptionService.ts
 * 
 * Encryption Wrapper
 * Updated to use Web Crypto / TextEncoder for Edge Runtime Compatibility.
 * (Node.js Buffer removed).
 */

export interface PQCMessage {
    id: string;
    encryptedPayload: string; // Base64
    pqcSignature: string;
    algorithm: 'KYBER-1024' | 'DILITHIUM-05';
    verified: boolean;
}

export class EncryptionService {

    // Polyfill for Edge environments if needed (simulateded here natively supported in modern JS)

    /**
     * ENCAPSULATE MESSAGE
     */
    public static encapsulate(
        payload: string,
        recipientPublicKey: string
    ): PQCMessage {
        // Universal Encoding
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);

        // Simulated Encryption: Base64 of bytes + Key ID
        // In real PQC, this calls the WASM implementation of Kyber
        let binaryString = '';
        data.forEach(byte => binaryString += String.fromCharCode(byte));
        const base64 = btoa(binaryString);

        const encrypted = `LAT_ENC_${base64}_${recipientPublicKey.slice(0, 4)}`;
        const signature = `DIL_SIG_${Date.now()}`;

        return {
            id: `MSG-${Date.now()}`,
            encryptedPayload: encrypted,
            pqcSignature: signature,
            algorithm: 'KYBER-1024',
            verified: false
        };
    }

    /**
     * DECAPSULATE
     */
    public static decapsulate(message: PQCMessage): string | null {
        if (!message.pqcSignature.startsWith('DIL_SIG')) {
            console.error('[PQC] 🛑 Signature Invalid');
            return null;
        }

        if (message.encryptedPayload.startsWith('LAT_ENC_')) {
            try {
                const base64 = message.encryptedPayload.split('_')[2];
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decoder = new TextDecoder();
                return decoder.decode(bytes);
            } catch (e) {
                console.error('[PQC] Decrypt failed', e);
                return null;
            }
        }

        return null;
    }
}
