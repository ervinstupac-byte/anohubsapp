/**
 * HVShield.ts
 * 
 * High Voltage Substation Protection & Diagnostics
 * Integrates DGA (Dissolved Gas Analysis) for transformers
 * Maps protection relay statuses and monitors switchyard hotspots
 */

export interface DGAAnalysis {
    transformerId: string;
    sampleDate: number;
    gases: {
        hydrogen: number; // ppm
        methane: number; // ppm
        ethane: number; // ppm
        ethylene: number; // ppm
        acetylene: number; // ppm
        carbonMonoxide: number; // ppm
        carbonDioxide: number; // ppm
    };
    diagnosis: 'NORMAL' | 'THERMAL_FAULT' | 'PARTIAL_DISCHARGE' | 'ARCING' | 'CRITICAL';
    tdcg: number; // Total Dissolved Combustible Gas
    recommendation: string;
}

export interface ProtectionRelay {
    relayId: string;
    type: '87T' | '51' | '50' | '27' | '59' | '81O/U' | 'DIFF';
    description: string;
    status: 'NORMAL' | 'PICKUP' | 'TRIP' | 'FAULT' | 'OFFLINE';
    lastOperation: number;
}

export interface HotspotAlert {
    location: string;
    temperature: number; // °C
    threshold: number; // °C
    severity: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
    timestamp: number;
}

export class HVShield {
    private static dgaRecords: Map<string, DGAAnalysis[]> = new Map();
    private static protectionRelays: Map<string, ProtectionRelay> = new Map();
    private static hotspots: HotspotAlert[] = [];

    /**
     * Initialize protection relays
     */
    public static initializeRelays(): void {
        console.log('[HVShield] Initializing protection relays...');

        // Main transformer protection
        this.registerRelay({
            relayId: 'RELAY-87T-TX1',
            type: '87T',
            description: 'Main Transformer Differential',
            status: 'NORMAL',
            lastOperation: 0
        });

        this.registerRelay({
            relayId: 'RELAY-51-TX1',
            type: '51',
            description: 'Transformer Overcurrent (Time)',
            status: 'NORMAL',
            lastOperation: 0
        });

        // Generator protection
        this.registerRelay({
            relayId: 'RELAY-87G-GEN1',
            type: 'DIFF',
            description: 'Generator Differential',
            status: 'NORMAL',
            lastOperation: 0
        });

        this.registerRelay({
            relayId: 'RELAY-81-GEN1',
            type: '81O/U',
            description: 'Generator Over/Under Frequency',
            status: 'NORMAL',
            lastOperation: 0
        });

        // Grid protection
        this.registerRelay({
            relayId: 'RELAY-50-GRID',
            type: '50',
            description: 'Grid Instantaneous Overcurrent',
            status: 'NORMAL',
            lastOperation: 0
        });

        console.log(`[HVShield] ${this.protectionRelays.size} relays initialized`);
    }

    /**
     * Register protection relay
     */
    private static registerRelay(relay: ProtectionRelay): void {
        this.protectionRelays.set(relay.relayId, relay);
    }

    /**
     * Perform DGA analysis on transformer
     */
    public static performDGA(
        transformerId: string,
        gases: DGAAnalysis['gases']
    ): DGAAnalysis {
        // Calculate TDCG (Total Dissolved Combustible Gas)
        const tdcg =
            gases.hydrogen +
            gases.methane +
            gases.ethane +
            gases.ethylene +
            gases.acetylene +
            gases.carbonMonoxide;

        // Diagnose transformer condition using Duval Triangle method (simplified)
        let diagnosis: DGAAnalysis['diagnosis'];
        let recommendation: string;

        // Acetylene indicates arcing
        if (gases.acetylene > 35) {
            diagnosis = 'ARCING';
            recommendation = 'CRITICAL: Arcing detected. Schedule immediate outage for internal inspection.';
        }
        // High ethylene indicates thermal fault
        else if (gases.ethylene > 100) {
            diagnosis = 'THERMAL_FAULT';
            recommendation = 'URGENT: Thermal fault detected. Check cooling system and load conditions.';
        }
        // High hydrogen with low hydrocarbons indicates partial discharge
        else if (gases.hydrogen > 150 && gases.ethylene < 50) {
            diagnosis = 'PARTIAL_DISCHARGE';
            recommendation = 'WARNING: Partial discharge activity. Monitor closely, schedule inspection within 3 months.';
        }
        // TDCG threshold check
        else if (tdcg > 720) {
            diagnosis = 'CRITICAL';
            recommendation = 'CRITICAL: TDCG exceeds 720 ppm. Immediate action required.';
        }
        else {
            diagnosis = 'NORMAL';
            recommendation = 'Normal operation. Continue routine monitoring.';
        }

        const analysis: DGAAnalysis = {
            transformerId,
            sampleDate: Date.now(),
            gases,
            diagnosis,
            tdcg,
            recommendation
        };

        // Store analysis
        if (!this.dgaRecords.has(transformerId)) {
            this.dgaRecords.set(transformerId, []);
        }
        this.dgaRecords.get(transformerId)!.push(analysis);

        // Alert if non-normal
        if (diagnosis !== 'NORMAL') {
            console.log(`[HVShield] 🔴 DGA ALERT: ${transformerId} - ${diagnosis}`);
            console.log(`  TDCG: ${tdcg.toFixed(0)} ppm`);
            console.log(`  ${recommendation}`);
        }

        return analysis;
    }

