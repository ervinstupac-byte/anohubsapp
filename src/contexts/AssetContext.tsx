import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback, ReactNode, Suspense, lazy } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import type { Asset, AssetContextType, AssetHistoryEntry } from '../types.ts';
import { useAudit } from './AuditContext.tsx';
import { useAuth } from './AuthContext.tsx';
import { debounce } from '../utils/performance.ts';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils.ts';
import { ProfileLoader } from '../services/ProfileLoader';

const AssetContext = createContext<AssetContextType | undefined>(undefined);

// BroadcastChannel for instant cross-tab sync
const ASSET_CHANNEL_NAME = 'anohub_asset_channel';

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logAction } = useAudit();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetLogs, setAssetLogs] = useState<AssetHistoryEntry[]>([]); // <--- NEW: Separate Logs State
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // BroadcastChannel ref for cross-tab communication
    const assetChannelRef = useRef<BroadcastChannel | null>(null);

    // Load assets from Supabase or LocalStorage (Guest)
    useEffect(() => {
        console.log('[AssetContext] Step 1: Starting Initialization...');

        const fetchAssets = async () => {
            try {
                // NUCLEAR SAFETY: Wrap everything to ensure loading=false eventually

                // Check for guest assets in local storage first
                let localAssets: Asset[] = [];
                try {
                    localAssets = loadFromStorage<Asset[]>('guest_assets') || [];
                } catch (e) {
                    console.warn('[AssetContext] Failed to load guest_assets, resetting.', e);
                    localAssets = [];
                }

                if (localAssets.length > 0) {
                    console.log('[AssetContext] Step 2: Found Guest Assets:', localAssets.length);
                    setAssets(localAssets);

                    // Persistence Logic
                    let savedAssetId: string | null = null;
                    try {
                        savedAssetId = localStorage.getItem('activeAssetId');
                    } catch (e) { console.warn('LocalStorage access failed'); }

                    const initialAsset = savedAssetId
                        ? localAssets.find(a => a.id === Number(savedAssetId))
                        : localAssets[0];

                    if (initialAsset && !selectedAssetId) {
                        setSelectedAssetId(Number(initialAsset.id));
                    }

                    console.log('[AssetContext] Step 3: Guest Load Complete');
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase.from('assets').select('*');
                if (error) throw error;

                if (data) {
                    console.log('[AssetContext] Step 2: Supabase Assets Loaded:', data.length);
                    const mappedAssets: Asset[] = data.map((item: any) => ({
                        id: Number(item.id),
                        name: item.name,
                        type: item.type,
                        location: item.location,
                        coordinates: [item.lat || 0, item.lng || 0],
                        capacity: parseFloat(item.power_output) || 0,
                        status: item.status || 'Operational',
                        turbine_type: item.turbine_type || (['pelton', 'francis', 'kaplan', 'crossflow'].includes(item.type?.toLowerCase()) ? item.type.toLowerCase() : 'francis'),
                        specs: item.specs || {},
                        turbineProfile: item.specs?.turbineProfile // Hoist profile from specs
                    }));
                    setAssets(mappedAssets);

                    // --- PERSISTENCE LOGIC START ---
                    let savedAssetId: string | null = null;
                    try {
                        savedAssetId = localStorage.getItem('activeAssetId');
                    } catch (e) { }

                    const initialAsset = savedAssetId
                        ? mappedAssets.find(a => a.id === Number(savedAssetId))
                        : mappedAssets[0];

                    if (initialAsset && !selectedAssetId) {
                        setSelectedAssetId(Number(initialAsset.id));
                    }
                    // --- PERSISTENCE LOGIC END ---
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
                // Fallback to empty state but STOP LOADING
            } finally {
                console.log('[AssetContext] Step 4: Finalizing (Loading = False)');
                setLoading(false);
            }
        };

        fetchAssets();

        // Cross-Tab Sync via BroadcastChannel (instant) + StorageEvent (fallback)
        // Guard checking for window/browser environment
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try {
                assetChannelRef.current = new BroadcastChannel(ASSET_CHANNEL_NAME);
                assetChannelRef.current.onmessage = (event) => {
                    if (event.data?.type === 'ASSET_CHANGED') {
                            const maybeId = event.data.assetId;
                            const numeric = typeof maybeId === 'number' ? maybeId : (maybeId ? Number(maybeId) : null);
                            if (numeric === null || Number.isNaN(numeric)) return;
                            setSelectedAssetId(numeric as number);
                        }
                };
            } catch (e) {
                console.warn('[AssetContext] BroadcastChannel init failed', e);
            }
        }

        // Fallback: StorageEvent for older browsers
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'activeAssetId') {
                const v = e.newValue;
                const numeric = v ? Number(v) : null;
                if (numeric === null || Number.isNaN(numeric)) return;
                setSelectedAssetId(numeric as number);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => {
            try {
                assetChannelRef.current?.close();
            } catch (e) { }
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    // --- NEW: Optimistic Update function ---
    const updateAsset = (id: number, updates: Partial<Asset>) => {
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
    const logActivity = (assetId: number, category: 'MAINTENANCE' | 'DESIGN' | 'SYSTEM', message: string, changes?: { oldVal: any, newVal: any }) => {
        setAssetLogs(prev => {
            const previousLog = prev[0]; // Assuming desc order
            const previousHash = previousLog?.hash || 'GENESIS_HASH';

            // Create payload for hashing
                const payload = {
                id: crypto.randomUUID(),
                assetId,
                date: new Date().toISOString(),
                category,
                message,
                author: 'CurrentUser', // TODO: Get actual user
                changes,
                previousHash
            };

            // Calculate SHA-256 Hash synchronously (simplification) or use a simple hash for demo if crypto.subtle is async
            // For true Ledger integrity, we'd use crypto.subtle.digest(), but that is async.
            // setAssetLogs is sync. We can use a simple hash function for now or make it async.
            // Let's use a robust string hash for "Proof of Concept" Ledger in sync mode.
            // Or better: Use JSON.stringify and a simple hash function.

            const simpleHash = (str: string) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return hash.toString(16);
            }

            const signature = simpleHash(JSON.stringify(payload) + previousHash);

            const newLog: AssetHistoryEntry = {
                ...payload,
                hash: signature
            };

            // console.log(`[LEDGER] Signed Block: ${signature} (Prev: ${previousHash})`);

            return [newLog, ...prev];
        });
    };

    // Create a ref to hold the debounced logging function
    // We use a ref so the debounce timer persists across renders
    const debouncedLogContextSwitch = useRef(
        debounce((assetName: string) => {
            logAction('CONTEXT_SWITCH', assetName, 'SUCCESS');
        }, 1000) // 1 second delay
    ).current;
    const selectAsset = useCallback((id: number | string) => {
        const numeric = typeof id === 'number' ? id : (id ? Number(id) : null);
        if (numeric === null || Number.isNaN(numeric)) {
            console.warn('[AssetContext] selectAsset called with invalid id', id);
            return;
        }
        setSelectedAssetId(numeric);
        localStorage.setItem('activeAssetId', String(numeric)); // Save to local storage

        // Broadcast to other tabs instantly
        assetChannelRef.current?.postMessage({ type: 'ASSET_CHANGED', assetId: numeric });

        const asset = assets.find(a => a.id === numeric);
        if (asset) {
            // Call the debounced function instead of direct logAction
            debouncedLogContextSwitch(asset.name);
        }
    }, [assets, debouncedLogContextSwitch]);

    // --- NEW: Clear selection for "Fleet View" mode ---
    const clearSelection = useCallback(() => {
        setSelectedAssetId(null);
        localStorage.removeItem('activeAssetId');
        logAction('CONTEXT_SWITCH', 'Fleet View', 'SUCCESS');
    }, [logAction]);


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
                    id: -Date.now(),
                    name: dbPayload.name,
                    type: dbPayload.type,
                    location: dbPayload.location,
                    coordinates: [dbPayload.lat, dbPayload.lng],
                    capacity: dbPayload.power_output,
                    status: dbPayload.status as Asset['status'],
                    specs: dbPayload.specs,
                    turbineProfile: dbPayload.specs?.turbineProfile
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
                    id: Number(data.id),
                    name: data.name,
                    type: data.type,
                    location: data.location,
                    coordinates: [data.lat, data.lng],
                    capacity: parseFloat(data.power_output),
                    status: data.status,
                    turbine_type: data.turbine_type || (['pelton', 'francis', 'kaplan', 'crossflow'].includes(data.type?.toLowerCase()) ? data.type.toLowerCase() : 'francis'),
                    specs: data.specs || {},
                    turbineProfile: data.specs?.turbineProfile
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

    // --- NEW: Boolean for conditional rendering (must be after selectedAsset) ---
    const isAssetSelected = selectedAssetId !== null && selectedAsset !== null;

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
        assetLogs,
        // --- NEW: Golden Thread additions ---
        isAssetSelected,
        clearSelection
    }), [assets, selectedAsset, activeProfile, selectAsset, loading, addAsset, updateAsset, logActivity, assetLogs, isAssetSelected, clearSelection]);

    return (
        <AssetContext.Provider value={value}>
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
