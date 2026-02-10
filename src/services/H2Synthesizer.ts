/**
 * H2Synthesizer.ts
 * 
 * Hydrogen Storage & Electrolysis Management
 * Produces H2 during island mode or zero-demand periods
 * Maintains 100% fuel cell readiness for robotic units
 */

import { SovereignGlobalState } from './SovereignGlobalState';

export interface ElectrolysisSession {
    sessionId: string;
    startTime: number;
    endTime: number | null;
    powerInput: number; // kW
    h2Produced: number; // Nm³ (normal cubic meters)
    efficiency: number; // %
    trigger: 'ISLAND_MODE' | 'ZERO_DEMAND' | 'SCHEDULED' | 'MANUAL';
    status: 'RUNNING' | 'COMPLETED' | 'STOPPED';
}

export interface H2Storage {
    timestamp: number;
    volume: number; // Nm³
    pressure: number; // bar
    purity: number; // %
    capacity: number; // Nm³ max
    fillLevel: number; // %
}

export interface FuelCellStatus {
    unitId: string; // ROV-001, UAV-THERMAL-01, etc.
    fuelCellType: 'PEM' | 'SOFC';
    h2Consumption: number; // Nm³/hour
    runtime: number; // hours per tank
    lastRefuel: number;
    readiness: 'READY' | 'LOW_FUEL' | 'EMPTY';
}

export class H2Synthesizer {
    private static readonly ELECTROLYZER_CAPACITY = 100; // kW
    private static readonly EFFICIENCY = 0.65; // 65% electrical to H2 energy
    private static readonly H2_ENERGY_DENSITY = 3.0; // kWh/Nm³

    private static storage: H2Storage = {
        timestamp: Date.now(),
        volume: 50, // Start with 50 Nm³
        pressure: 200, // 200 bar storage
        purity: 99.999, // 99.999% pure
        capacity: 200, // 200 Nm³ max capacity
        fillLevel: 25 // 25%
    };

    private static sessions: ElectrolysisSession[] = [];
    private static currentSession: ElectrolysisSession | null = null;
    private static fuelCells: Map<string, FuelCellStatus> = new Map();

    /**
     * Initialize fuel cell inventory
     */
    public static initializeFuelCells(): void {
        console.log('[H2] Initializing fuel cell inventory...');

        this.fuelCells.set('ROV-001', {
            unitId: 'ROV-001',
            fuelCellType: 'PEM',
            h2Consumption: 0.5, // Nm³/hour
            runtime: 8, // 8 hours per tank
            lastRefuel: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
            readiness: 'READY'
        });

        this.fuelCells.set('UAV-THERMAL-01', {
            unitId: 'UAV-THERMAL-01',
            fuelCellType: 'PEM',
            h2Consumption: 0.3, // Nm³/hour
            runtime: 6, // 6 hours per tank
            lastRefuel: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
            readiness: 'READY'
        });

        console.log(`[H2] ✅ ${this.fuelCells.size} fuel cell units registered`);
    }

    /**
     * Check if electrolysis should be triggered
     */
    public static checkElectrolysisTrigger(context: {
        islandMode: boolean;
        marketDemand: number; // MW
        excessPower: number; // MW
    }): { shouldRun: boolean; reason: string } {
        // Already running
        if (this.currentSession && this.currentSession.status === 'RUNNING') {
            return { shouldRun: false, reason: 'Electrolysis already running' };
        }

        // Storage full
        if (this.storage.fillLevel >= 95) {
            return { shouldRun: false, reason: 'H2 storage near capacity' };
        }

        // Island mode - always produce H2
        if (context.islandMode) {
            return { shouldRun: true, reason: 'Island mode active - producing H2 for autonomy' };
        }

        // Zero market demand
        if (context.marketDemand === 0 && context.excessPower > 0.1) {
            return { shouldRun: true, reason: 'Zero market demand - converting excess power to H2' };
        }

        // Low storage + excess power
        if (this.storage.fillLevel < 30 && context.excessPower > 0.1) {
            return { shouldRun: true, reason: 'Low H2 storage - replenishing reserves' };
        }

        return { shouldRun: false, reason: 'No trigger conditions met' };
    }

