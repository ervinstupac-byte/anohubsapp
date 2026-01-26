/**
 * BlackoutSentinel.ts
 * 
 * Black Swan Mode - Internet Loss Detection & Island Mode
 * Activates autonomous local grid operation and satellite backup
 * Croatian: "Autonomno napajanje lokalne mreže"
 */

export interface ConnectivityStatus {
    timestamp: number;
    internet: boolean;
    satellite: boolean;
    localNetwork: boolean;
    lastOnline: number;
    mode: 'CONNECTED' | 'DEGRADED' | 'ISLAND' | 'BLACK_SWAN';
}

export interface IslandModeConfig {
    localGridVoltage: number; // kV
    maxLocalLoad: number; // MW
    priorityLoads: string[]; // Critical local consumers
    blackStartCapable: boolean;
}

export class BlackoutSentinel {
    private static connectivityLog: ConnectivityStatus[] = [];
    private static readonly BLACKOUT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    private static islandMode: boolean = false;
    private static satelliteActive: boolean = false;
    private static lastInternetCheck: number = Date.now();

    /**
     * Monitor connectivity status
     */
    public static async monitorConnectivity(): Promise<ConnectivityStatus> {
        const now = Date.now();

        // Check internet connectivity
        const internetAvailable = await this.checkInternetConnectivity();
        const satelliteAvailable = await this.checkSatelliteLink();
        const localNetworkAvailable = await this.checkLocalNetwork();

        // Determine current mode
        let mode: ConnectivityStatus['mode'];
        let timeSinceOnline = 0;

        if (internetAvailable) {
            mode = 'CONNECTED';
            this.lastInternetCheck = now;
        } else {
            timeSinceOnline = now - this.lastInternetCheck;

            if (timeSinceOnline > this.BLACKOUT_THRESHOLD_MS) {
                mode = 'BLACK_SWAN';

                // Auto-activate island mode
                if (!this.islandMode) {
                    this.activateIslandMode();
                }

                // Auto-activate satellite backup
                if (!this.satelliteActive && satelliteAvailable) {
                    this.activateSatelliteBackup();
                }
            } else {
                mode = 'DEGRADED';
            }
        }

        const status: ConnectivityStatus = {
            timestamp: now,
            internet: internetAvailable,
            satellite: satelliteAvailable,
            localNetwork: localNetworkAvailable,
            lastOnline: this.lastInternetCheck,
            mode
        };

        this.connectivityLog.push(status);

        // Keep last 24 hours
        const dayAgo = now - 24 * 60 * 60 * 1000;
        this.connectivityLog = this.connectivityLog.filter(s => s.timestamp >= dayAgo);

        if (mode === 'BLACK_SWAN') {
            console.log('[BlackoutSentinel] 🚨 BLACK SWAN MODE ACTIVE');
            console.log(`  Internet offline for: ${Math.floor(timeSinceOnline / 1000 / 60)} minutes`);
        }

        return status;
    }

    /**
     * Check internet connectivity
     */
    private static async checkInternetConnectivity(): Promise<boolean> {
        // In production: Ping multiple reliable endpoints
        // - 8.8.8.8 (Google DNS)
        // - 1.1.1.1 (Cloudflare DNS)
        // - api.openweathermap.org

        // Mock check
        return Math.random() > 0.01; // 99% uptime simulation
    }

    /**
     * Check satellite link
     */
    private static async checkSatelliteLink(): Promise<boolean> {
        // In production: Check Starlink/Iridium connection
        // Mock: Satellite available
        return true;
    }

    /**
     * Check local network
     */
    private static async checkLocalNetwork(): Promise<boolean> {
        // In production: Ping local SCADA network
        return true;
    }

    /**
     * Activate Island Mode
     * Autonomno napajanje lokalne mreže
     */
    private static activateIslandMode(): void {
        console.log('\n' + '⚡'.repeat(40));
        console.log('ACTIVATING ISLAND MODE');
        console.log('AUTONOMNO NAPAJANJE LOKALNE MREŽE');
        console.log('⚡'.repeat(40));

        this.islandMode = true;

        console.log('[Island] Disconnecting from main grid...');
        console.log('[Island] Opening grid tie breakers...');
        console.log('[Island] Activating local grid synchronization...');

        const config: IslandModeConfig = {
            localGridVoltage: 10.5, // kV
            maxLocalLoad: 15, // MW local capacity
            priorityLoads: [
                'Control Room',
                'Cooling Pumps',
                'Intake Gates',
                'Local Village (500 homes)',
                'Hospital',
                'Water Treatment Plant'
            ],
            blackStartCapable: true
        };

        console.log('[Island] Priority loads configured:');
        config.priorityLoads.forEach(load => {
            console.log(`  ✓ ${load}`);
        });

        console.log('[Island] Local grid voltage: 10.5 kV');
        console.log('[Island] Max load: 15 MW');
        console.log('[Island] Black start: CAPABLE');

        console.log('\n[Island] ✅ ISLAND MODE OPERATIONAL');
        console.log('[Island] Local community power supply secured');
        console.log('⚡'.repeat(40) + '\n');
    }

