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
    const [selectedAssetId, setSelectedAssetId] = useState<number | string | null>(null);
    const [loading, setLoading] = useState(true);

    // BroadcastChannel ref for cross-tab communication
    const assetChannelRef = useRef<BroadcastChannel | null>(null);

    // Load assets from Supabase or LocalStorage (Guest)
    useEffect(() => {
        console.log('[AssetContext] Step 1: Starting Initialization...');

        const fetchAssets = async () => {
            try {
                // FALLBACK ONLY: Check for guest assets in local storage first
                let localAssets: Asset[] = [];
                try {
                    localAssets = loadFromStorage<Asset[]>('guest_assets') || [];
                } catch (e) {
                    localAssets = [];
                }

                // NC-76.3: Strict 1.5s timeout for Supabase assets
                // If Supabase is slow or 404s, we fall back to local/hardcoded immediately
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Assets Fetch Timeout')), 1500)
                );

                console.log('[AssetContext] Step 1: Fetching assets...');

                // NC-76.4: Verify connection first
                // If verifyConnection fails quickly, we skip the fetch to save time
                // But since verifyConnection might take time, we just race everything

                try {
                    const { data, error } = await Promise.race([
                        supabase.from('assets').select('*'),
                        timeoutPromise
                    ]) as any;

                    if (error) throw error;

                    if (data) {
                        console.log('[AssetContext] Step 2: Supabase Assets Loaded:', data.length);
                        // ... normalization logic ...
                        const normalizeTurbine = (t: any) => {
                            if (!t) return 'PELTON';
                            const s = String(t);
                            const lower = s.toLowerCase();
                            if (['pelton', 'francis', 'kaplan', 'crossflow'].includes(lower)) return lower.toUpperCase();
                            return 'PELTON';
                        };

                        const mappedAssets: Asset[] = data.map((item: any) => ({
                            id: Number(item.id),
                            name: item.name,
                            type: item.type,
                            location: item.location,
                            coordinates: [item.lat || 0, item.lng || 0],
                            capacity: parseFloat(item.power_output) || 0,
                            status: item.status || 'Operational',
                            turbine_type: normalizeTurbine(item.turbine_type || item.type),
                            specs: item.specs || {},
                            turbineProfile: item.specs?.turbineProfile
                        }));
                        setAssets(mappedAssets);
                    }
                } catch (supaErr: any) {
                    // SILENT FALLBACK
                    console.debug(`[AssetContext] Remote fetch suppressed (${supaErr.message || 'Unknown'}). Using Local/Guest fallback.`);

                    if (localAssets.length > 0) {
                        setAssets(localAssets);
                        setSelectedAssetId(localAssets[0].id); // Auto-select first local
                    } else {
                        // HARD FALLBACK (If no guest assets exist either)
                        const demo = {
                            id: 1,
                            name: 'Unit-1 (Fallback)',
                            type: 'HPP',
                            location: 'Bihac',
                            coordinates: [44.81, 15.87] as [number, number],
                            capacity: 12.5,
                            status: 'Operational',
                            turbine_type: 'FRANCIS',
                            specs: {}
                        };
                        setAssets([demo as Asset]);
                        setSelectedAssetId(demo.id);
                    }
                }

                // --- PERSISTENCE LOGIC ---
                // ... (restored logic)
            } catch (error) {
                console.error('Critical AssetContext Error:', error);
            } finally {
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

    // Canonical asset updates and ledger-style activity should be performed via ProjectStateManager
    // Redundant optimistic local helpers removed to enforce single writer principle.

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
                    id: data.id, // Keep raw
                    name: data.name,
                    type: data.type,
                    location: data.location,
                    coordinates: [data.lat, data.lng],
                    capacity: parseFloat(data.power_output),
                    status: data.status,
                    turbine_type: (function () { const t = data.turbine_type || data.type; if (!t) return 'PELTON'; const lower = String(t).toLowerCase(); if (['pelton', 'francis', 'kaplan', 'crossflow'].includes(lower)) return lower.toUpperCase(); return 'PELTON'; })(),
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
        assetLogs,
        // --- NEW: Golden Thread additions ---
        isAssetSelected,
        clearSelection
        ,
        // Backwards-compatible no-op writers (deprecated; use ProjectStateManager)
        updateAsset: async (id: number | string, patch: any) => { console.warn('[AssetContext] updateAsset called (deprecated).', id); },
        logActivity: (assetId: number | string, eventType: string, payload?: any) => { console.warn('[AssetContext] logActivity called (deprecated).', assetId, eventType); }
    }), [assets, selectedAsset, activeProfile, selectAsset, loading, addAsset, assetLogs, isAssetSelected, clearSelection]);

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