    /**
     * Start electrolysis session
     */
    public static startElectrolysis(
        powerInput: number,
        trigger: ElectrolysisSession['trigger']
    ): ElectrolysisSession {
        const sessionId = `H2-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const session: ElectrolysisSession = {
            sessionId,
            startTime: Date.now(),
            endTime: null,
            powerInput,
            h2Produced: 0,
            efficiency: this.EFFICIENCY,
            trigger,
            status: 'RUNNING'
        };

        this.currentSession = session;
        this.sessions.push(session);

        console.log('\n' + '⚡'.repeat(40));
        console.log('HYDROGEN ELECTROLYSIS INITIATED');
        console.log('⚡'.repeat(40));
        console.log(`Session ID: ${sessionId}`);
        console.log(`Power Input: ${powerInput.toFixed(1)} kW`);
        console.log(`Trigger: ${trigger}`);
        console.log(`Expected H2 Production: ${this.calculateH2Production(powerInput, 1).toFixed(2)} Nm³/hour`);
        console.log('⚡'.repeat(40) + '\n');

        // Record in SovereignGlobalState ledger
        SovereignGlobalState.updateState({
            physics: {
                ...SovereignGlobalState.getState().physics,
                efficiency: this.EFFICIENCY * 100,
                pressure: this.storage.pressure,
                temperature: 25 // Electrolysis operating temp
            },
            crossCorrelations: {
                ...SovereignGlobalState.getState().crossCorrelations,
                h2_production: session.h2Produced,
                h2_storage_level: this.storage.fillLevel
            }
        });

        return session;
    }

    /**
     * Run electrolysis process
     */
    private static runElectrolysis(session: ElectrolysisSession): void {
        const productionInterval = setInterval(() => {
            if (this.storage.fillLevel >= 95) {
                console.log('[H2] Storage full - stopping electrolysis');
                clearInterval(productionInterval);
                this.stopElectrolysis(session);
                return;
            }

            // Calculate H2 produced in this interval (1 second)
            const h2PerSecond = this.calculateH2Production(session.powerInput, 1 / 3600);
            session.h2Produced += h2PerSecond;

            // Update storage
            this.storage.volume += h2PerSecond;
            this.storage.fillLevel = (this.storage.volume / this.storage.capacity) * 100;
            this.storage.timestamp = Date.now();

            if (Math.random() > 0.95) { // Periodic status
                console.log(`[H2] Producing... ${session.h2Produced.toFixed(2)} Nm³ total, Storage: ${this.storage.fillLevel.toFixed(1)}%`);
            }
        }, 1000);

        // Auto-stop after some time (for demo)
        setTimeout(() => {
            clearInterval(productionInterval);
            this.stopElectrolysis(session);
        }, 10000); // 10 seconds for demo
    }

    /**
     * Calculate H2 production
     */
    private static calculateH2Production(powerKW: number, hours: number): number {
        // Energy to H2: P_kW × hours × efficiency / H2_energy_density
        const h2Volume = (powerKW * hours * this.EFFICIENCY) / this.H2_ENERGY_DENSITY;
        return h2Volume;
    }

    /**
     * Stop electrolysis
     */
    private static stopElectrolysis(session: ElectrolysisSession): void {
        session.endTime = Date.now();
        session.status = 'COMPLETED';
        this.currentSession = null;

        const durationHours = (session.endTime - session.startTime) / (1000 * 60 * 60);

        console.log('\n' + '✅'.repeat(40));
        console.log('HYDROGEN ELECTROLYSIS COMPLETED');
        console.log('✅'.repeat(40));
        console.log(`Session ID: ${session.sessionId}`);
        console.log(`Duration: ${(durationHours * 60).toFixed(1)} minutes`);
        console.log(`H2 Produced: ${session.h2Produced.toFixed(2)} Nm³`);
        console.log(`Storage Level: ${this.storage.fillLevel.toFixed(1)}% (${this.storage.volume.toFixed(0)} Nm³)`);
        console.log(`Energy Efficiency: ${(session.efficiency * 100).toFixed(0)}%`);
        console.log('✅'.repeat(40) + '\n');
    }

    /**
     * Refuel robotic unit
     */
    public static refuelUnit(unitId: string): { success: boolean; message: string } {
        const fuelCell = this.fuelCells.get(unitId);
        if (!fuelCell) {
            return { success: false, message: 'Unit not found' };
        }

        const h2Required = fuelCell.h2Consumption * fuelCell.runtime;

        if (this.storage.volume < h2Required) {
            return {
                success: false,
                message: `Insufficient H2: ${this.storage.volume.toFixed(1)} Nm³ available, ${h2Required.toFixed(1)} Nm³ required`
            };
        }

        // Deduct from storage
        this.storage.volume -= h2Required;
        this.storage.fillLevel = (this.storage.volume / this.storage.capacity) * 100;

        // Update fuel cell
        fuelCell.lastRefuel = Date.now();
        fuelCell.readiness = 'READY';

        // Record in SovereignGlobalState immutable ledger
        SovereignGlobalState.updateState({
            finance: {
                ...SovereignGlobalState.getState().finance,
                molecularDebtRate: -0.1, // H2 refuel cost
                netProfitRate: SovereignGlobalState.getState().finance.netProfitRate - 0.1
            },
            crossCorrelations: {
                ...SovereignGlobalState.getState().crossCorrelations,
                fuel_cell_refuel: Date.now(),
                h2_consumed: h2Required
            }
        });

        return { success: true, message: 'Refuel complete' };
    }

    /**
     * Get fuel cell readiness
     */
    public static getFuelCellReadiness(): {
        totalUnits: number;
        ready: number;
        lowFuel: number;
        empty: number;
    } {
        const units = Array.from(this.fuelCells.values());

        return {
            totalUnits: units.length,
            ready: units.filter(u => u.readiness === 'READY').length,
            lowFuel: units.filter(u => u.readiness === 'LOW_FUEL').length,
            empty: units.filter(u => u.readiness === 'EMPTY').length
        };
    }

    /**
     * Get H2 statistics
     */
    public static getStatistics(): {
        storageLevel: number; // %
        totalProduced: number; // Nm³
        totalSessions: number;
        fuelCellReadiness: number; // %
    } {
        const totalProduced = this.sessions
            .filter(s => s.status === 'COMPLETED')
            .reduce((sum, s) => sum + s.h2Produced, 0);

        const readiness = this.getFuelCellReadiness();
        const fuelCellReadiness = (readiness.ready / readiness.totalUnits) * 100;

        return {
            storageLevel: this.storage.fillLevel,
            totalProduced,
            totalSessions: this.sessions.length,
            fuelCellReadiness
        };
    }
}

// Initialize
H2Synthesizer.initializeFuelCells();
