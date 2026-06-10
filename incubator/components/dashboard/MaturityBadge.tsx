import React, { useMemo } from 'react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { TechnicalProjectState } from '../../core/TechnicalSchema';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface MaturityBadgeProps {
    state: TechnicalProjectState;
}

export const MaturityBadge: React.FC<MaturityBadgeProps> = ({ state }) => {
    const { completeness, missingFields } = useMemo(() => {
        const criticalFields = [
            { path: 'identity.assetName', label: 'Asset Name', weight: 5 },
            { path: 'identity.totalOperatingHours', label: 'Operating Hours', weight: 5 },
            { path: 'mechanical.bearingTemp', label: 'Bearing Temperature', weight: 10 },
            { path: 'mechanical.vibration', label: 'Vibration Data', weight: 10 },
            { path: 'mechanical.insulationResistance', label: 'Megger Test', weight: 10, requiredValue: 0 },
            { path: 'mechanical.axialPlay', label: 'Axial Play', weight: 10, requiredValue: 0 },
            { path: 'hydraulic.head', label: 'Design Head', weight: 10 },
            { path: 'hydraulic.flow', label: 'Design Flow', weight: 10 },
            { path: 'penstock.wallThickness', label: 'Wall Thickness', weight: 10 },
            { path: 'penstock.materialYieldStrength', label: 'Material Yield', weight: 10 },
            { path: 'site.designPerformanceMW', label: 'Design Performance', weight: 10 }
        ];

        let totalWeight = 0;
        let earnedWeight = 0;
        const missing: string[] = [];

        criticalFields.forEach(field => {
            totalWeight += field.weight;
            const value = field.path.split('.').reduce((obj: any, key: string) => obj?.[key], state);

            // Check if value exists and is not default/zero (if requiredValue is set)
            const isFilled = value !== undefined && value !== null && value !== '' &&
                (field.requiredValue !== undefined ? value !== field.requiredValue : true);

            if (isFilled) {
                earnedWeight += field.weight;
            } else {
                missing.push(field.label);
            }
        });

        return {
            completeness: Math.round((earnedWeight / totalWeight) * 100),
            missingFields: missing
        };
    }, [state]);

    const color = completeness > 90 ? 'text-green-400' : completeness > 60 ? 'text-yellow-400' : 'text-red-400';
    const bgColor = completeness > 90 ? 'bg-green-500/10' : completeness > 60 ? 'bg-yellow-500/10' : 'bg-red-500/10';
    const borderColor = completeness > 90 ? 'border-green-500/30' : completeness > 60 ? 'border-yellow-500/30' : 'border-red-500/30';

    return (
        <div className={`p-4 rounded-lg border ${borderColor} ${bgColor} backdrop-blur-sm group relative`}>
            <div className="flex items-center gap-3">
                {completeness > 80 ? (
                    <ShieldCheck className={`w-6 h-6 ${color}`} />
                ) : (
                    <AlertCircle className={`w-6 h-6 ${color} animate-pulse`} />
                )}
                <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Asset Maturity Audit</div>
                    <div className={`text-xl font-black font-mono ${color}`}>{completeness}% COMPLETE</div>
                </div>
            </div>

            {missingFields.length > 0 && (
                <div className="mt-2 space-y-1">
                    {completeness < 70 && (
                        <div className="text-[9px] text-red-400 font-black animate-pulse flex items-center gap-1 mb-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            DATA GAP ALERT: PRIORITY AUDIT REQUIRED
                        </div>
                    )}
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Missing Critical Parameters:</div>
                    <div className="flex flex-wrap gap-1">
                        {missingFields.slice(0, 3).map(f => (
                            <span key={f} className="px-1.5 py-0.5 bg-black/40 rounded text-[8px] text-slate-400 border border-white/5">{f}</span>
                        ))}
                        {missingFields.length > 3 && (
                            <span className="text-[8px] text-slate-500">+{missingFields.length - 3} more</span>
                        )}
                    </div>
                </div>
            )}

            {/* Tooltip on hover */}
            <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                <p className="text-[10px] text-slate-300 leading-tight">
                    <span className="font-bold text-cyan-400 block mb-1">PRO-BONO ENGINEERING TOOL</span>
                    Audit measures data fidelity across Mechanical and Hydraulic domains.
                    Calculations are based on fundamental principles (Barlow, ISO, IEC).
                    <span className="text-slate-500 block mt-1 italic font-mono text-[8px]">Precision = 50yr Longevity.</span>
                </p>
            </div>
        </div>
    );
};
