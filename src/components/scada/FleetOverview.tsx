import React from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';

interface FleetOverviewProps {
    onToggleMap: () => void;
    showMap: boolean;
    onRegisterAsset: () => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = React.memo(({ onToggleMap, showMap, onRegisterAsset }) => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();

    return (
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-slate-400 truncate">FLEET OVERVIEW</h3>
                <button
                    onClick={onToggleMap}
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded border transition-colors whitespace-nowrap ${showMap ? 'bg-cyan-900 text-cyan-400 border-cyan-700' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'}`}
                >
                    {showMap ? 'HIDE MAP' : 'GLOBAL MAP'}
                </button>
            </div>

            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {assets.map(asset => (
                    <button
                        key={asset.id}
                        onClick={() => selectAsset(asset.id)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded transition-all group
                            ${selectedAsset?.id === asset.id
                                ? 'bg-cyan-900/30 border-l-2 border-cyan-400 text-white'
                                : 'hover:bg-slate-800 border-l-2 border-transparent text-slate-400'}
                        `}
                    >
                        {/* Status Dot */}
                        <div className={`
                            w-2 h-2 rounded-full shrink-0
                             ${asset.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                                asset.status === 'Warning' || asset.status === 'Maintenance' ? 'bg-amber-400' :
                                    'bg-emerald-500'}
                         `}></div>

                        {/* Asset Name */}
                        <span className="text-xs font-bold uppercase truncate text-left flex-1">
                            {asset.name}
                        </span>

                        {/* Selected Indicator */}
                        {selectedAsset?.id === asset.id && (
                            <span className="text-[10px] text-cyan-500">▶</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Add Asset Button */}
            <button
                onClick={onRegisterAsset}
                className="w-full mt-3 py-2 px-2 flex items-center justify-center gap-1 sm:gap-2 border border-dashed border-slate-700 rounded text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500 hover:bg-cyan-900/10 transition-all uppercase tracking-wider"
            >
                <span className="text-sm">+</span>
                <span className="hidden xs:inline">Register New Plant</span>
                <span className="xs:hidden">New Plant</span>
            </button>
        </div>
    );
});
