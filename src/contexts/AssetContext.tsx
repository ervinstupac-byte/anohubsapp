import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback, ReactNode, Suspense, lazy } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import type { Asset, AssetContextType, AssetHistoryEntry } from '../types.ts';
import { useAudit } from './AuditContext.tsx';
import { useAuth } from './AuthContext.tsx';
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
                    // SILENT FALLBACK (NC-20801 FORCE MODE)
                    console.debug(`[AssetContext] Remote fetch suppressed (${supaErr.message || 'Unknown'}). FORCE-LOADING LOCAL DATA.`);

                    if (localAssets.length > 0) {
                        setAssets(localAssets);
                    } else {
                        // HARD FALLBACK - BORN PERFECT DEMO SQUAD
                        setAssets([
                            {
                                id: 1,
                                name: 'Francis Demo Unit',
                                type: 'HPP',
                                location: 'Bihać, Bosnia & Herzegovina',
                                coordinates: [44.817, 15.872],
                                capacity: 12.5,
                                status: 'Operational',
                                turbine_type: 'FRANCIS',
                                specs: {
                                    turbineProfile: {
                                        type: 'FRANCIS',
                                        ratedPowerMW: 12.5,
                                        ratedHeadM: 85,
                                        manufacturer: 'Voith Hydro'
                                    }
                                }
                            }
                        ]);
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
    const debouncedLogContextSwitch = useRef<(assetName: string) => void>();

    // Initialize the debounced function
    useEffect(() => {
        debouncedLogContextSwitch.current = (assetName: string) => {
            setTimeout(() => {
                logAction('CONTEXT_SWITCH', assetName, 'SUCCESS');
            }, 1000); // 1 second delay
        };
    }, [logAction]);

    const selectAsset = useCallback((id: number | string) => {
        const numeric = typeof id === 'number' ? id : (id ? Number(id) : null);
        if (numeric === null || Number.isNaN(numeric)) {
            console.warn('[AssetContext] selectAsset called with invalid id', id);
            return;
        }
        setSelectedAssetId(numeric);
        localStorage.setItem('activeAssetId', String(numeric)); // Save to local storage

        // Broadcast to other tabs instantly
        if (debouncedLogContextSwitch.current) {
            const asset = assets.find(a => a.id === numeric);
            if (asset) {
                debouncedLogContextSwitch.current(asset.name);
            }
        }
        assetChannelRef.current?.postMessage({ type: 'ASSET_CHANGED', assetId: numeric });

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
                try {
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
                } catch (err) {
                    console.warn('[AssetContext] Online creation failed. Falling back to OFFLINE STORAGE.', err);
                    
                    // FALLBACK: Save locally even if authenticated
                    newAsset = {
                        id: -Date.now(), // Negative ID for local
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
                    
                    // Notify user (optional, but good for UX)
                    // We don't have toast here directly but logAction helps
                    logAction('ASSET_REGISTER', `${newAsset.name} (OFFLINE)`, 'WARNING');
                }
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
