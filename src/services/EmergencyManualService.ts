/**
 * EmergencyManualService.ts
 * 
 * Dynamic Emergency Documentation Engine
 * Generates live Standard Operating Procedures (SOP) based on current fleet state
 * Includes active compensations, critical setpoints, and emergency procedures
 */

export interface EmergencySOP {
    generatedAt: number;
    fleetStatus: 'NORMAL' | 'DEGRADED' | 'CRITICAL';
    activeCompensations: string[];
    criticalSetpoints: Map<string, any>;
    emergencyProcedures: string[];
    manualInterventions: string[];
    safetyChecklist: string[];
}

export class EmergencyManualService {
    private static lastGenerated: number = 0;
    private static currentSOP: EmergencySOP | null = null;

    /**
     * Generate live emergency SOP
     */
    public static generateLiveEmergencySOP(): EmergencySOP {
        console.log('[EmergencyManual] Generating Live Emergency SOP...');

        const activeCompensations: string[] = [];
        const criticalSetpoints = new Map<string, any>();
        const emergencyProcedures: string[] = [];
        const manualInterventions: string[] = [];
        const safetyChecklist: string[] = [];

        // UNIT-3: Servo Backlash Compensation
        activeCompensations.push(
            '⚠️ UNIT-3 (Peruća Kaplan 1): Servo backlash compensation ACTIVE (+2.1°)'
        );
        manualInterventions.push(
            'UNIT-3 Manual Adjustment: If software fails, manually ADD 2.1° to blade angle setpoint'
        );
        criticalSetpoints.set('UNIT-3_BLADE_OFFSET', 2.1);

        // UNIT-5: Nozzle #3 Water Hammer Prevention
        activeCompensations.push(
            '⚠️ UNIT-5 (Senj Pelton 1): Nozzle #3 needle speed LIMITED to 4 mm/s'
        );
        manualInterventions.push(
            'UNIT-5 Manual Adjustment: Nozzle #3 requires slow closing (<5 mm/s) due to seal wear'
        );
        criticalSetpoints.set('UNIT-5_NOZZLE3_MAX_SPEED', 4.0);

        // UNIT-1/2: Francis Draft Tube Vortex
        activeCompensations.push(
            '📊 UNIT-1 & UNIT-2 (Zakučac Francis): Air injection standby for vortex suppression'
        );
        criticalSetpoints.set('FRANCIS_AIR_INJECTION_THRESHOLD', 0.3);

        // Emergency Procedures
        emergencyProcedures.push(...this.generateEmergencyProcedures());

        // Safety Checklist
        safetyChecklist.push(...this.generateSafetyChecklist());

        const sop: EmergencySOP = {
            generatedAt: Date.now(),
            fleetStatus: this.determineFleetStatus(),
            activeCompensations,
            criticalSetpoints,
            emergencyProcedures,
            manualInterventions,
            safetyChecklist
        };

        this.currentSOP = sop;
        this.lastGenerated = Date.now();

        return sop;
    }

    /**
     * Generate emergency procedures based on turbine type
     */
    private static generateEmergencyProcedures(): string[] {
        return [
            '=== EMERGENCY SHUTDOWN PROCEDURE ===',
            '1. Press Emergency Stop (E-STOP) button',
            '2. Verify all breakers OPEN (CB-GEN, CB-TX, CB-GRID)',
            '3. Confirm runner has stopped (0 RPM)',
            '4. Engage mechanical brake',
            '5. Close all inlet valves/gates',
            '6. Verify guide vanes fully closed',
            '7. Monitor bearing temperatures for 30 minutes',
            '8. Document incident in logbook',
            '',
            '=== LOSS OF GRID PROCEDURE ===',
            '1. Generator breaker auto-opens (CB-GEN)',
            '2. Load rejection: Deflector activates (Pelton) OR Gate rapid close (Francis/Kaplan)',
            '3. Frequency rises → Governor reduces load to house load',
            '4. If grid restore >5 min: Execute controlled shutdown',
            '5. Await synchronization signal before reconnecting',
            '',
            '=== HIGH VIBRATION PROCEDURE ===',
            '1. If vibration >4.0 mm/s: AUTO SHUTDOWN triggered',
            '2. If vibration 2.5-4.0 mm/s: REDUCE LOAD by 20%',
            '3. Monitor for 5 minutes',
            '4. If vibration persists: Manual shutdown',
            '5. Inspect bearings before restart',
            '',
            '=== COOLING WATER LOSS ===',
            '1. Bearing temperature alarm: <48°C warning, >65°C emergency',
            '2. Activate auxiliary cooling pump',
            '3. If temperature >65°C: IMMEDIATE SHUTDOWN',
            '4. Monitor bearing temps for 60 minutes post-shutdown',
            '',
            '=== MANUAL SYNCHRONIZATION (Grid Reconnect) ===',
            '1. Match voltage: ±5% of grid voltage',
            '2. Match frequency: ±0.2 Hz of grid frequency',
            '3. Phase angle: Within 20° (use synchroscope)',
            '4. Close breaker at 0° phase difference',
            '5. Verify active/reactive power exchange'
        ];
    }

