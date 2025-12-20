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

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {assets.map(asset => (
                    <div key={asset.id} className="flex flex-col gap-1">
                        <button
                            onClick={() => selectAsset(asset.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden
                                ${selectedAsset?.id === asset.id
                                    ? 'bg-cyan-950/40 border border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'hover:bg-slate-800/50 border border-transparent text-slate-400'}
                            `}
                        >
                            {/* Status Dot */}
                            <div className={`
                                w-2 h-2 rounded-full shrink-0
                                 ${asset.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                                    asset.status === 'Warning' || asset.status === 'Maintenance' ? 'bg-amber-400' :
                                        'bg-emerald-500'}
                             `}></div>

                            {/* Asset Name + Waveform */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-[11px] font-black uppercase truncate text-left tracking-wider">
                                    {asset.name}
                                </span>
                                <div className="flex items-end gap-0.5 h-3 overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div
                                            key={i}
                                            className="w-[2px] bg-cyan-400 animate-wave"
                                            style={{
                                                height: `${40 + Math.random() * 60}%`,
                                                animationDelay: `${i * 0.15}s`,
                                                animationDuration: `${0.8 + Math.random()}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {selectedAsset?.id === asset.id && (
                                <span className="text-[10px] text-h-cyan animate-pulse">▶</span>
                            )}
                        </button>

                        {/* METRIC GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-3 mb-1">
                            {/* ALGN First for mobile compliance */}
                            <div className="flex items-center justify-between md:justify-start md:gap-2 px-2 py-1 bg-h-gold/5 rounded border border-h-gold/10 order-1">
                                <span className="text-[8px] font-mono text-h-gold/60 uppercase">ALGN</span>
                                <span className="text-[9px] font-mono font-bold text-h-gold">0.02 mm/m</span>
                            </div>
                            <div className="flex items-center justify-between md:justify-start md:gap-2 px-2 py-1 bg-emerald-500/5 rounded border border-emerald-500/10 order-2">
                                <span className="text-[8px] font-mono text-emerald-500/60 uppercase">VIB</span>
                                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">1.2 mm/s</span>
                            </div>
                            <div className="flex items-center justify-between md:justify-start md:gap-2 px-2 py-1 bg-emerald-500/5 rounded border border-emerald-500/10 order-3">
                                <span className="text-[8px] font-mono text-emerald-500/60 uppercase">TEMP</span>
                                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">42.4°C</span>
                            </div>
                        </div>
                    </div>
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
