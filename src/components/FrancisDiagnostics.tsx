import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './ui/GlassCard';
import { ModernButton } from './ui/ModernButton';
import { ModernInput } from './ui/ModernInput';
import { diagnoseFrancisFault, DiagnosticResult } from '../lib/francis_logic';
// Remove import { FRANCIS_PROTOCOLS } from '../data/protocols/francis_horizontal_protocols'; if not used directly here yet, or use it to link.
import { ArrowLeft, Stethoscope, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export const FrancisDiagnostics: React.FC = () => {
    const navigate = useNavigate();

    // State for manual telemetry input
    const [telemetry, setTelemetry] = useState({
        bearingTemp: 45,
        vibration: 1.2,
        siltPpm: 500,
        gridFreq: 50.0,
        loadMw: 4.2,
        mivStatus: 'OPEN' as 'OPEN' | 'CLOSED'
    });

    const [results, setResults] = useState<DiagnosticResult[] | null>(null);

    const handleRunDiagnosis = () => {
        const diagnostics = diagnoseFrancisFault(telemetry);
        setResults(diagnostics);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'EMERGENCY': return 'text-red-500 bg-red-500/10 border-red-500/50';
            case 'CRITICAL': return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
            case 'WARNING': return 'text-amber-500 bg-amber-500/10 border-amber-500/50';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest flex items-center gap-3">
                            <Stethoscope className="w-8 h-8 text-cyan-400" />
                            FRANCIS DIAGNOSTICS
                        </h1>
                        <p className="text-slate-500 font-mono text-sm">
                            Manual Fault Isolation Engine • Ref: SOP-ROT-001
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* INPUT PANEL */}
                    <GlassCard className="p-6 space-y-6 border-cyan-500/30">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Current Observations</h2>
                            <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <ModernInput
                                label="Bearing Temperature (°C)"
                                type="number"
                                value={telemetry.bearingTemp}
                                onChange={(e) => setTelemetry({ ...telemetry, bearingTemp: Number(e.target.value) })}
                            />
                            <ModernInput
                                label="Vibration (mm/s)"
                                type="number"
                                value={telemetry.vibration}
                                onChange={(e) => setTelemetry({ ...telemetry, vibration: Number(e.target.value) })}
                            />
                            <ModernInput
                                label="Silt Concentration (PPM)"
                                type="number"
                                value={telemetry.siltPpm}
                                onChange={(e) => setTelemetry({ ...telemetry, siltPpm: Number(e.target.value) })}
                            />
                            <ModernInput
                                label="Grid Frequency (Hz)"
                                type="number"
                                value={telemetry.gridFreq}
                                step="0.1"
                                onChange={(e) => setTelemetry({ ...telemetry, gridFreq: Number(e.target.value) })}
                            />
                        </div>

                        <ModernButton
                            variant="primary"
                            className="w-full mt-4"
                            onClick={handleRunDiagnosis}
                        >
                            Run Diagnostic Engine
                        </ModernButton>
                    </GlassCard>

                    {/* RESULTS PANEL */}
                    <div className="space-y-6">
                        {results ? (
                            results.map((res, idx) => (
                                <div
                                    key={idx}
                                    className={`p-6 rounded-xl border ${getStatusColor(res.status)} animate-fade-in`}
                                >
                                    <div className="flex items-start gap-4">
                                        {res.status === 'NORMAL' ? (
                                            <CheckCircle className="w-8 h-8 flex-shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                                        )}
                                        <div>
                                            <h3 className="font-black text-lg mb-1">{res.status}</h3>
                                            <p className="font-bold text-sm mb-2">{res.message}</p>
                                            {res.action && (
                                                <div className="text-xs bg-black/20 p-3 rounded">
                                                    <span className="opacity-70 font-mono block mb-1">RECOMMENDED ACTION:</span>
                                                    {res.action}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
                                <p className="text-slate-600 text-center">
                                    Enter telemetry data and run diagnostics to identify faults based on Francis Horizontal logic.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
