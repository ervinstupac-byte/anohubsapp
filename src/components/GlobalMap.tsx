import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from './AssetPicker.tsx'; // Uvozimo re-exportani hook
import type { Asset } from '../types.ts';

// --- LEAFLET ICON FIX ---
// Ovo je nužno jer React-Leaflet ponekad gubi ikone pri buildanju
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
// Pomoćna komponenta koja pomiče mapu kad se promijeni centar
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
    const [center, setCenter] = useState<[number, number]>([45.815, 15.98]); // Default: Zagreb

    // Izračun statistike uživo iz Contexta
    const stats = {
        total: assets.length,
        operational: assets.filter(a => a.status === 'Operational').length,
        critical: assets.filter(a => a.status === 'Critical').length,
        // Zbrajamo kapacitet (zamjenjuje stari 'power_output')
        power: assets.reduce((acc, curr) => acc + (curr.capacity || 0), 0)
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="space-y-1">
                    <BackButton text="Back to Hub" />
                    <h2 className="text-3xl font-bold text-white tracking-tight mt-2">
                        Global Operations <span className="text-cyan-400">Map</span>
                    </h2>
                </div>
                
                {/* STATS BAR */}
                <div className="flex gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 backdrop-blur-sm">
                    <div className="text-center px-4 border-r border-slate-600">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Fleet</div>
                        <div className="text-xl font-bold text-white">{stats.total}</div>
                    </div>
                    <div className="text-center px-4 border-r border-slate-600">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Capacity</div>
                        <div className="text-xl font-bold text-cyan-400">{stats.power} <span className="text-xs text-slate-500">MW</span></div>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Critical</div>
                        <div className={`text-xl font-bold ${stats.critical > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {stats.critical}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAP CONTAINER */}
            <div className="flex-grow rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
                <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
                    
                    {/* Dark Mode Map Tiles */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    
                    <MapUpdater center={center} />

                    {assets.map(asset => (
                        // Ovdje koristimo novi 'coordinates' niz [lat, lng] iz types.ts
                        <Marker key={asset.id} position={asset.coordinates}>
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-slate-900 text-lg">{asset.name}</h3>
                                    <p className="text-xs text-slate-600 uppercase font-bold mb-2">{asset.type} • {asset.location}</p>
                                    
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold shadow-sm
                                            ${asset.status === 'Operational' ? 'bg-green-600' : 
                                              asset.status === 'Critical' ? 'bg-red-600 animate-pulse' : 
                                              asset.status === 'Warning' ? 'bg-yellow-500' : 'bg-slate-500'}
                                        `}>
                                            {asset.status}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">{asset.capacity} MW</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => selectAsset(asset.id)}
                                        className="w-full bg-cyan-600 text-white text-xs font-bold py-2 rounded hover:bg-cyan-700 transition-colors shadow-md"
                                    >
                                        OPEN DASHBOARD
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};