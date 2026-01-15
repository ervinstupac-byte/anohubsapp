import { useMemo } from 'react';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { PhysicsEngine } from '../../physics-core/PhysicsEngine';
import { SYSTEM_CONSTANTS } from '../../../config/SystemConstants';

/**
 * Standardized Physics Metrics Interface
 * 
 * This hook provides a clean, memoized interface for UI components
 * to consume complex physics calculations without directly coupling
 * to the PhysicsEngine or performing calculations in useEffect.
 */
export interface PhysicsMetrics {
    // Core Metrics (IEC 60041 Precision)
    currentStress: number; // MPa
    surgePressure: number; // Pa
    powerOutput: number; // MW
    eccentricity: number; // 0-1 (Orbital shape)

    // Derived Status
    alertLevel: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    healthScore: number; // 0-100
    maintenanceUrgency: number; // 1-5 scale

    // Performance Analytics
    performanceGap: number; // % (actual vs design)
    efficiencyLoss: number; // % (volumetric + mechanical)
    specificWaterConsumption: number; // m3/kWh

    // Diagnostic Flags (Rule-Based)
    isCavitating: boolean;
    isMisaligned: boolean;
    isOverheating: boolean;
    hasExcessiveVibration: boolean;

    // Safety Factors
    safetyFactor: number; // Bolt/Structural SF

    // Timestamps
    lastUpdate: string;
}

/**
 * Custom Hook: usePhysicsMetrics
 * 
 * @returns {PhysicsMetrics} Memoized physics metrics derived from TelemetryStore
 * 
 * @example
 * ```tsx
 * const { currentStress, alertLevel, healthScore } = usePhysicsMetrics();
 * 
 * return (
 *   <div>
 *     <StatusBadge level={alertLevel} />
 *     <Metric value={currentStress} unit="MPa" />
 *   </div>
 * );
 * ```
 */
export const usePhysicsMetrics = (): PhysicsMetrics => {
    const { physics, diagnosis, mechanical, hydraulic, identity, site, penstock, lastUpdate } = useTelemetryStore();

    return useMemo(() => {
        // Extract core metrics from physics result (Decimal -> number)
        const currentStress = physics.hoopStress?.toNumber() || 0;
        const surgePressure = physics.surgePressure?.toNumber() || 0;
        const powerOutput = physics.powerMW?.toNumber() || 0;
        const eccentricity = physics.eccentricity?.toNumber() || 0;
        const specificWaterConsumption = physics.specificWaterConsumption?.toNumber() || 0;

        // Alert level from diagnosis (primary source) or physics status (fallback)
        const alertLevel = diagnosis?.severity || physics.status || 'NOMINAL';

        // Calculate maintenance urgency using centralized PhysicsEngine logic
        const mockState = {
            identity,
            mechanical,
            site,
        };
        const maintenanceUrgency = PhysicsEngine.calculateMaintenanceUrgency(mockState as any);

        // Health score (inverse of urgency: Level 1 = 100%, Level 5 = 0%)
        const healthScore = Math.max(0, 100 - (maintenanceUrgency - 1) * 25);

        // Performance gap (actual/design * 100)
        const performanceGap = physics.performanceGap?.toNumber() || 100;

        // Efficiency loss (volumetric + mechanical losses)
        const efficiencyLoss = physics.volumetricLoss?.toNumber() || 0;

        // Safety factor from diagnosis or physics
        const safetyFactor = diagnosis?.safetyFactor?.toNumber() || physics.status === 'CRITICAL' ? 0.8 : 1.5;

        // Diagnostic flags (using SYSTEM_CONSTANTS thresholds)
        const isCavitating = hydraulic.flow > (SYSTEM_CONSTANTS.THRESHOLDS.FLOW.CAVITATION_CRITICAL || 42.5);

        const isMisaligned = mechanical.alignment > 0.05; // 0.05 mm/m Heritage Law (not in constants)

        const isOverheating = mechanical.bearingTemp > (SYSTEM_CONSTANTS.THRESHOLDS.BEARING_TEMP.WARNING_MAX || 80);

        const hasExcessiveVibration = mechanical.vibration > (SYSTEM_CONSTANTS.THRESHOLDS.VIBRATION_ISO_10816.UNSATISFACTORY_MAX || 4.5);


        return {
            currentStress,
            surgePressure,
            powerOutput,
            eccentricity,
            alertLevel,
            healthScore,
            maintenanceUrgency,
            performanceGap,
            efficiencyLoss,
            specificWaterConsumption,
            isCavitating,
            isMisaligned,
            isOverheating,
            hasExcessiveVibration,
            safetyFactor,
            lastUpdate
        };
    }, [physics, diagnosis, mechanical, hydraulic, identity, site, penstock, lastUpdate]);
};
