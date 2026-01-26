/**
 * KAPLAN HUB MONITOR
 * The Environmental Guardian 🛢️💧
 * 
 * Monitors the pressurized oil inside the runner hub.
 * Critical Rule: Oil Pressure must be > Water Pressure to ensure
 * if a seal fails, oil leaks OUT (traceable) rather than water IN (catastrophic).
 * ...Wait, actually, for *Environmental* safety, newer systems might prioritize
 * keeping oil IN. 
 * 
 * BUT, typically in older Kaplans: P_oil > P_water prevents water ingress which kills bearings.
 * MODERN BIO-OIL Systems: We strictly monitor the differential.
 * 
 * Logic:
 * Safe Zone: P_oil > P_water + Offset (Positive Pressure).
 * Critical Leak: P_oil < P_water (Water Ingress Risk).
 * Environmental Breach: Rapid level drop in gravity tank.
 */

export interface HubHealth {
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    oilPressureBar: number;
    waterPressureBar: number;
    differential: number;
    leakRisk: boolean;
    waterIngressRisk: boolean;
    message: string;
}

export class KaplanHubMonitor {
    private readonly MIN_DIFFERENTIAL_BAR = 0.2; // 2m water head equivalent

    checkHubHealth(oilPressure: number, tailwaterLevel: number, runnerDepth: number): HubHealth {
        // Calculate Water Pressure at the Hub Centerline
        // P_water = rho * g * h (Hydrostatic pressure from tailwater + depth of runner)
        // Approx: 0.1 bar per meter
        const waterDepth = tailwaterLevel + runnerDepth;
        const waterPressure = waterDepth * 0.0981; // Bar

        const differential = oilPressure - waterPressure;

        let status: HubHealth['status'] = 'OPTIMAL';
        let leakRisk = false;
        let waterIngressRisk = false;
        let message = 'Hub Seal Integrity Nominal.';

        if (differential < 0) {
            // Negative Pressure: Water forcing way into Hub
            status = 'CRITICAL';
            waterIngressRisk = true;
            message = '🚨 CRITICAL: WATER INGRESS RISK! Hub Pressure lower than River.';
        } else if (differential < this.MIN_DIFFERENTIAL_BAR) {
            status = 'WARNING';
            message = `⚠️ LOW DIFFERENTIAL: Only ${differential.toFixed(2)} bar margin.`;
        } else if (differential > 2.0) {
            // Too high? Could blow the seal out.
            status = 'WARNING';
            leakRisk = true;
            message = '⚠️ HIGH PRESSURE: Risk of blowing seal (Oil -> River).';
        }

        return {
            status,
            oilPressureBar: oilPressure,
            waterPressureBar: waterPressure,
            differential,
            leakRisk,
            waterIngressRisk,
            message
        };
    }
}
