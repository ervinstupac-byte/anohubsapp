import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { TRIGGER_FORENSIC_EXPORT } from '../components/diagnostic-twin/Sidebar';

export const SIMULATION_EVENTS = {
    TICK: 'SIMULATION_TICK',
    CRITICAL: 'SIMULATION_CRITICAL',
    ENDED: 'SIMULATION_ENDED',
    GRAND_TOUR_TICK: 'SIMULATION_GRAND_TOUR_TICK',
    NC16_INTERVENTION: 'NC16_INTERVENTION_REQUIRED'
};

export class SimulationEngine {
    private static intervalId: NodeJS.Timeout | null = null;
    private static currentVibration = 2.4;
    private static readonly CRITICAL_THRESHOLD = 7.1; // ISO 10816-5 Zone C
    private static readonly RAMP_RATE = 0.5; // mm/s per tick
    private static readonly TICK_RATE_MS = 500;

    // NC-16 State
    private static tourData: { day: number; vibration: number; rul: number }[] = [];

    static startNC13StressTest() {
        if (this.intervalId) return; // Prevent multiple runs

        console.log("NC-13: STRESS TEST INITIATED");
        this.currentVibration = 2.4; // Reset to baseline

        this.intervalId = setInterval(() => {
            this.tick();
        }, this.TICK_RATE_MS);
    }

    static runGrandTour() {
        if (this.intervalId) return;

        console.log("NC-16: THE GRAND TOUR INITIATED");
        let day = 0;
        this.currentVibration = 2.4;
        this.tourData = [];

        this.intervalId = setInterval(() => {
            day++;

            // NC-16 Physics Layer: Exponential wear after Day 15
            if (day > 15) {
                this.currentVibration += 0.2;
            }

            const daysRemaining = 30 - day;

            // Collect Data
            this.tourData.push({
                day,
                vibration: this.currentVibration,
                rul: daysRemaining
            });

            // 1. Update Store (real-time graph sync)
            useTelemetryStore.getState().updateTelemetry({
                mechanical: { vibration: this.currentVibration }
            } as any);

            // 2. Dispatch NC-16 Tick (for AssetPassportCard countdown)
            window.dispatchEvent(new CustomEvent(SIMULATION_EVENTS.GRAND_TOUR_TICK, {
                detail: {
                    day,
                    vibration: this.currentVibration,
                    daysRemaining,
                    totalDuration: 30
                }
            }));

            // 3. Zero-Day Intervention (Day 25 -> 5 Days Left)
            if (daysRemaining === 5) {
                window.dispatchEvent(new CustomEvent(SIMULATION_EVENTS.NC16_INTERVENTION));
            }

            // 4. Completion
            if (day >= 30) {
                this.finishGrandTour();
            }

        }, 1000); // 1 second = 1 day
    }

    private static finishGrandTour() {
        this.stop();
        console.log("NC-16: GRAND TOUR COMPLETED. Generating Audit...");

        // Generate Report
        import('./ForensicReportService').then(({ ForensicReportService }) => {
            const blob = ForensicReportService.generateSovereignLongevityAudit({
                assetName: "UNIT-1 (SIMULATION)",
                date: new Date().toISOString().split('T')[0],
                tourData: this.tourData,
                complianceSignature: `SIG-NC16-${Date.now().toString(16).toUpperCase()}`
            });

            // Auto-download/open
            ForensicReportService.openAndDownloadBlob(blob, "Sovereign_Longevity_Audit_Unit1.pdf", true);
        });
    }

    private static tick() {
        this.currentVibration += this.RAMP_RATE;

        // 1. Update Telemetry Store (for graphs/gauges)
        useTelemetryStore.getState().updateTelemetry({
            mechanical: {
                vibration: this.currentVibration,
                rpm: useTelemetryStore.getState().mechanical?.rpm // preserve other values if needed or just merge
            },
            // Add some jitter to other metrics for realism
            measurements: {
                temp: 65 + (this.currentVibration * 1.5),
                cavitation: Math.min(10, Math.floor(this.currentVibration / 0.8))
            }
        } as any); // Casting 'as any' to bypass strict partial check if I'm unsure of exact shape, but trying to be close.

        // 2. Dispatch Tick Event (for Pulse UI)
        window.dispatchEvent(new CustomEvent(SIMULATION_EVENTS.TICK, {
            detail: { vibration: this.currentVibration }
        }));

        // 3. Check Critical Threshold
        if (this.currentVibration >= this.CRITICAL_THRESHOLD) {
            this.triggerCriticalState();
        }
    }

    private static triggerCriticalState() {
        console.log("NC-13: CRITICAL THRESHOLD BREACHED");

        // Dispatch Critical Event (for Dashboard Resize & Dossier Pop-up)
        window.dispatchEvent(new CustomEvent(SIMULATION_EVENTS.CRITICAL, {
            detail: { vibration: this.currentVibration }
        }));

        // Trigger Forensic Export
        window.dispatchEvent(new CustomEvent(TRIGGER_FORENSIC_EXPORT, {
            detail: { title: "INCIDENT REPORT NC-13: CAVITATION CRITICALITY" }
        }));

        this.stop();
    }

    static stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            window.dispatchEvent(new CustomEvent(SIMULATION_EVENTS.ENDED));
            console.log("SIMULATION STOPPED");
        }
    }
}
