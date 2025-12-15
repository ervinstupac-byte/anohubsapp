import React, { useEffect } from 'react';
// Uvozimo iz definicije konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx'; 

export const AssetPicker: React.FC = () => {
    const { assets, selectedAsset, selectAsset, loading } = useAssetContext();

    // Auto-select first asset if none selected (Optional UX improvement)
    useEffect(() => {
        if (!selectedAsset && assets.length > 0) {
            // selectAsset(assets[0].id); // Uncomment if you want auto-select
        }
    }, [assets, selectedAsset, selectAsset]);

    if (loading) return <div className="text-xs text-slate-500 animate-pulse">Loading Assets...</div>;

    return (
        <div className="w-full mb-6">
            <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-lg border border-slate-700 shadow-sm">
                <div className="bg-cyan-900/30 p-2 rounded text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                
                <div className="flex-grow">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                        Active Project Context
                    </label>
                    <select
                        value={selectedAsset?.id || ''}
                        onChange={(e) => selectAsset(e.target.value)}
                        className="w-full bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="" disabled className="text-slate-500">Select Target Asset...</option>
                        {assets.map(asset => (
                            <option key={asset.id} value={asset.id} className="bg-slate-800 text-white">
                                {asset.name} ({asset.type}) - {asset.location}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedAsset && (
                    <div className="hidden sm:block px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400 font-mono">
                        ONLINE
                    </div>
                )}
            </div>
        </div>
    );
};

// --- KLJUČNI FIX ZA TS2459 ---
// Re-exportamo hook tako da import { useAssetContext } from './AssetPicker' u drugim fajlovima radi.
export { useAssetContext } from '../contexts/AssetContext.tsx';