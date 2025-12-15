import React, { useEffect } from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx'; 

export const AssetPicker: React.FC = () => {
    const { assets, selectedAsset, selectAsset, loading } = useAssetContext();

    useEffect(() => {
        if (!selectedAsset && assets.length > 0) {
            // selectAsset(assets[0].id); // Optional auto-select
        }
    }, [assets, selectedAsset, selectAsset]);

    if (loading) return <div className="text-xs text-slate-500 animate-pulse font-mono uppercase tracking-widest">Syncing Assets...</div>;

    return (
        <div className="w-full relative z-20">
            <div className="flex items-center gap-3 bg-slate-900/80 p-2 pl-3 rounded-xl border border-slate-700/50 shadow-lg backdrop-blur-md group hover:border-cyan-500/30 transition-colors">
                <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                
                <div className="flex-grow min-w-0">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                        Active Project Context
                    </label>
                    <select
                        value={selectedAsset?.id || ''}
                        onChange={(e) => selectAsset(e.target.value)}
                        className="w-full bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer truncate appearance-none hover:text-cyan-400 transition-colors"
                    >
                        <option value="" disabled className="text-slate-500">Select Target Asset...</option>
                        {assets.map(asset => (
                            <option key={asset.id} value={asset.id} className="bg-slate-900 text-white">
                                {asset.name} • {asset.type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="hidden sm:flex items-center px-3 border-l border-slate-700/50 h-8">
                    {selectedAsset ? (
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 tracking-wider">LIVE</span>
                        </div>
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    )}
                </div>
                
                {/* Custom Chevron */}
                <div className="pr-2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
};

export { useAssetContext } from '../contexts/AssetContext.tsx';