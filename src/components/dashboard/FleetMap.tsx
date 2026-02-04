import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAssetContext } from '../../contexts/AssetContext';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { throttle } from '../../utils/performance';
import { Asset } from '../../types';
import { Globe } from 'lucide-react';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// NC-18: Quick-Look Overlay Props (Strictly Typed)
interface QuickLookProps {
    asset: Asset;
    isCritical: boolean;
    onDetails: () => void;
}

const QuickLookOverlay: React.FC<QuickLookProps> = ({ asset, isCritical, onDetails }) => (
    <div className="p-3 min-w-[200px] bg-slate-900/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl">
        <h3 className="font-bold text-slate-100 text-sm mb-1">{asset.name}</h3>
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 uppercase">Status</span>
            <span className={`text-[10px] font-bold ${isCritical ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                {asset.status.toUpperCase()}
            </span>
        </div>

        {/* Telemetry Snapshot */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 mb-3">
            <div>
                <div className="text-[9px] text-slate-500 uppercase">Power</div>
                <div className="text-xs font-mono text-cyan-300">
                    {asset.capacity.toFixed(1)} <span className="text-[8px] text-slate-500">MW</span>
                </div>
            </div>
            <div>
                <div className="text-[9px] text-slate-500 uppercase">RUL</div>
                <div className="text-xs font-mono text-amber-300">
                    {isCritical ? '< 5 DAYS' : '> 5 YRS'}
                </div>
            </div>
        </div>

        {/* NC-19: Command Drilldown */}
        <button
            onClick={(e) => {
                e.stopPropagation();
                onDetails();
            }}
            className="w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-200 transition-colors"
        >
            ACCESS_NEURAL_LINK &gt;&gt;
        </button>
    </div>
);

// NC-18: Sovereign Node Marker
// Memoized to prevent re-renders unless data changes
const SovereignNode = React.memo(({ asset, onClick }: { asset: Asset; onClick: (id: number) => void }) => {
    // Determine status color
    const isCritical = asset.status === 'Critical' || asset.status === 'Offline'; // Treat offline as critical for visibility or grey? preserving 'Critical' logic
    const color = isCritical ? '#ef4444' : '#06b6d4'; // Red vs Cyan

    // Coords fallback
    const position: [number, number] = (asset.coordinates && asset.coordinates.length === 2 && asset.coordinates[0] !== 0)
        ? [asset.coordinates[0], asset.coordinates[1]] as [number, number]
        : [0, 0];

    if (position[0] === 0 && position[1] === 0) return null; // Skip invalid

    return (
        <CircleMarker
            center={position}
            pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: isCritical ? 0 : 2
            }}
            radius={isCritical ? 8 : 5}
            eventHandlers={{
                click: () => onClick(asset.id)
            }}
        >
            {isCritical && (
                // Synchronized Pulsing Ring (CSS animation defined in global or via className)
                <CircleMarker
                    center={position}
                    radius={15}
                    pathOptions={{ color: color, fillOpacity: 0.1, weight: 1, dashArray: '2, 4' }}
                    className="nc18-pulse-ring" // We assume this class exists or generic animate-pulse
                />
            )}
            <Popup className="glass-popup" closeButton={false}>
                <QuickLookOverlay
                    asset={asset}
                    isCritical={isCritical}
                    onDetails={() => onClick(asset.id)}
                />
            </Popup>
        </CircleMarker>
    );
});

const SovereignBlueprint: React.FC = () => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05070a] overflow-hidden group">
        {/* World Wireframe Grid */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <svg viewBox="0 0 800 400" className="w-full h-full stroke-cyan-500/30 fill-none stroke-[0.5]">
                <path d="M150,200 Q200,100 300,150 T500,100 T700,200 T500,300 T300,250 T150,200" className="animate-pulse" />
                <circle cx="400" cy="200" r="150" className="opacity-10" />
                <circle cx="400" cy="200" r="100" className="opacity-20" />
            </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative w-20 h-20 border-2 border-cyan-500/40 rounded-full flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <Globe className="w-10 h-10 text-cyan-400" />
                </div>
            </div>

            <h3 className="text-xl font-mono font-black text-white uppercase tracking-widest mb-3">
                Sovereign Blueprint <span className="text-cyan-400">Active</span>
            </h3>

            <div className="flex gap-4 mb-6">
                <div className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-tighter">
                    Status: Offline_Vector_Mode
                </div>
                <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded text-[9px] font-mono text-emerald-400 uppercase tracking-tighter">
                    Cache: Integrity_Verified
                </div>
            </div>

            <p className="max-w-lg text-slate-500 font-mono text-[10px] uppercase leading-relaxed tracking-wider">
                Satellite handshake timeout. Reverting to encrypted local cartography.
                Neural links to active assets remain established via secondary mesh.
            </p>
        </div>

        {/* Animated Scanning Line */}
        <motion.div
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-px bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-20"
        />
    </div>
);

export const FleetMap: React.FC = () => {
    const { assets } = useAssetContext();
    const navigate = useNavigate();
    const [mapError, setMapError] = useState(false);

    // NC-18: Throttled State for Map Layer
    const [displayedAssets, setDisplayedAssets] = useState<Asset[]>(assets);

    const throttledUpdate = useMemo(() => throttle((newAssets: Asset[]) => {
        setDisplayedAssets(newAssets);
    }, 500), []);

    useEffect(() => {
        throttledUpdate(assets);
    }, [assets, throttledUpdate]);

    const handleNodeClick = useCallback((id: number) => {
        navigate(`/asset/${id}`);
    }, [navigate]);

    return (
        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-700 relative z-0 bg-slate-900 shadow-inner group">
            {mapError && <SovereignBlueprint />}

            {/* Map Layer */}
            <MapContainer
                center={[44.8176, 20.4633]}
                zoom={3}
                className="w-full h-full bg-slate-950"
                scrollWheelZoom={false}
                zoomControl={false}
                whenReady={() => console.log('Map Loaded')}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    eventHandlers={{
                        tileerror: () => setMapError(true)
                    }}
                />

                {displayedAssets.map(asset => (
                    <SovereignNode
                        key={asset.id}
                        asset={asset}
                        onClick={handleNodeClick}
                    />
                ))}
            </MapContainer>

            {/* Overlay Text */}
            {!mapError && (
                <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 pointer-events-none group-hover:opacity-100 transition-opacity">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Global Telemetry (NC-18)
                    </div>
                </div>
            )}

            {/* Legend */}
            {!mapError && (
                <div className="absolute bottom-4 left-4 z-[400] bg-black/60 backdrop-blur px-3 py-2 rounded border border-white/10 pointer-events-none group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-[10px] text-slate-300 font-mono">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] text-slate-300 font-mono">CRITICAL</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
