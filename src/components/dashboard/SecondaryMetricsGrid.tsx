import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { Activity, ShieldAlert, Zap, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

export const SecondaryMetricsGrid: React.FC = () => {
    const { physics, hydraulic, geodeticData, magneticData, acousticMatch, insulationResistance, unifiedDiagnosis } = useTelemetryStore();

    const metrics = [
        {
            label: 'Hoop Stress',
            value: physics.hoopStress?.toFixed(2) || '0.00',
            unit: 'MPa',
            icon: ShieldAlert,
            color: 'text-rose-400',
            sub: 'Penstock Tension'
        },
        {
            label: 'Axial Thrust',
            value: physics.axialThrustKN?.toFixed(1) || '0.0',
            unit: 'kN',
            icon: Activity,
            color: 'text-cyan-400',
            sub: 'Rotor Force'
        },
        {
            label: 'Volumetric Loss',
            value: physics.volumetricLoss?.toFixed(3) || '0.000',
            unit: 'm³/s',
            icon: Droplets,
            color: 'text-blue-400',
            sub: 'Internal Leakage'
        },
        {
            label: 'Friction Loss',
            value: physics.headLoss?.toFixed(2) || '0.00',
            unit: 'm',
            icon: Zap,
            color: 'text-amber-400',
            sub: "Manning's Head Loss"
        },
        {
            label: 'Acoustic Match',
            value: (acousticMatch || 0).toFixed(1),
            unit: '%',
            icon: Activity,
            color: 'text-emerald-400',
            sub: 'Fingerprint Sync'
        },
        {
            label: 'Insulation',
            value: (insulationResistance || 0).toString(),
            unit: 'MΩ',
            icon: Zap,
            color: 'text-yellow-400',
            sub: 'Stator Health'
        },
        {
            label: 'Settlement',
            value: (geodeticData?.settlement || 0).toFixed(2),
            unit: 'mm',
            icon: ShieldAlert,
            color: 'text-orange-400',
            sub: 'Foundation Stability'
        },
        {
            label: 'Eccentricity',
            value: (magneticData?.eccentricity || 0).toFixed(3),
            unit: 'mm',
            icon: Activity,
            color: 'text-purple-400',
            sub: 'Magnetic Center'
        },
        {
            label: 'Cathodic Prot.',
            value: unifiedDiagnosis?.corrosionAlerts?.[0]?.averageVoltage?.toString() || '-780',
            unit: 'mV',
            icon: ShieldCheck,
            color: 'text-emerald-500',
            sub: 'Zinc Anode Life'
        },
        {
            label: 'Thermal Rate',
            value: (unifiedDiagnosis?.thermalInertia?.rate || 0.5).toFixed(2),
            unit: '°C/min',
            icon: Thermometer,
            color: 'text-orange-500',
            sub: 'Inertia Watcher'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {metrics.map((m, i) => (
                <GlassCard key={i} className="p-4 border-slate-800/50 hover:border-slate-700/50 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-slate-900/50 ${m.color}`}>
                            <m.icon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{m.label}</p>
                            <p className="text-[9px] text-slate-600 font-bold">{m.sub}</p>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
                            {m.value}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{m.unit}</span>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
};
