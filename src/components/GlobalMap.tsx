import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from './AssetPicker.tsx'; 
import { useTelemetry } from '../contexts/TelemetryContext.tsx'; 
import { GlassCard } from './ui/GlassCard.tsx'; 

// --- LEAFLET ICON FIX (Standard Marker) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- 🛠️ CRITICAL FIX: MAP RESIZER ---
// Ova komponenta popravlja problem "sive/polovične mape"
const MapAutoResize: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    
    useEffect(() => {
        // 1. Postavi centar
        map.setView(center, map.getZoom());
        
        // 2. Prisili mapu da preračuna veličinu nakon što se DOM učita
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => clearTimeout(timer);
    }, [map, center]);

    return null;
};

// --- MAIN COMPONENT ---
export const GlobalMap: React.FC = () => {
    const { assets, selectAsset } = useAssetContext();
    const { telemetry } = useTelemetry(); 
    const [center] = useState<[number, number]>([45.815, 15.98]);

    // Live Stats calculation
    const stats = {
        total: assets.length,
        critical: Object.values(telemetry).filter(t => t.status === 'CRITICAL').length,
        warning: Object.values(telemetry).filter(t => t.status === 'WARNING').length,
        power: Object.values(telemetry).reduce((acc, curr) => acc + curr.output, 0).toFixed(1)
    };

    return (
        <div className="relative h-[calc(100vh-100px)] w-full rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl animate-fade-in bg-slate-950 isolate">
            
            {/* --- HUD: TOP BAR --- */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <BackButton text="Back to Hub" />
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <GlassCard className="py-2 px-4 flex flex-col items-center min-w-[80px] bg-slate-900/90 backdrop-blur-xl border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Fleet</span>
                        <span className="text-xl font-black text-white">{stats.total}</span>
                    </GlassCard>
                    <GlassCard className="py-2 px-4 flex flex-col items-center min-w-[100px] bg-slate-900/90 backdrop-blur-xl border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Live MW</span>
                        <span className="text-xl font-black text-cyan-400">{stats.power}</span>
                    </GlassCard>
                    <GlassCard className={`py-2 px-4 flex flex-col items-center min-w-[80px] bg-slate-900/90 backdrop-blur-xl ${stats.critical > 0 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-slate-700'}`}>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Alerts</span>
                        <span className={`text-xl font-black ${stats.critical > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                            {stats.critical}
                        </span>
                    </GlassCard>
                </div>
            </div>

            {/* --- HUD: BOTTOM LIVE LOG --- */}
            <div className="absolute bottom-6 right-6 z-[1000] w-72 pointer-events-none hidden md:block">
                <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Incoming Telemetry</p>
                    </div>
                    
                    {Object.values(telemetry).slice(0, 4).map((t) => (
                        <div key={t.assetId} className="flex justify-between items-center text-xs animate-fade-in group">
                            <span className="text-slate-500 font-mono group-hover:text-slate-300 transition-colors">ID-{t.assetId.split('-')[0]}</span>
                            <div className="flex items-center gap-3">
                                <span className={`font-mono font-bold ${
                                    t.status === 'CRITICAL' ? 'text-red-500' : 
                                    t.status === 'WARNING' ? 'text-amber-400' : 'text-slate-300'
                                }`}>
                                    {t.vibration.toFixed(3)} mm/s
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MAP ENGINE --- */}
            <MapContainer 
                center={center} 
                zoom={6} 
                style={{ height: '100%', width: '100%', background: '#020617', zIndex: 0 }}
                zoomControl={false} // Custom control placement if needed
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; OpenStreetMap & CartoDB'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Auto Resize Fix */}
                <MapAutoResize center={center} />

                {/* ASSET MARKERS */}
                {assets.map(asset => {
                    const liveData = telemetry[asset.id];
                    const isCritical = liveData?.status === 'CRITICAL';
                    const isWarning = liveData?.status === 'WARNING';

                    return (
                        <Marker key={asset.id} position={asset.coordinates}>
                            <Popup className="custom-popup" closeButton={false}>
                                <div className={`bg-slate-900 text-white p-4 rounded-xl border shadow-2xl min-w-[260px] relative overflow-hidden ${
                                    isCritical ? 'border-red-500 shadow-red-900/50' : 
                                    isWarning ? 'border-amber-500' : 'border-slate-600'
                                }`}>
                                    {/* Status Bar */}
                                    <div className={`absolute top-0 left-0 w-1 h-full ${
                                        isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}></div>

                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{asset.name}</h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{asset.type} • {asset.location}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wide ${
                                            isCritical ? 'bg-red-500 text-white animate-pulse' : 
                                            isWarning ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {liveData?.status || 'SYNCING...'}
                                        </span>
                                    </div>
                                    
                                    {/* Live Data Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4 pl-2">
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Vibration</div>
                                            <div className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400' : 'text-white'}`}>
                                                {liveData?.vibration.toFixed(3) || '0.00'} <span className="text-[9px] text-slate-500">mm/s</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Temp</div>
                                            <div className="text-sm font-mono font-bold text-amber-400">
                                                {liveData?.temperature || 0}°C
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Output</div>
                                            <div className="text-sm font-mono font-bold text-cyan-400">
                                                {liveData?.output || 0} MW
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Eff.</div>
                                            <div className="text-sm font-mono font-bold text-emerald-400">
                                                {liveData?.efficiency || 0}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => selectAsset(asset.id)}
                                        className="w-full bg-cyan-600/10 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-cyan-600/30 text-xs font-bold py-2.5 rounded-lg transition-all uppercase tracking-wide flex items-center justify-center gap-2 group"
                                    >
                                        <span>Open Dashboard</span>
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