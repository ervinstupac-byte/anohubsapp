import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from './ToastContext.tsx';
import type { Asset } from '../types.ts';

interface AssetContextType {
    selectedAsset: Asset | null;
    setSelectedAssetId: (id: number | null) => void;
    loading: boolean;
    assets: Asset[];
    fetchAssets: () => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAssets = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('assets').select('*');
        if (error) {
            showToast('Failed to load asset list.', 'error');
            setAssets([]);
        } else {
            setAssets(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    // Učitavanje zadnjeg odabranog ID-a i ažuriranje pri promjeni
    useEffect(() => {
        const savedId = localStorage.getItem('selectedAssetId');
        if (savedId) {
            const id = parseInt(savedId);
            // Provjeravamo je li spremljeni ID još uvijek u listi
            if (assets.some(a => a.id === id)) {
                setSelectedAssetId(id);
            }
        }
    }, [assets]);

    const handleSetSelectedAssetId = (id: number | null) => {
        setSelectedAssetId(id);
        if (id) {
            localStorage.setItem('selectedAssetId', id.toString());
        } else {
            localStorage.removeItem('selectedAssetId');
        }
        
        // Prikazi toast samo ako je pravi ID postavljen
        const assetName = assets.find(a => a.id === id)?.name;
        if (assetName) {
            showToast(`Target Asset set to: ${assetName}`, 'info');
        }
    };

    const selectedAsset = assets.find(a => a.id === selectedAssetId) || null;

    const value = {
        selectedAsset,
        setSelectedAssetId: handleSetSelectedAssetId,
        loading,
        assets,
        fetchAssets,
    };

    return (
        <AssetContext.Provider value={value}>
            {children}
        </AssetContext.Provider>
    );
};

export const useAssetContext = () => {
    const context = useContext(AssetContext);
    if (context === undefined) {
        throw new Error('useAssetContext must be used within an AssetProvider');
    }
    return context;
};