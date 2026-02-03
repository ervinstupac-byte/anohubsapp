
import { TurbineType } from "../../models/turbine/TurbineFactory";
import { useTelemetryStore } from "../../features/telemetry/store/useTelemetryStore";
import { useAssetContext } from "../../contexts/AssetContext";

/**
 * NC-700: The Sovereign One-Click Demo
 * Orchestrates a high-stakes engineering crisis and resolution sequence.
 */
export class DemoStorytellerService {

    // Config
    private static INTERVAL_MS = 100;
    private static running = false;
    private static timer: any = null;

    /**
     * Run the Master Demo Sequence
     * 1. Boot Logic Gates
     * 2. Switch to Pelton
     * 3. Drift Efficiency
     * 4. Trigger Spike
     * 5. Capture Forensic Evidence
     */
    static async runMasterDemo(
        switchAsset: (type: TurbineType) => Promise<void>,
        dispatchLog: (level: string, source: string, msg: string) => void
    ) {
        if (this.running) return;

        try {
            this.running = true;

            console.log('[DemoStoryteller] 🎬 ACTION! Starting Master Demo Sequence...');

            // 1. BOOT SEQUENCE
            dispatchLog('CRITICAL', 'KERNEL', 'Initiating Sovereign Demo Protocol NC-700...');
            await this.wait(1500);

            // 2. THE SWITCH (Pelton)
            dispatchLog('INFO', 'SCADA', 'Reconfiguring for PELTON (Vertical 2-Jet)...');
            await switchAsset('PELTON');
            await this.wait(2000);

            // 3. THE DRIFT (Simulate Erosion)
            dispatchLog('WARNING', 'PHYSICS', 'Injecting Nozzle Erosion Vector...');

            let vibration = 0.8;
            let efficiency = 92.5;
            let pulsation = 0;

            // Animate drift for 5 seconds
            const driftStart = Date.now();
            const duration = 5000;

            // Store reference to update telemetry
            const updateTelemetry = useTelemetryStore.getState().setMechanical;

            return new Promise<void>((resolve, reject) => {
                this.timer = setInterval(() => {
                    try {
                        const elapsed = Date.now() - driftStart;
                        const progress = Math.min(elapsed / duration, 1);

                        // Exponential drift
                        vibration = 0.8 + (progress * progress * 3.0); // Goes to 3.8
                        efficiency = 92.5 - (progress * 1.5);
                        pulsation = progress * 0.4; // 0.4 bar pulsation

                        // Inject
                        useTelemetryStore.getState().setMechanical({
                            vibration,
                            bearingTemp: 45 + (progress * 15), // Heat up
                        });

                        // Trigger Spike at 80%
                        if (progress > 0.8 && vibration > 4.0) {
                            // 4. THE SPIKE
                            useTelemetryStore.getState().setMechanical({
                                vibration: 8.5 + (Math.random() * 2), // Violent spike
                                bearingTemp: 78
                            });

                            // Trigger Fault Event once
                            if (!this.spikeTriggered) {
                                this.spikeTriggered = true;
                                dispatchLog('CRITICAL', 'GUARD', 'TRIP: HIGH VIBRATION DETECTED (>4.5 mm/s)');
                                // Global event for UI overlays
                                window.dispatchEvent(new CustomEvent('DEMO_FAULT_DETECTED', { detail: { type: 'VIBRATION' } }));
                            }
                        }

                        if (progress >= 1) {
                            clearInterval(this.timer);
                            this.finishDemo(dispatchLog);
                            resolve();
                        }
                    } catch (innerErr) {
                        console.error('[DemoStoryteller] Interval Error:', innerErr);
                        clearInterval(this.timer);
                        this.running = false;
                        resolve(); // Resolve to avoid hanging
                    }

                }, this.INTERVAL_MS);
            });
        } catch (err) {
            console.error('[DemoStoryteller] CRITICAL FAILURE:', err);
            dispatchLog('ERROR', 'SYSTEM', 'Demo Sequence Aborted due to internal error.');
            this.running = false;
        }
    }

    private static spikeTriggered = false;

    private static async finishDemo(dispatchLog: any) {
        await this.wait(1000);
        // 5. THE CAPTURE
        dispatchLog('SUCCESS', 'FORENSICS', 'RCA Complete. 95% Confidence: Nozzle 2 Erosion.');
        window.dispatchEvent(new CustomEvent('DEMO_SEQUENCE_COMPLETE'));
        this.running = false;
        this.spikeTriggered = false;
        console.log('[DemoStoryteller] 🎬 CUT! Demo Complete.');
    }

    private static wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static stop() {
        if (this.timer) clearInterval(this.timer);
        this.running = false;
        this.spikeTriggered = false;
    }
}
