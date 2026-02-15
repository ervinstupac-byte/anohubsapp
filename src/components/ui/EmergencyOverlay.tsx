import React, { useMemo, useEffect } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PhysicsMathService } from '../../services/core/PhysicsMathService';
import { MaterialService } from '../../services/core/MaterialLibrary';
import { saveLog } from '../../services/PersistenceService';

/**
 * NC-9300: Global Emergency Overlay
 * Triggers full-screen visual alert when physical limits are exceeded.
 * Synchronized across all detached windows via store updates.
 */
export const EmergencyOverlay: React.FC = () => {
    const { hydraulic, physics, penstock } = useTelemetryStore();
    
    const { hoopStress, utilizationRatio } = useMemo(() => {
        // Prefer pre-calculated physics result from store if available
        const storedStress = physics?.hoopStressMPa;
        
        let currentStress = 0;
        if (storedStress !== undefined) {
            currentStress = storedStress;
        } else {
            // Fallback: Calculate live
            const head = Number(hydraulic?.head ?? 0);
            const surgeVal = physics?.surgePressureBar;
            const surge = surgeVal ?? 0;
                
            const d = Number(penstock?.diameter ?? 1.5);
            const t = Number(penstock?.wallThickness ?? 0.02);
            const mat = penstock?.material || 'S235';
            const yieldStrength = MaterialService.getYieldStrength(mat);
            
            const result = PhysicsMathService.calculateHoopStress(head, surge, d, t, yieldStrength);
            currentStress = result.stressMPa;
            return { hoopStress: currentStress, utilizationRatio: result.utilizationRatio };
        }

        // If we got stored stress, we still need to calc ratio if not stored (currently ratio isn't stored in physics result explicit as 'utilizationRatio')
        // We can approximate or recalc.
        const mat = penstock?.material || 'S235';
        const yieldStrength = MaterialService.getYieldStrength(mat);
        const ratio = currentStress / (yieldStrength || 235);
        
        return { hoopStress: currentStress, utilizationRatio: ratio };
    }, [hydraulic?.head, physics?.surgePressureBar, physics?.hoopStressMPa, penstock]);

    // NC-10100: Alert Sync
    // Pulse if ratio > 0.85
    // Hard Shutdown if ratio > 1.0
    const isCritical = utilizationRatio > 0.85;
    const isCatastrophic = utilizationRatio > 1.0;

    // Hard Shutdown Trigger
    useEffect(() => {
        if (isCatastrophic) {
            // NC-25100: Log catastrophic failure
            saveLog({
                event_type: 'CATASTROPHIC_FAILURE',
                reason: 'Yield strength exceeded. Structural collapse imminent.',
                active_protection: 'EMERGENCY_SHUTDOWN',
                metric_value: hoopStress.toFixed(1),
                metric_unit: 'MPa',
                details: {
                    utilizationRatio,
                    material: penstock?.material
                }
            });

            console.error("CATASTROPHIC FAILURE: YIELD STRENGTH EXCEEDED. SIMULATION HALTED.");
        } else if (isCritical) {
            // Log warning
             saveLog({
                event_type: 'CRITICAL_STRESS_WARNING',
                reason: 'Hoop stress approaching yield limit.',
                active_protection: 'NONE',
                metric_value: hoopStress.toFixed(1),
                metric_unit: 'MPa',
                details: {
                    utilizationRatio
                }
            });
        }
    }, [isCatastrophic, isCritical]);

    if (!isCritical) return null;

    return (
        <div className={`fixed inset-0 z-[9999] pointer-events-none animate-[pulse_0.5s_ease-in-out_infinite] ${isCatastrophic ? 'bg-red-950/80' : 'bg-red-950/40'} ring-[12px] ring-inset ring-red-500/60 flex items-center justify-center`}>
            <div className={`bg-black/90 px-12 py-8 rounded-2xl border-2 ${isCatastrophic ? 'border-red-600 shadow-[0_0_150px_rgba(220,38,38,1)]' : 'border-red-500 shadow-[0_0_100px_rgba(220,38,38,0.6)]'} backdrop-blur-2xl transform scale-110`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl animate-bounce">⚠️</div>
                    <h1 className="text-5xl font-black text-red-500 tracking-[0.2em] uppercase">
                        {isCatastrophic ? 'YIELD FAILURE' : 'CRITICAL STRESS'}
                    </h1>
                    <div className="text-center text-red-400 font-mono text-3xl font-bold bg-red-950/50 px-6 py-2 rounded-lg border border-red-500/30">
                        {hoopStress.toFixed(1)} MPa
                        <span className="block text-sm text-red-300 mt-1">Ratio: {(utilizationRatio * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-red-600 font-mono text-sm tracking-widest animate-pulse">
                        {isCatastrophic ? 'SIMULATION STOP - STRUCTURAL COLLAPSE' : 'STRUCTURAL INTEGRITY COMPROMISED'}
                    </div>
                </div>
            </div>
            
            {/* Screen-glitch effect overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
    );
};
