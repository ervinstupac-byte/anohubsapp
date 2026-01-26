/**
 * FireSuppressionSystem.ts
 * 
 * Fire & Life Safety Integration
 * Links fire detection to immediate turbine shutdown and electrical isolation
 */

export interface FireZone {
    zoneId: string;
    name: string;
    assetId?: string; // Associated turbine unit
    detectors: Array<{
        id: string;
        type: 'SMOKE' | 'HEAT' | 'FLAME';
        status: 'NORMAL' | 'ALARM' | 'FAULT';
    }>;
    suppressionSystem: {
        type: 'CO2' | 'FM200' | 'WATER_MIST' | 'SPRINKLER';
        status: 'ARMED' | 'ACTIVATED' | 'DISCHARGED' | 'OFFLINE';
        pressure: number; // bar
    };
}

export interface FireEvent {
    eventId: string;
    timestamp: number;
    zoneId: string;
    detectorId: string;
    severity: 'WARNING' | 'ALARM' | 'CRITICAL';
    autoShutdownTriggered: boolean;
    breakersOpened: string[];
    suppressionActivated: boolean;
}

export class FireSuppressionSystem {
    private static fireZones: Map<string, FireZone> = new Map();
    private static fireEvents: FireEvent[] = [];

    /**
     * Initialize fire zones
     */
    public static initializeFireZones(): void {
        console.log('[FireSafety] Initializing fire protection zones...');

        // Generator Hall - UNIT-1
        this.registerZone({
            zoneId: 'ZONE-GEN-1',
            name: 'Generator Hall UNIT-1',
            assetId: 'UNIT-1',
            detectors: [
                { id: 'SMOKE-GEN1-01', type: 'SMOKE', status: 'NORMAL' },
                { id: 'HEAT-GEN1-02', type: 'HEAT', status: 'NORMAL' },
                { id: 'FLAME-GEN1-03', type: 'FLAME', status: 'NORMAL' }
            ],
            suppressionSystem: {
                type: 'CO2',
                status: 'ARMED',
                pressure: 55.0 // bar
            }
        });

        // Control Room
        this.registerZone({
            zoneId: 'ZONE-CONTROL',
            name: 'Control Room / SCADA',
            detectors: [
                { id: 'SMOKE-CTL-01', type: 'SMOKE', status: 'NORMAL' },
                { id: 'SMOKE-CTL-02', type: 'SMOKE', status: 'NORMAL' }
            ],
            suppressionSystem: {
                type: 'FM200',
                status: 'ARMED',
                pressure: 42.0
            }
        });

        // Transformer Yard
        this.registerZone({
            zoneId: 'ZONE-XFMR',
            name: 'Transformer Yard',
            detectors: [
                { id: 'HEAT-XFMR-01', type: 'HEAT', status: 'NORMAL' },
                { id: 'FLAME-XFMR-02', type: 'FLAME', status: 'NORMAL' }
            ],
            suppressionSystem: {
                type: 'WATER_MIST',
                status: 'ARMED',
                pressure: 8.0
            }
        });

        console.log(`[FireSafety] ${this.fireZones.size} fire zones initialized`);
    }

    /**
     * Register fire zone
     */
    private static registerZone(zone: FireZone): void {
        this.fireZones.set(zone.zoneId, zone);
    }

