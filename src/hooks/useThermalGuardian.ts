import { useRef, useEffect } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import SovereignAuditAdapter from '../services/SovereignAuditAdapter';

/**
 * useThermalGuardian
 * 
 * Monitors the derivative of temperature (dT/dt) to detect Thermal Runaway
 * before the absolute limit is reached.
 * 
 * Rules:
 * - Trigger if rate > 2.0°C / minute
 * - Log to Sovereign Audit with [PREDICTIVE] tag
 */
export const useThermalGuardian = (assetId: string) => {
    const bearingTemp = useTelemetryStore(state => state.mechanical.bearingTemp);

    // State to track history for derivative calc
    const historyRef = useRef<{ temp: number; time: number } | null>(null);
    const auditAdapter = useRef(new SovereignAuditAdapter());

    useEffect(() => {
        const now = Date.now();
        const currentTemp = bearingTemp || 0;

        if (historyRef.current) {
            const { temp: prevTemp, time: prevTime } = historyRef.current;
            const deltaDesc = (now - prevTime) / 1000; // seconds

            // Avoid divide by zero or tiny steps
            if (deltaDesc > 1.0) {
                const deltaTemp = currentTemp - prevTemp;
                const ratePerSecond = deltaTemp / deltaDesc;
                const ratePerMinute = ratePerSecond * 60;

                // Threshold: 2.0 degC / min
                if (ratePerMinute > 2.0) {
                    console.warn(`🔥 THERMAL RUNAWAY DETECTED: +${ratePerMinute.toFixed(2)}°C/min`);

                    // Log to Sovereign Audit
                    auditAdapter.current.persistWisdom(
                        {
                            executiveSummary: `[PREDICTIVE] Thermal Runaway Detected on ${assetId}`,
                            entries: [{
                                title: "Rapid Temperature Rise",
                                legacyTip: "Check oil cooler water flow immediately. Bearing pads may be wiping.",
                                tags: ["THERMAL", "CRITICAL"]
                            }],
                            metadata: {
                                rate: ratePerMinute,
                                currentTemp,
                                timestamp: new Date().toISOString()
                            }
                        },
                        assetId,
                        "mechanical.bearingTemp"
                    );
                }
            }
        }

        // Update Ref
        historyRef.current = { temp: currentTemp, time: now };

    }, [bearingTemp, assetId]);
};