    /**
     * Update protection relay status
     */
    public static updateRelayStatus(
        relayId: string,
        status: ProtectionRelay['status']
    ): void {
        const relay = this.protectionRelays.get(relayId);
        if (!relay) return;

        relay.status = status;
        relay.lastOperation = Date.now();

        if (status === 'TRIP' || status === 'FAULT') {
            console.log(`[HVShield] ⚡ RELAY OPERATION: ${relayId} - ${status}`);
            console.log(`  Type: ${relay.type} (${relay.description})`);

            // Trigger appropriate response
            this.handleRelayTrip(relay);
        }
    }

    /**
     * Handle relay trip
     */
    private static handleRelayTrip(relay: ProtectionRelay): void {
        console.log('[HVShield] Protection relay trip response:');

        switch (relay.type) {
            case '87T':
                console.log('  → Transformer differential trip - CRITICAL');
                console.log('  → Do NOT attempt reclosure');
                console.log('  → Internal fault suspected - inspection required');
                break;
            case '50':
                console.log('  → Instantaneous overcurrent trip');
                console.log('  → Check for short circuit');
                console.log('  → Verify clearance before reclosure');
                break;
            case '81O/U':
                console.log('  → Frequency protection trip');
                console.log('  → Grid frequency abnormal');
                console.log('  → Wait for grid stabilization');
                break;
            default:
                console.log('  → Protection operation logged');
        }
    }

    /**
     * Monitor switchyard hotspots
     */
    public static monitorHotspot(
        location: string,
        temperature: number,
        threshold: number = 90 // °C
    ): HotspotAlert {
        let severity: HotspotAlert['severity'];

        if (temperature < threshold) {
            severity = 'NORMAL';
        } else if (temperature < threshold + 10) {
            severity = 'ELEVATED';
        } else if (temperature < threshold + 20) {
            severity = 'HIGH';
        } else {
            severity = 'CRITICAL';
        }

        const alert: HotspotAlert = {
            location,
            temperature,
            threshold,
            severity,
            timestamp: Date.now()
        };

        this.hotspots.push(alert);

        // Keep last 1000 readings
        if (this.hotspots.length > 1000) {
            this.hotspots.shift();
        }

        if (severity !== 'NORMAL') {
            console.log(`[HVShield] 🌡️ HOTSPOT: ${location} - ${temperature.toFixed(1)}°C (${severity})`);

            if (severity === 'CRITICAL') {
                console.log('  ⚠️ CRITICAL TEMPERATURE - Immediate action required');
                console.log('  → Reduce load or de-energize circuit');
                console.log('  → Inspect connection for poor contact');
            }
        }

        return alert;
    }

    /**
     * Get HV system status
     */
    public static getSystemStatus(): {
        transformers: { id: string; status: DGAAnalysis['diagnosis'] }[];
        relays: ProtectionRelay[];
        hotspots: HotspotAlert[];
        overallHealth: 'HEALTHY' | 'MONITORING' | 'WARNING' | 'CRITICAL';
    } {
        // Transformer status from latest DGA
        const transformers: { id: string; status: DGAAnalysis['diagnosis'] }[] = [];
        for (const [id, analyses] of this.dgaRecords.entries()) {
            const latest = analyses[analyses.length - 1];
            transformers.push({ id, status: latest.diagnosis });
        }

        // Relays
        const relays = Array.from(this.protectionRelays.values());

        // Recent hotspots (last hour)
        const hourAgo = Date.now() - 60 * 60 * 1000;
        const recentHotspots = this.hotspots.filter(h => h.timestamp >= hourAgo);

        // Overall health
        const criticalDGA = transformers.some(t => t.status === 'CRITICAL' || t.status === 'ARCING');
        const relayTrips = relays.some(r => r.status === 'TRIP' || r.status === 'FAULT');
        const criticalHotspots = recentHotspots.some(h => h.severity === 'CRITICAL');

        let overallHealth: 'HEALTHY' | 'MONITORING' | 'WARNING' | 'CRITICAL';
        if (criticalDGA || relayTrips || criticalHotspots) {
            overallHealth = 'CRITICAL';
        } else if (transformers.some(t => t.status !== 'NORMAL') || recentHotspots.some(h => h.severity === 'HIGH')) {
            overallHealth = 'WARNING';
        } else if (transformers.some(t => t.status === 'PARTIAL_DISCHARGE') || recentHotspots.some(h => h.severity === 'ELEVATED')) {
            overallHealth = 'MONITORING';
        } else {
            overallHealth = 'HEALTHY';
        }

        return { transformers, relays, hotspots: recentHotspots, overallHealth };
    }
}

// Initialize relays
// HVShield.initializeRelays(); // DISABLED: Call manually to avoid blocking startup