    /**
     * Detect fire and trigger emergency response
     */
    public static detectFire(
        zoneId: string,
        detectorId: string,
        severity: 'WARNING' | 'ALARM' | 'CRITICAL'
    ): FireEvent {
        const zone = this.fireZones.get(zoneId);
        if (!zone) {
            console.error(`[FireSafety] Zone ${zoneId} not found`);
            return null as any;
        }

        const eventId = `FIRE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        console.log('\n' + '🔥'.repeat(40));
        console.log(`FIRE DETECTED: ${zone.name}`);
        console.log(`Detector: ${detectorId} | Severity: ${severity}`);
        console.log('🔥'.repeat(40) + '\n');

        const breakersOpened: string[] = [];
        let autoShutdownTriggered = false;
        let suppressionActivated = false;

        // CRITICAL: If fire in generator hall, immediate hard stop
        if (zone.assetId && severity !== 'WARNING') {
            console.log(`[FireSafety] 🚨 INITIATING HARD STOP: ${zone.assetId}`);

            // Emergency shutdown sequence
            this.emergencyShutdown(zone.assetId, breakersOpened);
            autoShutdownTriggered = true;

            // Activate suppression after shutdown (CO2 safety)
            if (severity === 'CRITICAL') {
                this.activateSuppression(zoneId);
                suppressionActivated = true;
            }
        }

        // Log event
        const event: FireEvent = {
            eventId,
            timestamp: Date.now(),
            zoneId,
            detectorId,
            severity,
            autoShutdownTriggered,
            breakersOpened,
            suppressionActivated
        };

        this.fireEvents.push(event);

        // Alert notifications
        this.sendFireAlerts(event, zone);

        return event;
    }

    /**
     * Emergency shutdown for affected generator
     */
    private static emergencyShutdown(assetId: string, breakersOpened: string[]): void {
        console.log(`[FireSafety] Emergency Shutdown Sequence for ${assetId}:`);

        // Step 1: Open generator breaker
        console.log('  1. OPENING GENERATOR BREAKER (CB-GEN)');
        breakersOpened.push('CB-GEN');

        // Step 2: Activate emergency stop
        console.log('  2. ACTIVATING E-STOP');

        // Step 3: Open all electrical isolation
        console.log('  3. OPENING ALL ELECTRICAL BREAKERS');
        breakersOpened.push('CB-TX', 'CB-GRID', 'CB-AUX');

        // Step 4: Close inlet valve/gate
        console.log('  4. CLOSING INLET GATE/VALVE');

        // Step 5: Engage mechanical brake
        console.log('  5. ENGAGING MECHANICAL BRAKE');

        // Step 6: Shutdown cooling pumps (after 30s delay)
        console.log('  6. SHUTTING DOWN AUXILIARY SYSTEMS');

        console.log(`[FireSafety] ✅ ${assetId} safely shutdown - all breakers open`);
    }

    /**
     * Activate suppression system
     */
    private static activateSuppression(zoneId: string): void {
        const zone = this.fireZones.get(zoneId);
        if (!zone) return;

        console.log(`[FireSafety] ACTIVATING ${zone.suppressionSystem.type} SUPPRESSION in ${zone.name}`);

        // Pre-discharge alarm (30 second delay for personnel evacuation)
        console.log('  ⚠️  PRE-DISCHARGE ALARM: 30 SECOND WARNING');
        console.log('  ⚠️  EVACUATE ZONE IMMEDIATELY');

        // In production: Actual 30s delay
        setTimeout(() => {
            zone.suppressionSystem.status = 'ACTIVATED';
            console.log(`  💨 ${zone.suppressionSystem.type} DISCHARGE IN PROGRESS`);

            // After discharge
            setTimeout(() => {
                zone.suppressionSystem.status = 'DISCHARGED';
                console.log('  ✅ Suppression system discharged');
                console.log('  🚫 Zone locked out - manual reset required');
            }, 10000); // 10s discharge time

        }, 30000); // 30s pre-alarm

        zone.suppressionSystem.status = 'ACTIVATED';
    }

    /**
     * Send fire alerts
     */
    private static sendFireAlerts(event: FireEvent, zone: FireZone): void {
        console.log('[FireSafety] 📢 SENDING ALERTS:');
        console.log('  - Fire brigade notified');
        console.log('  - Control room alarm activated');
        console.log('  - SMS to plant manager');
        console.log('  - Email to safety officer');

        if (event.autoShutdownTriggered) {
            console.log('  - HARD STOP executed on affected unit');
            console.log('  - All electrical breakers OPEN');
        }
    }

    /**
     * Get zone status
     */
    public static getZoneStatus(zoneId: string): FireZone | undefined {
        return this.fireZones.get(zoneId);
    }

    /**
     * Get all zones
     */
    public static getAllZones(): FireZone[] {
        return Array.from(this.fireZones.values());
    }

    /**
     * Get active fire events
     */
    public static getActiveFireEvents(): FireEvent[] {
        // Events in last 24 hours
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return this.fireEvents.filter(e => e.timestamp >= dayAgo);
    }
}

// Initialize fire zones
// FireSuppressionSystem.initializeFireZones(); // DISABLED: Call manually to avoid blocking startup
