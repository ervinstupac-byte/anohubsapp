import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import type { Asset, AssetContextType } from '../types.ts';
import { useAudit } from './AuditContext.tsx';
import { useAuth } from './AuthContext.tsx';
import { debounce } from '../utils/performance.ts';

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logAction } = useAudit();
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
                    const mappedAssets: Asset[] = data.map((item: any) => ({
                        id: item.id.toString(),
                        name: item.name,
                        type: item.type,
                        location: item.location,
                        coordinates: [item.lat || 0, item.lng || 0],
                        capacity: parseFloat(item.power_output) || 0,
                        status: item.status || 'Operational'
                    }));
                    setAssets(mappedAssets);

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

    // Create a ref to hold the debounced logging function
    // We use a ref so the debounce timer persists across renders
    const debouncedLogContextSwitch = useRef(
        debounce((assetName: string) => {
            logAction('CONTEXT_SWITCH', assetName, 'SUCCESS');
        }, 1000) // 1 second delay
    ).current;

    const selectAsset = (id: string) => {
        setSelectedAssetId(id);
        const asset = assets.find(a => a.id === id);
        if (asset) {
            // Call the debounced function instead of direct logAction
            debouncedLogContextSwitch(asset.name);
        }
    };

    const { isGuest } = useAuth(); // Hook to check guest status

    // --- NOVA FUNKCIJA: DODAVANJE NOVE TURBINE ---
    const addAsset = async (newAssetData: Omit<Asset, 'id'>) => {
        try {
            // 1. Pripremi podatke za Supabase (mapiraj Frontend -> Baza)
            const dbPayload = {
                name: newAssetData.name,
                type: newAssetData.type,
                location: newAssetData.location,
                lat: newAssetData.coordinates[0],
                lng: newAssetData.coordinates[1],
                power_output: newAssetData.capacity,
                status: 'Operational' // Default status
            };

            let newAsset: Asset;

            if (isGuest) {
                // --- GUEST MODE: MOCK INSERT ---
                // Simuliramo mrežni zahtjev
                await new Promise(resolve => setTimeout(resolve, 800));

                newAsset = {
                    id: `guest-asset-${Date.now()}`,
                    name: dbPayload.name,
                    type: dbPayload.type,
                    location: dbPayload.location,
                    coordinates: [dbPayload.lat, dbPayload.lng],
                    capacity: dbPayload.power_output,
                    status: dbPayload.status as Asset['status']
                };
                console.log('[AssetContext] Guest Mode: Simulating asset creation', newAsset);
            } else {
                // --- REAL MODE: SUPABASE INSERT ---
                const { data, error } = await supabase
                    .from('assets')
                    .insert([dbPayload])
                    .select()
                    .single();

                if (error) throw error;

                newAsset = {
                    id: data.id.toString(),
                    name: data.name,
                    type: data.type,
                    location: data.location,
                    coordinates: [data.lat, data.lng],
                    capacity: parseFloat(data.power_output),
                    status: data.status
                };
            }

            setAssets(prev => [...prev, newAsset]);
            setSelectedAssetId(newAsset.id);
            logAction('ASSET_REGISTER', newAsset.name, 'SUCCESS');

        } catch (error) {
            console.error('Error creating asset:', error);
            throw error; // Bacamo grešku da UI može prikazati poruku korisniku
        }
    };

    const selectedAsset = assets.find(a => a.id === selectedAssetId) || null;

    return (
        // Ne zaboravi dodati addAsset u value objekt!
        <AssetContext.Provider value={{ assets, selectedAsset, selectAsset, loading, addAsset }}>
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