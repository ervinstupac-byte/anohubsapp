import { DiagnosticSnapshot } from '../features/telemetry/store/useTelemetryStore';

export interface ExecutiveVerdict {
    riskValue: number;       // €/hr exposure or Total Risk €
    hourlyRevenue: number;   // €/hr
    probabilityOfFailure: number; // 0-1
    verdict: 'CONTINUE' | 'MONITOR' | 'STOP_ORDER';
    recommendation: string;
    serviceTicket?: ServiceTicket;
}

export interface ServiceTicket {
    id: string;
    timestamp: number;
    priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
    requiredActions: {
        task: string;
        spec: string; // e.g., "1850 Nm"
    }[];
    estimatedDowntimeHours: number;
}

const CONSTANTS = {
    ELECTRICITY_PRICE_EUR_MWH: 65,
    RATED_POWER_MW: 5.2,
    CATASTROPHIC_FAILURE_COST: 250000, // Cost of runner/bearing replacement + downtime
    SAFE_ECCENTRICITY_THRESHOLD: 0.1,  // mm
    SAFE_RSQUARED_THRESHOLD: 0.90      // 0-1
};

export class SovereignExecutiveService {
    
    /**
     * Calculates the Financial Risk and issues an Executive Verdict
     * based on the Kinetic State of the machine.
     */
    public static evaluate(snapshot: DiagnosticSnapshot): ExecutiveVerdict {
        const { eccentricity, rsquared } = snapshot.kineticState;
        const physics = snapshot.physicsAnalysis;
        
        // 1. Calculate Hourly Revenue
        const hourlyRevenue = CONSTANTS.RATED_POWER_MW * CONSTANTS.ELECTRICITY_PRICE_EUR_MWH;
        
        // 2. Calculate Probability of Failure (Pf)
        // Heuristic: E > 0.1 starts risk. R² < 0.9 amplifies risk.
        // If E = 0.22 (Critical) and R² = 0.78 (Bad):
        // Base Risk = (0.22 - 0.1) * 5 = 0.6 (60%)
        // Amplifier = 1 + (1 - 0.78) = 1.22
        // Pf = 0.6 * 1.22 = 0.732 (73.2%)
        
        let pf = 0;
        if (eccentricity > CONSTANTS.SAFE_ECCENTRICITY_THRESHOLD) {
            const baseRisk = (eccentricity - CONSTANTS.SAFE_ECCENTRICITY_THRESHOLD) * 5;
            const chaoticAmplifier = 1 + Math.max(0, CONSTANTS.SAFE_RSQUARED_THRESHOLD - rsquared);
            pf = Math.min(0.99, baseRisk * chaoticAmplifier);
        }

        // NEW: Physics-Based Risk Injection (Cavitation/Rough Zone)
        // Cavitation accelerates failure probability by degrading material
        if (physics?.cavitation.risk === 'HIGH') {
            pf = Math.min(0.99, Math.max(pf, 0.45)); // Minimum 45% failure probability if cavitation is high
        } else if (physics?.cavitation.risk === 'MEDIUM') {
            pf = Math.min(0.99, Math.max(pf, 0.25)); // Minimum 25% failure probability
        }

        if (physics?.zone.zone === 'ROUGH') {
            pf = Math.min(0.99, pf + 0.15); // Add 15% risk for rough zone operation
        } else if (physics?.zone.zone === 'OVERLOAD') {
            pf = Math.min(0.99, pf + 0.30); // Add 30% risk for overload
        }
        
        // 3. Calculate Financial Exposure (Risk)
        // Risk = Probability * Impact
        const financialExposure = pf * CONSTANTS.CATASTROPHIC_FAILURE_COST;
        
        // 4. Determine Verdict
        let verdict: ExecutiveVerdict['verdict'] = 'CONTINUE';
        let recommendation = 'System Nominal. Continue Operation.';
        
        if (financialExposure > 3 * hourlyRevenue) {
            verdict = 'STOP_ORDER';
            recommendation = 'IMMEDIATE SHUTDOWN. Risk exceeds 3x Hourly Revenue.';
        } else if (physics?.cavitation.risk === 'HIGH') {
            verdict = 'STOP_ORDER';
            recommendation = 'SHUTDOWN ADVISED. Critical Cavitation Detected.';
        } else if (financialExposure >= hourlyRevenue || physics?.zone.zone === 'ROUGH') {
            verdict = 'MONITOR';
            recommendation = 'Deploy Predictive Maintenance. Monitor closely.';
        }
        
        // 5. Generate Service Ticket if needed
        let serviceTicket: ServiceTicket | undefined;
        if (verdict === 'STOP_ORDER') {
            serviceTicket = this.generateServiceTicket(snapshot);
        }

        return {
            riskValue: financialExposure,
            hourlyRevenue,
            probabilityOfFailure: pf,
            verdict,
            recommendation,
            serviceTicket
        };
    }

    private static generateServiceTicket(snapshot: DiagnosticSnapshot): ServiceTicket {
        const isLooseness = snapshot.pathology.includes('LOOSENESS');
        const isUnbalance = snapshot.pathology.includes('UNBALANCE');
        const physics = snapshot.physicsAnalysis;
        
        const actions = [];
        
        if (isLooseness) {
            actions.push({ task: 'Verify Anchor Bolt Torque', spec: '1850 Nm ± 5%' });
            actions.push({ task: 'Check Foundation Integrity', spec: 'ISO 10816-3' });
        }
        
        if (isUnbalance || snapshot.kineticState.eccentricity > 0.15) {
            actions.push({ task: 'Perform Laser Alignment', spec: 'Target: < 0.05 mm' });
            actions.push({ task: 'Trim Balance Weights', spec: 'Phase Opposition Calculation' });
        }

        // NEW: Physics-Based Remediation
        if (physics?.cavitation.risk === 'HIGH') {
            actions.push({ task: 'Inject Compressed Air', spec: 'Aeration Valve > 80% Open' });
            actions.push({ task: 'Inspect Runner Blades', spec: 'Check for Pitting/Erosion' });
        }
        
        if (physics?.zone.zone === 'OVERLOAD') {
            actions.push({ task: 'Reduce Active Power', spec: 'Target: < 100 MW' });
            actions.push({ task: 'Inspect Stator Windings', spec: 'Thermal Scan Required' });
        }

        return {
            id: `TICKET-${Date.now().toString().slice(-6)}`,
            timestamp: Date.now(),
            priority: 'EMERGENCY',
            requiredActions: actions,
            estimatedDowntimeHours: 4
        };
    }
}
