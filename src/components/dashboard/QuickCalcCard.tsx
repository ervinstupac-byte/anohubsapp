import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Wrench, AlertTriangle, ArrowRight, Target, Ruler, Activity } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useNavigate } from 'react-router-dom';
import Decimal from 'decimal.js';

/**
 * QuickCalcCard — Asset-Bound Intelligence
 * 
 * Displays TARGET VALUES directly from selectedAsset.specs.
 * Shows visual alerts when current measurements exceed specifications.
 * Prioritizes turbine-specific metrics (Francis vs Kaplan).
 */

interface SpecCard {
    id: string;
    label: string;
    targetValue: string | number;
    unit: string;
    currentValue?: number;
    status: 'nominal' | 'warning' | 'critical';
    route: string;
    icon: React.ReactNode;
}

export const QuickCalcCard: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const { mechanical, physics } = useTelemetryStore();
    const navigate = useNavigate();

    const specCards = useMemo((): SpecCard[] => {
        if (!selectedAsset) return [];

        const specs = (selectedAsset.specs || {}) as Record<string, any>;
        const type = selectedAsset.turbine_type || 'FRANCIS';
        const cards: SpecCard[] = [];

        // 1. Bolt Torque (Differs by type priority)
        // Francis: Runner Bolts are critical
        // Kaplan: Blade Bolts are critical
        const boltSpecs = specs.boltSpecs || (mechanical as any).boltSpecs || {};
        if (boltSpecs.grade && boltSpecs.diameter) {
            const diameter = new Decimal(boltSpecs.diameter);
            const gradeYield = boltSpecs.grade === '12.9' ? 1080 : boltSpecs.grade === '10.9' ? 940 : 640;

            // Lubrication factor (K) - usually 0.18 for oiled steel
            const kFactor = new Decimal(0.18);

            // Torque = K * D * F_preload (75% yield)
            // F_preload = 0.75 * Yield * Area
            const area = new Decimal(Math.PI).mul(diameter.mul(0.9).pow(2)).div(4); // Stress area approx
            const preload = new Decimal(gradeYield).mul(0.75).mul(area);
            const targetTorque = kFactor.mul(diameter.div(1000)).mul(preload);

            cards.push({
                id: 'bolt-torque',
                label: type === 'FRANCIS' ? 'Runner Coupling Torque' : 'Blade Bolt Torque',
                targetValue: targetTorque.round().toNumber(),
                unit: 'Nm',
                status: 'nominal',
                route: '/maintenance/bolt-torque',
                icon: <Wrench className="w-4 h-4 text-emerald-400" />
            });
        }

        // 2. Alignment / Clearances
        if (type === 'FRANCIS') {
            // Labyrinth Seal Clearance
            const maxClearance = new Decimal(specs.maxLabyrinthClearance || 0.5);
            const currentClearance = new Decimal((mechanical as any).radialClearance || 0);
            const isBreach = currentClearance.gt(maxClearance);

            cards.push({
                id: 'clearance',
                label: 'Max Labyrinth Gap',
                targetValue: maxClearance.toFixed(2),
                unit: 'mm',
                currentValue: currentClearance.toNumber(),
                status: isBreach ? 'critical' : 'nominal',
                route: '/maintenance/shaft-alignment',
                icon: <Ruler className="w-4 h-4 text-cyan-400" />
            });
        } else {
            // Kaplan: Blade Tip Clearance
            const minGap = new Decimal(specs.minBladeGap || 2.0);
            const currentGap = new Decimal((mechanical as any).bladeGap || 2.5);
            const isWarning = currentGap.lt(minGap.mul(1.1));

            cards.push({
                id: 'clearance',
                label: 'Min Blade Tip Gap',
                targetValue: minGap.toFixed(1),
                unit: 'mm',
                currentValue: currentGap.toNumber(),
                status: currentGap.lt(minGap) ? 'critical' : isWarning ? 'warning' : 'nominal',
                route: '/maintenance/shaft-alignment',
                icon: <Ruler className="w-4 h-4 text-cyan-400" />
            });
        }

        // 3. Vibration ISO Limit
        const vibLimit = new Decimal(specs.vibrationLimit || 3.5); // mm/s RMS
        const currentVib = new Decimal(mechanical.vibration || 0);
        const vibStatus = currentVib.gt(vibLimit.mul(1.5)) ? 'critical' : currentVib.gt(vibLimit) ? 'warning' : 'nominal';

        cards.push({
            id: 'vibration',
            label: 'ISO 10816 Limit',
            targetValue: vibLimit.toFixed(1),
            unit: 'mm/s',
            currentValue: currentVib.toNumber(),
            status: vibStatus,
            route: '/francis/diagnostics',
            icon: <Activity className="w-4 h-4 text-purple-400" />
        });

        return cards;
    }, [selectedAsset, mechanical, physics, t]);

    if (!selectedAsset) return null;

    const hasWarnings = specCards.some(c => c.status !== 'nominal');

    return (
        <GlassCard className={`relative overflow-hidden ${hasWarnings ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-500'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasWarnings ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                        <Target className={`w-5 h-5 ${hasWarnings ? 'text-amber-400' : 'text-blue-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('dashboard.quickCalc.title')}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">
                            {selectedAsset.name} • Target Values
                        </p>
                    </div>
                </div>
            </div>

            {/* Spec Cards Grid */}
            <div className="grid grid-cols-1 gap-2 p-3">
                {specCards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => navigate(card.route)}
                        className={`
                            flex items-center justify-between p-3 rounded-xl border text-left transition-all group
                            ${card.status === 'critical'
                                ? 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20'
                                : card.status === 'warning'
                                    ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20'
                                    : 'bg-slate-900/40 border-white/5 hover:border-blue-500/40 hover:bg-slate-900/60'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5">
                                {card.icon}
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                                    {card.label}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-lg font-mono font-black ${card.status === 'critical' ? 'text-red-400' :
                                            card.status === 'warning' ? 'text-amber-400' : 'text-white'
                                        }`}>
                                        {card.targetValue}
                                    </span>
                                    <span className="text-xs text-slate-500">{card.unit}</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Value / Status */}
                        <div className="text-right">
                            {card.currentValue !== undefined && (
                                <>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Current</div>
                                    <div className={`font-mono font-bold text-sm ${card.status === 'critical' ? 'text-red-400' :
                                            card.status === 'warning' ? 'text-amber-400' :
                                                'text-slate-300'
                                        }`}>
                                        {card.currentValue.toFixed(2)}
                                    </div>
                                </>
                            )}
                            <div className="mt-1 flex justify-end">
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {specCards.length === 0 && (
                <div className="p-6 text-center">
                    <Calculator className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Configure asset specs to see targets</p>
                </div>
            )}
        </GlassCard>
    );
};
