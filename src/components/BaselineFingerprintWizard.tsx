// Baseline Fingerprint Wizard - 5-Point Load Recording
// Records "healthy state" at 0%, 25%, 50%, 75%, 100% load

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, CheckCircle, Circle, Play } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { CommissioningService } from '../services/CommissioningService';
import { EnhancedAsset } from '../models/turbine/types';
import { useTelemetry } from '../contexts/TelemetryContext';

interface BaselineFingerprintWizardProps {
    sessionId: string;
    asset: EnhancedAsset;
    onComplete: () => void;
}

export const BaselineFingerprintWizard: React.FC<BaselineFingerprintWizardProps> = ({
    sessionId,
    asset,
    onComplete
}) => {
    const { telemetry } = useTelemetry();
    const [recordedLoads, setRecordedLoads] = useState<Set<number>>(new Set());
    const [isRecording, setIsRecording] = useState(false);
    const [currentLoad, setCurrentLoad] = useState<number | null>(null);

    const loadLevels = [0, 25, 50, 75, 100];
    const tData = telemetry[asset.id];

    const recordBaseline = async (loadLevel: number) => {
        if (!tData) {
            alert('No telemetry data available. Please ensure turbine is running.');
            return;
        }

        setIsRecording(true);
        setCurrentLoad(loadLevel);

        // Simulate recording for 3 seconds to collect stable data
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock acoustic spectrum (in production: real FFT from microphone)
        const mockAcousticSpectrum = Array.from({ length: 100 }, () => Math.random() * 10);

        await CommissioningService.recordBaseline(sessionId, loadLevel, {
            acousticSpectrum: mockAcousticSpectrum,
            vibration: {
                horizontal: tData.vibration || 3.2,
                vertical: tData.vibration || 3.0,
                axial: tData.vibration * 0.5 || 1.5
            },
            temperatures: {
                bearing_upper: tData.temperature || 65,
                bearing_lower: tData.temperature + 3 || 68,
            },
            pressures: {
                inlet: 100,
                outlet: 20,
                servo: (tData as any).cylinderPressure || 60
            },
            powerOutput: (tData as any).output_power || (asset as any).capacity * (loadLevel / 100),
            efficiency: 90 + loadLevel / 20, // Mock efficiency curve
            waterFlow: (asset.turbine_config.design_flow || 0) * (loadLevel / 100)
        });

        setRecordedLoads(prev => new Set([...prev, loadLevel]));
        setIsRecording(false);
        setCurrentLoad(null);

        // Check if all 5 complete
        if (recordedLoads.size === 4) { // Will be 5 after this one
            onComplete();
        }
    };

    const allComplete = recordedLoads.size === 5;

    return (
        <GlassCard>
            <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Baseline</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                        Fingerprinting
                    </span>
                </h3>
                <p className="text-sm text-slate-400">
                    Record the "healthy state" signature at 5 load levels
                </p>
            </div>

            {/* Progress Overview */}
            <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-400 uppercase font-bold">Recording Progress</p>
                    <p className="text-sm font-black text-cyan-400">{recordedLoads.size}/5 Complete</p>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(recordedLoads.size / 5) * 100}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    />
                </div>
            </div>

            {/* Load Level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {loadLevels.map((load) => (
                    <LoadLevelCard
                        key={load}
                        loadLevel={load}
                        isRecorded={recordedLoads.has(load)}
                        isRecording={isRecording && currentLoad === load}
                        onRecord={() => recordBaseline(load)}
                        disabled={isRecording}
                    />
                ))}
            </div>

            {/* Current Telemetry Display */}
            {tData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <TelemetryCard
                        label="Vibration"
                        value={`${tData.vibration?.toFixed(1) || 'N/A'} mm/s`}
                        icon={Activity}
                        color="cyan"
                    />
                    <TelemetryCard
                        label="Temperature"
                        value={`${tData.temperature?.toFixed(1) || 'N/A'} °C`}
                        icon={Activity}
                        color="orange"
                    />
                    <TelemetryCard
                        label="Power Output"
                        value={`${(tData as any).output_power?.toFixed(1) || 'N/A'} MW`}
                        icon={Zap}
                        color="emerald"
                    />
                    <TelemetryCard
                        label="Current Load"
                        value={`${(((tData as any).output_power / (asset as any).capacity) * 100).toFixed(0) || 'N/A'}%`}
                        icon={Zap}
                        color="purple"
                    />
                </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                <p className="text-sm text-cyan-300 font-bold mb-2">📋 Instructions:</p>
                <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
                    <li>Set turbine to <strong>0% load (idle)</strong> and click "Record Baseline"</li>
                    <li>Wait for recording to complete (3 seconds)</li>
                    <li>Gradually increase load to <strong>25%</strong>, stabilize, then record</li>
                    <li>Repeat for <strong>50%</strong>, <strong>75%</strong>, and <strong>100%</strong> load</li>
                    <li>Each recording captures: Acoustic signature, Vibration, Temperature, Pressure</li>
                </ol>
            </div>

            {/* Completion Message */}
            {allComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-emerald-950/20 border border-emerald-500 rounded-lg flex items-center gap-3"
                >
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <div>
                        <p className="text-sm font-bold text-emerald-300">All Baselines Recorded!</p>
                        <p className="text-xs text-slate-400">Your turbine's "healthy state" fingerprint is complete.</p>
                    </div>
                </motion.div>
            )}
        </GlassCard>
    );
};

// ===== HELPER COMPONENTS =====

const LoadLevelCard: React.FC<{
    loadLevel: number;
    isRecorded: boolean;
    isRecording: boolean;
    onRecord: () => void;
    disabled: boolean;
}> = ({ loadLevel, isRecorded, isRecording, onRecord, disabled }) => {
    const Icon = isRecorded ? CheckCircle : Circle;

    return (
        <motion.div
            whileHover={!disabled ? { scale: 1.02 } : {}}
            className={`p-4 rounded-lg border-2 transition-all ${isRecorded
                ? 'bg-emerald-500/20 border-emerald-500'
                : isRecording
                    ? 'bg-cyan-500/20 border-cyan-500 animate-pulse'
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${isRecorded ? 'text-emerald-400' : isRecording ? 'text-cyan-400' : 'text-slate-500'
                    }`} />
                <span className={`text-xs font-bold px-2 py-1 rounded ${isRecorded ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700/50 text-slate-400'
                    }`}>
                    {isRecorded ? 'DONE' : isRecording ? 'RECORDING...' : 'PENDING'}
                </span>
            </div>

            <p className="text-2xl font-black text-white mb-1">{loadLevel}%</p>
            <p className="text-xs text-slate-400 mb-3">Load Level</p>

            {!isRecorded && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRecord}
                    disabled={disabled}
                    className="w-full px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold text-xs hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                    <Play className="w-3 h-3" />
                    Record
                </motion.button>
            )}
        </motion.div>
    );
};

const TelemetryCard: React.FC<{
    label: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
}> = ({ label, value, icon: Icon, color }) => {
    const colorClasses = {
        cyan: 'text-cyan-400',
        orange: 'text-orange-400',
        emerald: 'text-emerald-400',
        purple: 'text-purple-400'
    };

    return (
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${colorClasses[color as keyof typeof colorClasses]}`} />
                <p className="text-xs text-slate-400 uppercase font-bold">{label}</p>
            </div>
            <p className="text-lg font-black text-white">{value}</p>
        </div>
    );
};
