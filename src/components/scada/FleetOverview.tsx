import React from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';

interface FleetOverviewProps {
    onToggleMap: () => void;
    showMap: boolean;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({ onToggleMap, showMap }) => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();

    return (
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">FLEET OVERVIEW</h3>
                <button
                    onClick={onToggleMap}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${showMap ? 'bg-cyan-900 text-cyan-400 border-cyan-700' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'}`}
                >
                    {showMap ? 'HIDE MAP' : 'GLOBAL MAP'}
                </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {assets.map(asset => (
                    <button
                        key={asset.id}
                        onClick={() => selectAsset(asset.id)}
                        className={`
                            h-2 rounded transition-all duration-300 relative group
                            ${selectedAsset?.id === asset.id ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-slate-700 hover:bg-slate-600'}
                        `}
                        title={asset.name}
                    >
                        {/* Status Indicator Dot */}
                        <div className={`
                            absolute -top-1 -right-1 w-2 h-2 rounded-full border border-slate-900
                             ${asset.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                                asset.status === 'Warning' || asset.status === 'Maintenance' ? 'bg-amber-400' :
                                    'bg-emerald-500'}
                         `}></div>
                    </button>
                ))}
            </div>
            <div className="mt-2 text-center">
                <span className="text-xs font-mono font-bold text-white block truncate">
                    {selectedAsset?.name || 'NO CONTEXT'}
                </span>
            </div>
        </div>
    );
};
