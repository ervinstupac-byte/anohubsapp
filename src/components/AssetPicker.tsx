import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import type { Asset } from '../types.ts';

// Context za Asset (Morat ćemo ga kreirati u sljedećem koraku)
interface AssetContextType {
    selectedAsset: Asset | null;
    setSelectedAssetId: (id: number | null) => void;
    loading: boolean;
    assets: Asset[];
}

// Globalni Context je potreban da bi svi moduli znali koji je Asset odabran
// Za sada koristimo mock context (stvarni context ćemo kreirati u KORAKU 3)
const MockAssetContext = React.createContext<AssetContextType | undefined>(undefined);

// Kreiramo hook za Asset
export const useAssetContext = () => {
    const context = React.useContext(MockAssetContext);
    if (!context) {
        throw new Error('useAssetContext must be used within an AssetProvider');
    }
    return context;
};

// --- KOMPONENTA ---
export const AssetPicker: React.FC = () => {
    const { showToast } = useToast();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

    // Placeholder za trenutni Asset (dok ne napravimo stvarni Context)
    const selectedAsset = assets.find(a => a.id === selectedAssetId) || null;

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('assets').select('*');
            if (error) {
                showToast('Failed to load asset list.', 'error');
            } else {
                setAssets(data || []);
                // Učitaj zadnji odabrani ID iz local storage
                const savedId = localStorage.getItem('selectedAssetId');
                if (savedId) {
                    const id = parseInt(savedId);
                    if (data.some(a => a.id === id)) {
                        setSelectedAssetId(id);
                    }
                }
            }
            setLoading(false);
        };
        fetchAssets();
    }, []);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setSelectedAssetId(id);
        localStorage.setItem('selectedAssetId', id.toString());
        showToast(`Asset set to: ${assets.find(a => a.id === id)?.name}`, 'info');
    };

    if (loading) {
        return <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700 text-cyan-400 text-sm animate-pulse">Loading Assets...</div>;
    }

    return (
        <div className="sticky top-4 z-20 glass-panel p-4 rounded-xl border-cyan-500/20 shadow-2xl backdrop-blur-xl flex justify-between items-center gap-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[120px]">
                Target Asset:
            </label>
            <select
                onChange={handleSelectChange}
                value={selectedAssetId || 'default'}
                className="flex-grow bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500"
            >
                <option value="default" disabled>{assets.length > 0 ? '--- Select Project ---' : 'No Assets Found'}</option>
                {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.power_output})
                    </option>
                ))}
            </select>
            
            {selectedAsset && (
                <div className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    selectedAsset.status === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                    selectedAsset.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 
                    'bg-green-500/20 text-green-400 border-green-500/50'
                } hidden sm:block`}>
                    {selectedAsset.status.toUpperCase()}
                </div>
            )}
        </div>
    );
};