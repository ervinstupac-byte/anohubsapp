import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback, ReactNode, Suspense, lazy } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import type { Asset, AssetContextType, AssetHistoryEntry } from '../types.ts';
import { useAudit } from './AuditContext.tsx';
import { useAuth } from './AuthContext.tsx';
import { debounce } from '../utils/performance.ts';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils.ts';
import { ProfileLoader } from '../services/ProfileLoader';

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logAction } = useAudit();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetLogs, setAssetLogs] = useState<AssetHistoryEntry[]>([]); // <--- NEW: Separate Logs State
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load assets from Supabase or LocalStorage (Guest)
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                // Check for guest assets in local storage first
                const localAssets = loadFromStorage<Asset[]>('guest_assets') || [];

                if (localAssets.length > 0) {
                    setAssets(localAssets);

                    // Persistence Logic
                    const savedAssetId = localStorage.getItem('activeAssetId');
                    const initialAsset = savedAssetId
                        ? localAssets.find(a => a.id === savedAssetId)
                        : localAssets[0];

                    if (initialAsset && !selectedAssetId) {
                        setSelectedAssetId(initialAsset.id);
                    }

                    setLoading(false);
                    return;
                }

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
                        status: item.status || 'Operational',
                        turbine_type: item.turbine_type || (['pelton', 'francis', 'kaplan', 'crossflow'].includes(item.type?.toLowerCase()) ? item.type.toLowerCase() : 'francis')
                    }));
                    setAssets(mappedAssets);

                    // --- PERSISTENCE LOGIC START ---
                    const savedAssetId = localStorage.getItem('activeAssetId');
                    const initialAsset = savedAssetId
                        ? mappedAssets.find(a => a.id === savedAssetId)
                        : mappedAssets[0];

                    if (initialAsset && !selectedAssetId) {
                        setSelectedAssetId(initialAsset.id);
                    }
                    // --- PERSISTENCE LOGIC END ---
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    // --- NEW: Optimistic Update function ---
    const updateAsset = (id: string, updates: Partial<Asset>) => {
        setAssets(prevAssets => {
            const newAssets = prevAssets.map(asset => {
                if (asset.id === id) {
                    return { ...asset, ...updates };
                }
                return asset;
            });

            // Persist to Local Storage Immediately
            if (isGuest) {
                saveToStorage('guest_assets', newAssets);
            }

            return newAssets;
        });

        // TODO: Fire Toast Notification (need to integrate useToast)
    };

    // --- NEW: Log Activity Function ---
    const logActivity = (assetId: string, category: 'MAINTENANCE' | 'DESIGN' | 'SYSTEM', message: string, changes?: { oldVal: any, newVal: any }) => {
        const newLog: AssetHistoryEntry = {
            id: crypto.randomUUID(),
            assetId,
            date: new Date().toISOString(),
            category,
            message,
            author: 'CurrentUser', // TODO: Get actual user
            changes
        };

        setAssetLogs(prev => [newLog, ...prev]);

        // console.log('[AssetLog]', newLog); 
    };

    // Create a ref to hold the debounced logging function
    // We use a ref so the debounce timer persists across renders
    const debouncedLogContextSwitch = useRef(
        debounce((assetName: string) => {
            logAction('CONTEXT_SWITCH', assetName, 'SUCCESS');
        }, 1000) // 1 second delay
    ).current;

    const selectAsset = useCallback((id: string) => {
        setSelectedAssetId(id);
        localStorage.setItem('activeAssetId', id); // Save to local storage
        const asset = assets.find(a => a.id === id);
        if (asset) {
            // Call the debounced function instead of direct logAction
            debouncedLogContextSwitch(asset.name);
        }
    }, [assets, debouncedLogContextSwitch]);

    const { isGuest } = useAuth(); // Hook to check guest status

    // --- NOVA FUNKCIJA: DODAVANJE NOVE TURBINE ---
    const addAsset = useCallback(async (newAssetData: Omit<Asset, 'id'>) => {
        try {
            const dbPayload = {
                name: newAssetData.name,
                type: newAssetData.type,
                location: newAssetData.location,
                lat: newAssetData.coordinates[0],
                lng: newAssetData.coordinates[1],
                power_output: newAssetData.capacity,
                status: 'Operational', // Default status
                specs: newAssetData.specs || {}
            };

            let newAsset: Asset;

            if (isGuest) {
                await new Promise(resolve => setTimeout(resolve, 800));

                newAsset = {
                    id: `guest-asset-${Date.now()}`,
                    name: dbPayload.name,
                    type: dbPayload.type,
                    location: dbPayload.location,
                    coordinates: [dbPayload.lat, dbPayload.lng],
                    capacity: dbPayload.power_output,
                    status: dbPayload.status as Asset['status'],
                    specs: dbPayload.specs
                };

                const existingGuestAssets = loadFromStorage<Asset[]>('guest_assets') || [];
                const updatedGuestAssets = [...existingGuestAssets, newAsset];
                saveToStorage('guest_assets', updatedGuestAssets);
            } else {
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
                    status: data.status,
                    turbine_type: data.turbine_type || (['pelton', 'francis', 'kaplan', 'crossflow'].includes(data.type?.toLowerCase()) ? data.type.toLowerCase() : 'francis'),
                    specs: data.specs || {}
                };
            }

            setAssets(prev => [...prev, newAsset]);
            setSelectedAssetId(newAsset.id);
            logAction('ASSET_REGISTER', newAsset.name, 'SUCCESS');

        } catch (error) {
            console.error('Error creating asset:', error);
            throw error;
        }
    }, [isGuest, logAction]);

    const selectedAsset = useMemo(() =>
        assets.find(a => a.id === selectedAssetId) || null
        , [assets, selectedAssetId]);

    const activeProfile = useMemo(() => {
        if (!selectedAsset) return null;
        // Map asset.type or asset.turbine_type to profile
        const profileType = selectedAsset.turbine_type || selectedAsset.type;
        return ProfileLoader.getProfile(profileType) || null;
    }, [selectedAsset]);

    const value = useMemo(() => ({
        assets,
        selectedAsset,
        activeProfile,
        selectAsset,
        loading,
        addAsset,
        updateAsset,
        logActivity,
        assetLogs
    }), [assets, selectedAsset, activeProfile, selectAsset, loading, addAsset, updateAsset, logActivity, assetLogs]);

    return (
        <AssetContext.Provider value={value}>
            {loading ? (
                <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                </div>
            ) : children}
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