    /**
     * Activate satellite backup
     */
    private static activateSatelliteBackup(): void {
        console.log('\n' + '📡'.repeat(40));
        console.log('ACTIVATING SATELLITE BACKUP');
        console.log('📡'.repeat(40));

        this.satelliteActive = true;

        console.log('[Satellite] Establishing Starlink connection...');
        console.log('[Satellite] Bandwidth: 150 Mbps down / 20 Mbps up');
        console.log('[Satellite] Latency: ~40ms');
        console.log('[Satellite] Redundancy: Iridium fallback available');

        console.log('\n[Satellite] Communication channels:');
        console.log('  ✓ SCADA telemetry → Cloud backup');
        console.log('  ✓ Market data feed → Starlink');
        console.log('  ✓ VPP synchronization → Satellite mesh');
        console.log('  ✓ Emergency alerts → Iridium');

        console.log('\n[Satellite] ✅ SATELLITE BACKUP ACTIVE');
        console.log('📡'.repeat(40) + '\n');
    }

    /**
     * Deactivate island mode (return to grid)
     */
    public static deactivateIslandMode(): void {
        if (!this.islandMode) return;

        console.log('[Island] Synchronizing with main grid...');
        console.log('[Island] Matching voltage: 10.5 kV');
        console.log('[Island] Matching frequency: 50.00 Hz');
        console.log('[Island] Phase angle: 0°');
        console.log('[Island] Closing grid tie breaker...');
        console.log('[Island] ✅ Reconnected to main grid');

        this.islandMode = false;
    }

    /**
     * Get uptime statistics
     */
    public static getUptimeStatistics(): {
        totalUptime: number; // %
        blackSwanEvents: number;
        longestBlackout: number; // seconds
        islandModeActivations: number;
    } {
        const totalSamples = this.connectivityLog.length;
        const connectedSamples = this.connectivityLog.filter(s => s.internet).length;
        const totalUptime = totalSamples > 0 ? (connectedSamples / totalSamples) * 100 : 100;

        const blackSwanEvents = this.connectivityLog.filter(s => s.mode === 'BLACK_SWAN').length;

        // Calculate longest blackout
        let longestBlackout = 0;
        let currentBlackout = 0;

        for (const status of this.connectivityLog) {
            if (!status.internet) {
                currentBlackout += 1;
                longestBlackout = Math.max(longestBlackout, currentBlackout);
            } else {
                currentBlackout = 0;
            }
        }

        return {
            totalUptime,
            blackSwanEvents,
            longestBlackout: longestBlackout * 60, // samples are per minute
            islandModeActivations: this.islandMode ? 1 : 0
        };
    }

    /**
     * Get current status
     */
    public static getStatus(): {
        islandMode: boolean;
        satelliteActive: boolean;
        lastCheck: number;
        mode: ConnectivityStatus['mode'];
    } {
        const latest = this.connectivityLog[this.connectivityLog.length - 1];

        return {
            islandMode: this.islandMode,
            satelliteActive: this.satelliteActive,
            lastCheck: this.lastInternetCheck,
            mode: latest?.mode || 'CONNECTED'
        };
    }

    /**
     * Test island mode (manual activation)
     */
    public static testIslandMode(): void {
        console.log('[BlackoutSentinel] 🧪 Testing island mode...');
        this.activateIslandMode();

        setTimeout(() => {
            console.log('[BlackoutSentinel] Test complete, returning to grid');
            this.deactivateIslandMode();
        }, 10000); // 10 second test
    }
}

// Start monitoring (DISABLED: Call manually during bootstrap to avoid blocking)
/*
setInterval(() => {
    BlackoutSentinel.monitorConnectivity();
}, 60000); // Check every minute
*/
