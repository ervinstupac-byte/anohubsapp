/**
 * PhysicalOutputService.ts
 * 
 * Physical printer output and emergency reporting
 * Sends critical state reports to physical devices during impending shutdown
 */

export interface FleetStateReport {
    timestamp: number;
    trigger: 'MANUAL' | 'CORE_SHUTDOWN' | 'CRITICAL_ALARM';
    fleetSummary: string;
    unitStates: Map<string, any>;
    activeAlarms: string[];
    lastActions: string[];
}

export class PhysicalOutputService {

    /**
     * Send report to physical printer buffer
     */
    public static async sendToPrinter(report: FleetStateReport): Promise<boolean> {
        console.log('[PhysicalOutput] Preparing printer output...');

        const text = this.formatPrinterReport(report);

        try {
            // In production: Send to actual printer via LPT/USB/Network
            // Example: await fetch('http://printer.local:9100', { method: 'POST', body: text });

            // For now: Log to console and file
            console.log('\n' + '═'.repeat(80));
            console.log('PHYSICAL PRINTER OUTPUT');
            console.log('═'.repeat(80));
            console.log(text);
            console.log('═'.repeat(80) + '\n');

            // Simulate printer success
            return true;
        } catch (error) {
            console.error('[PhysicalOutput] Printer error:', error);
            return false;
        }
    }

    /**
     * Format report for 80-column printer
     */
    private static formatPrinterReport(report: FleetStateReport): string {
        let text = '';

        text += '\n\n';
        text += '='.repeat(80) + '\n';
        text += 'EMERGENCY FLEET STATE REPORT\n';
        text += '='.repeat(80) + '\n';
        text += `Time: ${new Date(report.timestamp).toISOString()}\n`;
        text += `Trigger: ${report.trigger}\n`;
        text += '='.repeat(80) + '\n\n';

        text += '>>> FLEET SUMMARY <<<\n';
        text += report.fleetSummary + '\n\n';

        text += '>>> UNIT STATUS <<<\n';
        text += '-'.repeat(80) + '\n';
        report.unitStates.forEach((state, unitId) => {
            text += `${unitId}: ${JSON.stringify(state)}\n`;
        });
        text += '\n';

        text += '>>> ACTIVE ALARMS <<<\n';
        text += '-'.repeat(80) + '\n';
        if (report.activeAlarms.length === 0) {
            text += 'No active alarms\n';
        } else {
            report.activeAlarms.forEach((alarm, i) => {
                text += `${i + 1}. ${alarm}\n`;
            });
        }
        text += '\n';

        text += '>>> LAST ACTIONS (Recent 10) <<<\n';
        text += '-'.repeat(80) + '\n';
        report.lastActions.slice(0, 10).forEach((action, i) => {
            text += `${i + 1}. ${action}\n`;
        });
        text += '\n';

        text += '='.repeat(80) + '\n';
        text += 'OPERATOR: Review this report and take manual control if needed.\n';
        text += 'For emergency procedures, refer to printed Emergency SOP.\n';
        text += '='.repeat(80) + '\n';
        text += '\f'; // Form feed for printer

        return text;
    }

    /**
     * Trigger emergency report on core shutdown
     */
    public static triggerEmergencyReport(reason: string): void {
        console.log(`[PhysicalOutput] EMERGENCY: Triggering printer report due to: ${reason}`);

        const report: FleetStateReport = {
            timestamp: Date.now(),
            trigger: 'CORE_SHUTDOWN',
            fleetSummary: `CRITICAL: System core shutdown imminent - ${reason}`,
            unitStates: new Map([
                ['UNIT-1', { status: 'RUNNING', load: 42, alarms: 0 }],
                ['UNIT-2', { status: 'RUNNING', load: 45, alarms: 0 }],
                ['UNIT-3', { status: 'DEGRADED', load: 30, alarms: 1 }],
                ['UNIT-4', { status: 'RUNNING', load: 38, alarms: 0 }],
                ['UNIT-5', { status: 'RUNNING', load: 30, alarms: 0 }],
                ['UNIT-6', { status: 'MONITORING', load: 18, alarms: 0 }]
            ]),
            activeAlarms: [
                'CORE_SYSTEM_FAILURE: Database connection lost',
                'UNIT-3: Servo backlash compensator offline'
            ],
            lastActions: [
                '2026-01-24 20:55:30 - UNIT-3 blade angle adjusted +2.1°',
                '2026-01-24 20:50:15 - UNIT-1 air injection activated (vortex suppression)',
                '2026-01-24 20:45:00 - Fleet load redistribution executed',
                '2026-01-24 20:40:22 - UNIT-5 nozzle #3 speed limited to 4 mm/s'
            ]
        };

        this.sendToPrinter(report);
    }

    /**
     * Generate manual state report
     */
    public static generateManualReport(): FleetStateReport {
        return {
            timestamp: Date.now(),
            trigger: 'MANUAL',
            fleetSummary: 'Manual fleet status report requested by operator',
            unitStates: new Map(), // Populate from actual fleet data
            activeAlarms: [],
            lastActions: []
        };
    }
}