    /**
     * Generate safety checklist
     */
    private static generateSafetyChecklist(): string[] {
        return [
            '[ ] All personnel clear of rotating equipment',
            '[ ] Safety interlocks verified (Oil/Cooling/Brake/Electrical)',
            '[ ] Emergency stop circuits tested',
            '[ ] Communication systems operational',
            '[ ] Backup power (Diesel Generator) READY',
            '[ ] DC battery bank >80% SOC',
            '[ ] Fire suppression system armed',
            '[ ] All exits clear and accessible',
            '[ ] First aid equipment available',
            '[ ] Incident response team notified'
        ];
    }

    /**
     * Determine overall fleet status
     */
    private static determineFleetStatus(): 'NORMAL' | 'DEGRADED' | 'CRITICAL' {
        // In production: Query actual fleet health
        // For now: Return based on compensations
        return 'DEGRADED'; // Because UNIT-3 servo backlash
    }

    /**
     * Export SOP to text format
     */
    public static exportSOPToText(sop: EmergencySOP): string {
        let text = '';

        text += '═'.repeat(80) + '\n';
        text += '  LIVE EMERGENCY STANDARD OPERATING PROCEDURE (SOP)\n';
        text += '  Sovereign Intelligence System - Hydropower Fleet\n';
        text += '═'.repeat(80) + '\n';
        text += `Generated: ${new Date(sop.generatedAt).toISOString()}\n`;
        text += `Fleet Status: ${sop.fleetStatus}\n`;
        text += '═'.repeat(80) + '\n\n';

        text += '>>> ACTIVE COMPENSATIONS (Software Overrides) <<<\n';
        text += '-'.repeat(80) + '\n';
        sop.activeCompensations.forEach(comp => {
            text += `${comp}\n`;
        });
        text += '\n';

        text += '>>> MANUAL INTERVENTIONS (If Software Failure) <<<\n';
        text += '-'.repeat(80) + '\n';
        sop.manualInterventions.forEach(intervention => {
            text += `${intervention}\n`;
        });
        text += '\n';

        text += '>>> CRITICAL SETPOINTS <<<\n';
        text += '-'.repeat(80) + '\n';
        sop.criticalSetpoints.forEach((value, key) => {
            text += `${key}: ${JSON.stringify(value)}\n`;
        });
        text += '\n';

        text += '>>> EMERGENCY PROCEDURES <<<\n';
        text += '-'.repeat(80) + '\n';
        sop.emergencyProcedures.forEach(proc => {
            text += `${proc}\n`;
        });
        text += '\n';

        text += '>>> SAFETY CHECKLIST <<<\n';
        text += '-'.repeat(80) + '\n';
        sop.safetyChecklist.forEach(item => {
            text += `${item}\n`;
        });
        text += '\n';

        text += '═'.repeat(80) + '\n';
        text += 'END OF EMERGENCY SOP\n';
        text += '═'.repeat(80) + '\n';

        return text;
    }

    /**
     * Schedule hourly SOP generation
     */
    public static startPeriodicGeneration(): void {
        console.log('[EmergencyManual] Starting hourly SOP generation...');

        // Generate immediately
        this.generateLiveEmergencySOP();

        // Schedule hourly
        setInterval(() => {
            const sop = this.generateLiveEmergencySOP();
            console.log(`[EmergencyManual] ✅ SOP updated at ${new Date().toISOString()}`);

            // Auto-save to file system
            const text = this.exportSOPToText(sop);
            // In production: Write to /opt/scada/emergency/sop_latest.txt
        }, 60 * 60 * 1000); // Every hour
    }

    /**
     * Get current SOP
     */
    public static getCurrentSOP(): EmergencySOP | null {
        return this.currentSOP;
    }
}
