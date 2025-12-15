import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import type { Asset, AssetContextType } from '../types.ts';

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load assets from Supabase
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const { data, error } = await supabase.from('assets').select('*');
                if (error) throw error;
                
                if (data) {
                    // Mapiranje baze na naš Frontend tip
                    const mappedAssets: Asset[] = data.map((item: any) => ({
                        id: item.id.toString(), // OSIGURAVAMO STRING
                        name: item.name,
                        type: item.type,
                        location: item.location,
                        coordinates: [item.lat || 0, item.lng || 0], // Mapiramo lat/lng u coordinates
                        capacity: parseFloat(item.power_output) || 0, // Mapiramo power_output u capacity
                        status: item.status || 'Operational'
                    }));
                    setAssets(mappedAssets);
                    
                    // Auto-select prvi ako nema odabranog
                    if (mappedAssets.length > 0 && !selectedAssetId) {
                        setSelectedAssetId(mappedAssets[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    const selectAsset = (id: string) => {
        setSelectedAssetId(id);
    };

    const selectedAsset = assets.find(a => a.id === selectedAssetId) || null;

    return (
        <AssetContext.Provider value={{ assets, selectedAsset, selectAsset, loading }}>
            {children}
        </AssetContext.Provider>
    );
};

export const useAssetContext = () => {
    const context = useContext(AssetContext);
    if (!context) {
        throw new Error('useAssetContext must be used within an AssetProvider');
    }
    return context;
};