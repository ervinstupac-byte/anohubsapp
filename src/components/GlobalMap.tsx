import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next'; // IMPORT
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ShieldCheck, Activity, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom Pulsing Icon Generator
export const createPulsingIcon = (status: string) => {
    const color = status === 'CRITICAL' ? '#ff0033' : status === 'WARNING' ? '#ffaa00' : '#00f3ff';
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color};" class="marker-pin ${status === 'CRITICAL' || status === 'WARNING' ? 'animate-pulse shadow-neon' : ''}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};
L.Marker.prototype.options.icon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const MapAutoResize: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom());
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => clearTimeout(timer);
    }, [map, center]);

    return null;
};

export const GlobalMap: React.FC = () => {
    const { t } = useTranslation(); // HOOK
    const { assets, selectAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    // MIGRATED: Removed useCerebro dependency. 
    // Uses local defaults for structural/specialized data until those stores are created.
    // This allows the component to function without the full ProjectContext.
    const [center] = useState<[number, number]>([45.815, 15.98]);

    // Derived Stats
    const stats = {
        total: assets.length,
        critical: Object.values(telemetry).filter(t => t.status === 'CRITICAL').length,
        warning: Object.values(telemetry).filter(t => t.status === 'WARNING').length,
        power: Object.values(telemetry).reduce((acc, curr) => acc + curr.output, 0).toFixed(1)
    };

    // Placeholder data (pending StructuralStore and SpecializedStore)
    const remainingLife = 92.5;
    const gridFrequency = 50.02;

    return (
        <div className="relative h-full w-full overflow-hidden bg-slate-950 isolate">

            {/* --- HUD: TOP BAR --- */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
                {/* Back button removed for SCADA integration */}
                <div></div>

                <div className="flex gap-3 pointer-events-auto">
                    <GlassCard className="py-2 px-4 flex flex-col items-center min-w-[80px] bg-slate-900/90 backdrop-blur-xl border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t('globalMap.fleet', 'Fleet')}</span>
                        <span className="text-xl font-black text-white">{stats.total}</span>
                    </GlassCard>
                    <GlassCard className="py-2 px-4 flex flex-col items-center min-w-[100px] bg-slate-900/90 backdrop-blur-xl border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t('globalMap.liveMw', 'Live MW')}</span>
                        <span className="text-xl font-black text-cyan-400">{stats.power}</span>
                    </GlassCard>
                    <GlassCard className={`py-2 px-4 flex flex-col items-center min-w-[80px] bg-slate-900/90 backdrop-blur-xl ${stats.critical > 0 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-slate-700'}`}>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t('globalMap.alerts', 'Alerts')}</span>
                        <span className={`text-xl font-black ${stats.critical > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                            {stats.critical}
                        </span>
                    </GlassCard>
                </div>
            </div>

            {/* --- HUD: FLEET TACTICAL HUB --- */}
            <div className="absolute top-24 left-6 z-[1000] w-80 space-y-4 pointer-events-auto">
                <GlassCard variant="commander" className="bg-slate-900/60 backdrop-blur-2xl border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Fleet Tactical Hub</h3>
                            <p className="text-[9px] text-cyan-400/70 font-mono">BIHAĆ_BASIN_OVERWATCH</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {['UNIT_01', 'UNIT_02', 'UNIT_03'].map((unit, idx) => (
                            <div key={unit} className="p-3 bg-white/5 border border-white/10 rounded-xl relative group overflow-hidden">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest">{unit}</span>
                                    <span className={`text-[10px] font-mono font-bold ${idx === 1 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                        {idx === 0 ? remainingLife.toFixed(1) : (98.2 - (idx * 0.5)).toFixed(1)}% RUL
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${idx === 0 && remainingLife < 50 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${idx === 0 ? remainingLife : (98.2 - (idx * 0.5))}%` }}
                                    />
                                </div>
                                {idx === 1 && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                            <Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-1">Fleet Optimization</p>
                                <p className="text-[10px] text-slate-300 leading-relaxed italic">
                                    "Unit 02 has the lowest Fatigue Index; prioritize it for high-load grid stabilization to preserve Unit 01."
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* --- HUD: BOTTOM LIVE LOG (Proactive Console Feed) --- */}
            <div className="absolute bottom-6 right-6 z-[1000] w-80 pointer-events-none hidden md:block">
                <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl space-y-3 noise-commander overflow-hidden relative">
                    <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                    <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2 relative z-10">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">Live Optimization Trace</p>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center text-[10px] animate-pulse">
                            <span className="text-cyan-400 font-mono">GRID_FREQ</span>
                            <span className="text-white font-mono font-bold">{gridFrequency.toFixed(2)} Hz</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-mono">FATIGUE_DELTA</span>
                            <span className="text-white font-mono font-bold">+0.023 α/hr</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-mono">REVENUE_FLUX</span>
                            <span className="text-emerald-400 font-mono font-bold">+€142.50</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAP ENGINE --- */}
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: '100%', width: '100%', background: '#020617', zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap & CartoDB'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapAutoResize center={center} />

                {assets.map(asset => {
                    const liveData = telemetry[asset.id];
                    const isCritical = liveData?.status === 'CRITICAL';
                    const isWarning = liveData?.status === 'WARNING';

                    // Translate status
                    const statusDisplay = liveData?.status
                        ? (liveData.status === 'CRITICAL' ? t('globalMap.status.critical') : liveData.status === 'WARNING' ? t('globalMap.status.warning') : liveData.status)
                        : t('globalMap.syncing');

                    return (
                        <Marker
                            key={asset.id}
                            position={asset.coordinates}
                            icon={createPulsingIcon(liveData?.status || 'OPTIMAL')}
                        >
                            <Popup className="custom-popup" closeButton={false}>
                                <div className={`bg-slate-900 text-white p-4 rounded-xl border shadow-2xl min-w-[260px] relative overflow-hidden ${isCritical ? 'border-red-500 shadow-red-900/50' :
                                    isWarning ? 'border-amber-500' : 'border-slate-600'
                                    }`}>
                                    <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}></div>

                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{asset.name}</h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{asset.type} • {asset.location}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wide ${isCritical ? 'bg-red-500 text-white animate-pulse' :
                                            isWarning ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            }`}>
                                            {statusDisplay}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-4 pl-2">
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">{t('globalMap.vibration', 'Vibration')}</div>
                                            <div className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400' : 'text-white'}`}>
                                                {liveData?.vibration.toFixed(3) || '0.00'} <span className="text-[9px] text-slate-500">mm/s</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">{t('globalMap.temp', 'Temp')}</div>
                                            <div className="text-sm font-mono font-bold text-amber-400">
                                                {liveData?.temperature || 0}°C
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">{t('globalMap.output', 'Output')}</div>
                                            <div className="text-sm font-mono font-bold text-cyan-400">
                                                {liveData?.output || 0} MW
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">{t('globalMap.eff', 'Eff.')}</div>
                                            <div className="text-sm font-mono font-bold text-emerald-400">
                                                {liveData?.efficiency || 0}%
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => selectAsset(asset.id)}
                                        className="w-full bg-cyan-600/10 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-cyan-600/30 text-xs font-bold py-2.5 rounded-lg transition-all uppercase tracking-wide flex items-center justify-center gap-2 group"
                                    >
                                        <span>{t('globalMap.openDashboard', 'Open Dashboard')}</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};