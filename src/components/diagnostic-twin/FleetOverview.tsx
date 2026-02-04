import React from 'react';
import { Fan, Circle, Aperture, Map } from 'lucide-react';
import { useAssetContext } from '../../contexts/AssetContext';
import { Sparkline } from '../ui/Sparkline';

interface FleetOverviewProps {
    onToggleMap: () => void;
    showMap: boolean;
    onRegisterAsset: (data?: any) => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({ onToggleMap, showMap, onRegisterAsset }) => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();

    const onSelectAsset = selectAsset;

    const getAssetIcon = (asset: any) => {
        const type = asset.specs?.turbineProfile?.type || 'FRANCIS';
        if (type === 'KAPLAN') return <Fan className="w-3 h-3 text-cyan-400" />;
        if (type === 'PELTON') return <Aperture className="w-3 h-3 text-violet-400" />;
        return <Circle className="w-3 h-3 text-emerald-400" />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Fleet Status</div>
                <button
                    onClick={onToggleMap}
                    className={`p-1.5 rounded transition-all ${showMap ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                    title="Toggle Global Map"
                >
                    <Map className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {assets.map((asset: any) => (
                    <div key={asset.id} className="relative group">
                        <button
                            onClick={() => onSelectAsset(asset.id)}
                            className={`
                                w-full p-2 rounded-lg border flex items-center justify-between transition-all relative overflow-hidden
                                ${selectedAsset?.id === asset.id
                                    ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                    : 'bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-800'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {/* Status Dot */}
                                <div className={`
                                    w-2 h-2 rounded-full shrink-0
                                    ${asset.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                                        asset.status === 'Warning' || asset.status === 'Maintenance' ? 'bg-amber-400' :
                                            'bg-emerald-500'}
                                `}></div>

                                {/* Asset Icon */}
                                {getAssetIcon(asset)}

                                {/* Asset Name */}
                                <span className="text-[11px] font-black uppercase truncate text-left tracking-wider max-w-[80px]">
                                    {asset.name}
                                </span>
                            </div>

                            <div className="w-12 h-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                {/* Sparkline Mock or Real */}
                                {asset.telemetryHistory && <Sparkline data={asset.telemetryHistory.slice(-20)} color={selectedAsset?.id === asset.id ? '#22d3ee' : '#64748b'} height={16} />}
                            </div>
                        </button>

                        {/* METRIC GRID */}
                        <div className="grid grid-cols-3 gap-1 px-3 mb-1 mt-1">
                            {/* ALGN */}
                            <div className="flex flex-col justify-center items-center px-1 py-1 bg-amber-500/5 rounded border border-amber-500/10">
                                <span className="text-[7px] font-mono text-amber-500/60 uppercase leading-none mb-0.5">ALGN</span>
                                <span className="text-[9px] font-mono font-bold text-amber-500 leading-none">0.02</span>
                            </div>
                            {/* VIB */}
                            <div className="flex flex-col justify-center items-center px-1 py-1 bg-emerald-500/5 rounded border border-emerald-500/10">
                                <span className="text-[7px] font-mono text-emerald-500/60 uppercase leading-none mb-0.5">VIB</span>
                                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase leading-none">1.2</span>
                            </div>
                            {/* TEMP */}
                            <div className="flex flex-col justify-center items-center px-1 py-1 bg-cyan-500/5 rounded border border-cyan-500/10">
                                <span className="text-[7px] font-mono text-cyan-500/60 uppercase leading-none mb-0.5">TEMP</span>
                                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase leading-none">42C</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Asset Button */}
            <button
                onClick={() => onRegisterAsset({
                    name: 'New Asset',
                    type: 'HPP',
                    location: 'Unknown',
                    coordinates: [0, 0],
                    capacity: 10,
                    status: 'Operational'
                })}
                className="w-full mt-3 py-2 px-2 flex items-center justify-center gap-1 sm:gap-2 border border-dashed border-slate-700 rounded text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500 hover:bg-cyan-900/10 transition-all uppercase tracking-wider"
            >
                <span className="text-sm">+</span>
                <span className="hidden xs:inline">Register New Plant</span>
                <span className="xs:hidden">New Plant</span>
            </button>
        </div>
    );
};
