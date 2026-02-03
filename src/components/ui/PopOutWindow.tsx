import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { telemetrySync } from '../../services/TelemetrySyncService';
import { Activity, Gauge, Radio, Box, BarChart3, FileSearch, Briefcase, Settings } from 'lucide-react';

// Lazy load heavy components
const TurbineRunner3D = lazy(() => import('../three/TurbineRunner3D').then(m => ({ default: m.TurbineRunner3D })));
const VibrationAnalyzer = lazy(() => import('../../features/telemetry/components/VibrationAnalyzer').then(m => ({ default: m.VibrationAnalyzer })));
const ForensicLab = lazy(() => import('../ForensicLab').then(m => ({ default: m.ForensicLab })));
const ExecutiveSummary = lazy(() => import('../dashboard/ExecutiveSummary').then(m => ({ default: m.ExecutiveSummary })));
const HPPForge = lazy(() => import('../forge/HPPForge').then(m => ({ default: m.HPPForge })));

const LoadingFallback = () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="animate-pulse text-lg">Loading Component...</div>
    </div>
);

// Basic Telemetry Widgets
const VibrationMonitor = ({ data }: { data?: any }) => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <Activity className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold uppercase mb-2">Vibration Monitor</h1>
        <div className="text-4xl font-mono text-cyan-300">
            {data?.vibration ? data.vibration.toFixed(2) : '2.40'} <span className="text-lg text-slate-500">mm/s</span>
        </div>
        <p className="text-slate-500 mt-4 text-sm font-mono">Live Telemetry Sync Active</p>
    </div>
);

const TemperatureChart = ({ data }: { data?: any }) => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <Gauge className="w-16 h-16 text-amber-400 mb-4" />
        <h1 className="text-2xl font-bold uppercase mb-2">Bearing Temp</h1>
        <div className="text-4xl font-mono text-amber-300">
            {data?.temp ? data.temp.toFixed(1) : '65.0'} <span className="text-lg text-slate-500">°C</span>
        </div>
        <p className="text-slate-500 mt-4 text-sm font-mono">Live Telemetry Sync Active</p>
    </div>
);

const AcousticMonitor = ({ data }: { data?: any }) => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <Radio className="w-16 h-16 text-fuchsia-400 mb-4 animate-ping" />
        <h1 className="text-2xl font-bold uppercase mb-2">Acoustic Emission</h1>
        <div className="text-4xl font-mono text-fuchsia-300">
            {data?.cavitation ? data.cavitation : '2'}<span className="text-lg text-slate-500">/10</span>
        </div>
        <p className="text-slate-500 mt-4 text-sm font-mono">Live Telemetry Sync Active</p>
    </div>
);

// Widget Header Component
const WidgetHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-slate-800">
        {icon}
        <h1 className="text-lg font-bold text-white uppercase">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">SYNCED</span>
        </div>
    </div>
);

export const PopOutWindow: React.FC = () => {
    const { widgetId } = useParams<{ widgetId: string }>();
    const [telemetry, setTelemetry] = useState<any>(null);
    const [turbineType, setTurbineType] = useState<string>('FRANCIS');

    // Subscribe to telemetry updates
    useEffect(() => {
        const unsubTelemetry = telemetrySync.subscribe('TELEMETRY_UPDATE', (data) => {
            setTelemetry(data);
        });
        return () => unsubTelemetry();
    }, []);

    // Subscribe to turbine type changes
    useEffect(() => {
        const unsubType = telemetrySync.subscribe('TURBINE_TYPE_CHANGE', (data: any) => {
            if (data?.type) {
                setTurbineType(data.type);
            }
        });
        return () => unsubType();
    }, []);

    // Render based on widgetId
    switch (widgetId) {
        case 'vibration':
            return <VibrationMonitor data={telemetry} />;
        case 'temperature':
            return <TemperatureChart data={telemetry} />;
        case 'acoustic':
            return <AcousticMonitor data={telemetry} />;
        case 'turbine-3d':
            return (
                <div className="h-screen w-screen bg-slate-900 flex flex-col">
                    <WidgetHeader title="3D Turbine Visualization" icon={<Box className="w-5 h-5 text-cyan-400" />} />
                    <div className="flex-1">
                        <Suspense fallback={<LoadingFallback />}>
                            <TurbineRunner3D rpm={150} className="w-full h-full" />
                        </Suspense>
                    </div>
                </div>
            );
        case 'vibration-analyzer':
            return (
                <div className="h-screen w-screen bg-slate-900 flex flex-col">
                    <WidgetHeader title="Vibration Analyzer" icon={<BarChart3 className="w-5 h-5 text-cyan-400" />} />
                    <div className="flex-1 overflow-auto p-4">
                        <Suspense fallback={<LoadingFallback />}>
                            <VibrationAnalyzer />
                        </Suspense>
                    </div>
                </div>
            );
        case 'forensic-lab':
            return (
                <div className="h-screen w-screen bg-slate-900 flex flex-col">
                    <WidgetHeader title="Forensic Lab" icon={<FileSearch className="w-5 h-5 text-amber-400" />} />
                    <div className="flex-1 overflow-auto p-4">
                        <Suspense fallback={<LoadingFallback />}>
                            <ForensicLab />
                        </Suspense>
                    </div>
                </div>
            );
        case 'executive-summary':
            return (
                <div className="h-screen w-screen bg-slate-900 flex flex-col">
                    <WidgetHeader title="Executive Summary" icon={<Briefcase className="w-5 h-5 text-emerald-400" />} />
                    <div className="flex-1 overflow-auto p-4">
                        <Suspense fallback={<LoadingFallback />}>
                            <ExecutiveSummary />
                        </Suspense>
                    </div>
                </div>
            );
        case 'forge':
            return (
                <div className="h-screen w-screen bg-slate-900 flex flex-col">
                    <WidgetHeader title="The Sovereign Forge" icon={<Settings className="w-5 h-5 text-amber-400" />} />
                    <div className="flex-1 overflow-auto p-4">
                        <Suspense fallback={<LoadingFallback />}>
                            <HPPForge />
                        </Suspense>
                    </div>
                </div>
            );
        default:
            return (
                <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                    <div className="text-6xl mb-4">🔌</div>
                    <h2 className="text-xl font-bold text-slate-400 mb-2">Unknown Widget</h2>
                    <p className="font-mono">Widget ID: {widgetId}</p>
                </div>
            );
    }
};
