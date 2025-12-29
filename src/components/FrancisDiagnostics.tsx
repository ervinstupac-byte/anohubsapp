import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Droplets,
    Gauge,
    Play,
    Thermometer,
    Zap,
    AlertOctagon
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { ModernButton } from './ui/ModernButton';
import { ModernInput } from './ui/ModernInput';
import { diagnoseFrancisFault, FrancisTelemetry, DiagnosticResult } from '../lib/francis_logic';

import { useNotifications } from '../contexts/NotificationContext';

export const FrancisDiagnostics: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { pushNotification } = useNotifications();

    // -- STATE --
    const [inputs, setInputs] = useState<FrancisTelemetry>({
        bearingTemp: 45.0,
        vibration: 0.5,
        siltPpm: 50,
        gridFreq: 50.0,
        loadMw: 12.5,
        mivStatus: 'OPEN'
    });

    const [results, setResults] = useState<DiagnosticResult[] | null>(null);

    // -- HANDLERS --
    const handleRunDiagnostics = () => {
        const outcomes = diagnoseFrancisFault(inputs);
        setResults(outcomes);
        pushNotification('INFO', 'Francis Logic Engine: Analysis Complete');
    };

    const handleInputChange = (field: keyof FrancisTelemetry, value: string) => {
        setInputs(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center animate-fade-in relative">

            {/* BACKGROUND VFX */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[100px] rounded-full" />
            </div>

            {/* NAV BACK */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Toolbox
                </button>
            </div>

            <GlassCard className="w-full max-w-2xl border-t-4 border-t-cyan-500 relative z-10 shadow-2xl">

                {/* HEADER */}
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                        <Activity className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2">
                        Francis Turbine <span className="text-cyan-400">Fault Isolation</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-mono max-w-md mx-auto">
                        Enter current telemetry to validate against SOP limits (Ref: SOP-ROT-001, FR-EP-001).
                    </p>
                </div>

                {/* INPUT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <ModernInput
                        label="Bearing Temperature (°C)"
                        value={inputs.bearingTemp}
                        onChange={(e) => handleInputChange('bearingTemp', e.target.value)}
                        type="number"
                        min={0}
                        max={150}
                        helperText="Nominal: < 60°C"
                        placeholder="e.g. 45.0"
                        icon={<Thermometer className="w-4 h-4 text-emerald-500" />}
                    />

                    <ModernInput
                        label="Vibration (mm/s)"
                        value={inputs.vibration}
                        onChange={(e) => handleInputChange('vibration', e.target.value)}
                        type="number"
                        min={0}
                        max={50}
                        step={0.1}
                        helperText="Nominal: < 2.5 mm/s"
                        placeholder="e.g. 0.5"
                        icon={<Activity className="w-4 h-4 text-purple-500" />}
                    />

                    <ModernInput
                        label="Silt Concentration (ppm)"
                        value={inputs.siltPpm}
                        onChange={(e) => handleInputChange('siltPpm', e.target.value)}
                        type="number"
                        min={0}
                        max={50000}
                        helperText="Nominal: < 3000 ppm"
                        placeholder="e.g. 50"
                        icon={<Droplets className="w-4 h-4 text-amber-500" />}
                    />

                    <ModernInput
                        label="Grid Frequency (Hz)"
                        value={inputs.gridFreq}
                        onChange={(e) => handleInputChange('gridFreq', e.target.value)}
                        type="number"
                        step="0.01"
                        min={45.0}
                        max={55.0}
                        helperText="Nominal: 50.00 Hz ± 1%"
                        placeholder="e.g. 50.00"
                        icon={<Zap className="w-4 h-4 text-blue-500" />}
                    />
                </div>

                {/* ACTION BUTTON */}
                <ModernButton
                    onClick={handleRunDiagnostics}
                    className="w-full py-4 text-lg font-black bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] mb-8"
                >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    RUN DIAGNOSTICS
                </ModernButton>

                {/* RESULTS SECTION */}
                {results && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                            Diagnostic Outcomes
                        </h3>

                        {results.length === 0 || (results.length === 1 && results[0].status === 'NORMAL') ? (
                            <div className="p-4 bg-emerald-900/10 border border-emerald-500/30 rounded-lg flex items-center gap-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-emerald-400 font-bold uppercase text-sm">All Parameters Nominal</h4>
                                    <p className="text-slate-400 text-xs">System operating within design limits.</p>
                                </div>
                            </div>
                        ) : (
                            results.map((res, idx) => {
                                const isCritical = res.status === 'CRITICAL' || res.status === 'EMERGENCY';
                                const isWarning = res.status === 'WARNING';

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            p-5 rounded-lg border-l-4 flex gap-4 items-start relative overflow-hidden transition-all
                                            ${isCritical ? 'bg-red-950/20 border-red-500 border-l-red-600 animate-pulse-gentle' : ''}
                                            ${isWarning ? 'bg-amber-950/20 border-amber-500/30 border-l-amber-500' : ''}
                                            ${res.status === 'NORMAL' ? 'bg-slate-900 border-slate-700' : ''}
                                        `}
                                    >
                                        {/* Icon Logic */}
                                        {isCritical ? (
                                            <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                        ) : isWarning ? (
                                            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                                        ) : (
                                            <CheckCircle className="w-6 h-6 text-slate-500 flex-shrink-0 mt-1" />
                                        )}

                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-black uppercase tracking-tight ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-300'
                                                    }`}>
                                                    {res.status}: {res.message}
                                                </h4>
                                                {res.referenceProtocol && (
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-black/30 rounded text-slate-500 font-mono">
                                                        REF: {res.referenceProtocol}
                                                    </span>
                                                )}
                                            </div>

                                            {res.action && (
                                                <div className="mt-2 text-xs bg-black/20 p-2 rounded border border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase mr-2">Recommended Action:</span>
                                                    <span className="text-slate-300">{res.action}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

            </GlassCard>
        </div>
    );
};
