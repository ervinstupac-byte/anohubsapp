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

    const selectAsset = (id: string) => {
        setSelectedAssetId(id);
    };

    // --- NOVA FUNKCIJA: DODAVANJE NOVE TURBINE ---
    const addAsset = async (newAssetData: Omit<Asset, 'id'>) => {
        try {
            // 1. Pripremi podatke za Supabase (mapiraj Frontend -> Baza)
            // Pretpostavljamo da baza ima kolone: name, type, location, lat, lng, power_output
            const dbPayload = {
                name: newAssetData.name,
                type: newAssetData.type,
                location: newAssetData.location,
                lat: newAssetData.coordinates[0],
                lng: newAssetData.coordinates[1],
                power_output: newAssetData.capacity,
                status: 'Operational' // Default status
            };

            // 2. Insert u bazu i vrati taj novi red
            const { data, error } = await supabase
                .from('assets')
                .insert([dbPayload])
                .select()
                .single();

            if (error) throw error;

            // 3. Mapiraj vraćeni podatak iz baze u Frontend format
            const newAsset: Asset = {
                id: data.id.toString(),
                name: data.name,
                type: data.type,
                location: data.location,
                coordinates: [data.lat, data.lng],
                capacity: parseFloat(data.power_output),
                status: data.status
            };

            // 4. Ažuriraj lokalni state i odmah selektiraj novu turbinu
            setAssets(prev => [...prev, newAsset]);
            setSelectedAssetId(newAsset.id);

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