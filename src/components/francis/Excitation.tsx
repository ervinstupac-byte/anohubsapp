import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Activity, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { ROUTES } from '../../routes/paths';

export const Excitation: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // States
    const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO'); // AVR vs FCR
    const [fieldBreaker, setFieldBreaker] = useState(false);
    const [fieldFlashing, setFieldFlashing] = useState(false);
    const [voltage, setVoltage] = useState(0); // 0 to 100%

    // Simulation logic
    const toggleFieldBreaker = () => {
        const newState = !fieldBreaker;
        setFieldBreaker(newState);
        if (!newState) {
            setVoltage(0);
            setFieldFlashing(false);
        }
    };

    const activateFlashing = () => {
        if (!fieldBreaker) return;
        setFieldFlashing(true);
        // Simulate voltage buildup
        setTimeout(() => setVoltage(20), 500);
        setTimeout(() => setVoltage(60), 1000);
        setTimeout(() => setVoltage(100), 1500);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono p-4 md:p-8">
            <button onClick={() => navigate(`/francis/${ROUTES.FRANCIS.HUB}`)} className="flex items-center gap-2 mb-6 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>{t('actions.back', 'Back to Hub')}</span>
            </button>

            <header className="mb-8 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                        <Zap className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">{t('francis.excitation.title', 'Excitation System')}</h1>
                        <p className="text-slate-500 text-xs tracking-widest">{t('francis.excitation.subtitle', 'AVR & Field Current Regulation')}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    {/* Mode Selector */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">{t('francis.excitation.mode', 'Control Mode')}</h3>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => setMode('AUTO')}
                                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${mode === 'AUTO' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                AUTO (AVR)
                            </button>
                            <button
                                onClick={() => setMode('MANUAL')}
                                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${mode === 'MANUAL' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                MANUAL (FCR)
                            </button>
                        </div>
                    </div>

                    {/* Field Breaker */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase">{t('francis.excitation.fieldBreaker', 'Field Breaker')}</h3>
                            <div className={`text-xs mt-1 ${fieldBreaker ? 'text-green-400' : 'text-red-400'}`}>
                                {fieldBreaker ? 'CLOSED (ACTIVE)' : 'OPEN (ISOLATED)'}
                            </div>
                        </div>
                        <button onClick={toggleFieldBreaker} className="focus:outline-none">
                            {fieldBreaker ? (
                                <ToggleRight className="w-10 h-10 text-green-500 cursor-pointer hover:text-green-400" />
                            ) : (
                                <ToggleLeft className="w-10 h-10 text-slate-600 cursor-pointer hover:text-slate-500" />
                            )}
                        </button>
                    </div>

                    {/* Field Flashing */}
                    <div className={`bg-slate-900/50 p-6 rounded-xl border border-slate-700 transition-all ${fieldBreaker ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase">{t('francis.excitation.flashing', 'Field Flashing')}</h3>
                            {fieldFlashing && <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-[10px] border border-yellow-500/30 rounded">ACTIVE</span>}
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Required for initial voltage buildup if residual magnetism is low.</p>
                        <button
                            onClick={activateFlashing}
                            disabled={fieldFlashing || voltage > 10}
                            className={`w-full py-3 rounded border text-xs font-bold uppercase tracking-wider transition-all
                                ${fieldFlashing ? 'bg-green-900/20 text-green-500 border-green-500/30 cursor-default' : 'bg-yellow-600 hover:bg-yellow-500 text-white border-transparent'}`}
                        >
                            {fieldFlashing ? 'Flashing Complete' : 'Activate Flash'}
                        </button>
                    </div>

                    {/* Synapse Link */}
                    <button
                        onClick={() => navigate(`/${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.LOGBOOK}`, {
                            state: { source: 'Excitation System', reason: voltage < 90 ? 'Low Voltage Buildup' : 'Routine Check' }
                        })}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded border border-slate-600 transition-colors"
                    >
                        <Activity className="w-4 h-4" />
                        {t('actions.logObservation', 'Log Observation')}
                    </button>
                </div>

                {/* Status Monitor */}
                <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity className="w-32 h-32" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-6">{t('francis.excitation.monitor', 'System Monitor')}</h3>

                    <div className="space-y-6">
                        {/* Voltage Meter */}
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span>Generator Voltage</span>
                                <span className={voltage >= 95 ? 'text-green-400' : 'text-yellow-400'}>{voltage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${voltage >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${voltage}%` }}
                                />
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-3 bg-slate-950 rounded border border-slate-800">
                                <div className="text-[10px] text-slate-500 uppercase">Excitation Current</div>
                                <div className="text-lg font-mono text-cyan-400">{voltage > 0 ? (voltage * 8.5).toFixed(0) : 0} A</div>
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-800">
                                <div className="text-[10px] text-slate-500 uppercase">Thyristor Temp</div>
                                <div className="text-lg font-mono text-white">42°C</div>
                            </div>
                        </div>
                    </div>

                    {voltage >= 95 && (
                        <div className="mt-6 flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-xs font-bold">VOLTAGE STABLE - READY FOR SYNCHRONIZATION</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Excitation;
