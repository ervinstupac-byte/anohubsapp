/**
 * ProtocolAnomalyDetector.ts
 * 
 * ICS/SCADA Traffic Monitor
 * Detects Modbus/IEC 61850 anomalies:
 * - Irregular polling intervals (Jitter)
 * - Unauthorized Write commands
 * - Replay attacks (Old timestamps)
 */

export interface NetworkPacket {
    sourceIp: string;
    protocol: 'MODBUS' | 'IEC61850' | 'DNP3';
    functionCode: string; // e.g. 'WRITE_REGISTER'
    register: string;
    timestamp: number;
}

export interface AnomalyReport {
    timestamp: number;
    type: 'SPOOFING' | 'REPLAY' | 'SCANNING' | 'NONE';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    details: string;
}

export class ProtocolAnomalyDetector {
    private static whitelistIPs = ['192.168.1.100', '192.168.1.101']; // SCADA Masters
    private static lastPacketTime: Map<string, number> = new Map();

    /**
     * INSPECT PACKET
     */
    public static inspect(packet: NetworkPacket): AnomalyReport {
        const now = Date.now();

        // 1. IP Whitelist Check
        if (!this.whitelistIPs.includes(packet.sourceIp)) {
            return {
                timestamp: now,
                type: 'SPOOFING',
                severity: 'CRITICAL',
                details: `Unauthorized Source IP ${packet.sourceIp} attempting ${packet.functionCode}`
            };
        }

        // 2. Replay Attack (Timestamp Check)
        // If packet timestamp is too old (> 2 sec latency), suspicious
        if (now - packet.timestamp > 2000) {
            return {
                timestamp: now,
                type: 'REPLAY',
                severity: 'WARNING',
                details: `Latency ${now - packet.timestamp}ms. Potential Replay Attack.`
            };
        }

        // 3. Polling Irregularity (Jitter)
        // If critical writes happen too fast (DoS)
        const last = this.lastPacketTime.get(packet.sourceIp) || 0;
        if (packet.functionCode.includes('WRITE') && (now - last) < 50) {
            return {
                timestamp: now,
                type: 'SCANNING',
                severity: 'WARNING',
                details: `High frequency WRITE commands detected`
            };
        }

        this.lastPacketTime.set(packet.sourceIp, now);

        return {
            timestamp: now,
            type: 'NONE',
            severity: 'INFO',
            details: 'Traffic Normal'
        };
    }
}
