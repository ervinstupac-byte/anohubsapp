import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from './AssetPicker.tsx'; 
// import type { Asset } UKLONJENO
import { GlassCard } from './ui/GlassCard.tsx'; 

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- MAP CONTROLLER ---
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// --- MAIN COMPONENT ---
export const GlobalMap: React.FC = () => {
    const { assets, selectAsset } = useAssetContext();
    const [center] = useState<[number, number]>([45.815, 15.98]); // maknut setCenter

    // Live Stats
    const stats = {
        total: assets.length,
        operational: assets.filter(a => a.status === 'Operational').length,
        critical: assets.filter(a => a.status === 'Critical').length,
        power: assets.reduce((acc, curr) => acc + (curr.capacity || 0), 0)
    };

    return (
        <div className="relative h-[calc(100vh-100px)] w-full rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl animate-fade-in">
            
            {/* HUD: TOP BAR OVERLAY */}
            <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <BackButton text="Back to Hub" />
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <GlassCard className="py-2 px-4 flex flex-col items-center min-w-[80px] bg-slate-900/80 backdrop-blur-md">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Fleet</span>
                        <span className="text-xl font-black text-white">{stats.total}</span>
                    </GlassCard>
                    <GlassCard className="py-2 px-4 flex flex-col items-center min-w-[100px] bg-slate-900/80 backdrop-blur-md">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Capacity</span>
                        <span className="text-xl font-black text-cyan-400">{stats.power} <span className="text-xs text-slate-500">MW</span></span>
                    </GlassCard>
                    <GlassCard className={`py-2 px-4 flex flex-col items-center min-w-[80px] bg-slate-900/80 backdrop-blur-md ${stats.critical > 0 ? 'border-red-500/50' : ''}`}>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Critical</span>
                        <span className={`text-xl font-black ${stats.critical > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                            {stats.critical}
                        </span>
                    </GlassCard>
                </div>
            </div>

            {/* MAP CONTAINER */}
            <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%', background: '#020617' }}>
                
                {/* Dark Mode Map Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapUpdater center={center} />

                {assets.map(asset => (
                    <Marker key={asset.id} position={asset.coordinates}>
                        <Popup className="custom-popup" closeButton={false}>
                            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl min-w-[220px]">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg leading-tight">{asset.name}</h3>
                                    <span className={`w-2 h-2 rounded-full mt-1.5 ${asset.status === 'Operational' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                                </div>
                                
                                <p className="text-xs text-slate-400 uppercase font-bold mb-3 flex items-center gap-1">
                                    <span>📍</span> {asset.location}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                        <div className="text-[9px] text-slate-500 uppercase">Power</div>
                                        <div className="text-sm font-mono font-bold text-cyan-400">{asset.capacity} MW</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                        <div className="text-[9px] text-slate-500 uppercase">Type</div>
                                        <div className="text-sm font-mono font-bold text-white">{asset.type}</div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => selectAsset(asset.id)}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/20 uppercase tracking-wide"
                                >
                                    Open Dashboard
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};