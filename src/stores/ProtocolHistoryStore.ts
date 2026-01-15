import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === TYPES ===
export interface ProtocolHistoryEntry {
    id: string;
    protocolId: string;
    protocolName: string;
    assetId: string;
    assetName: string;
    timestamp: number;
    type: 'protocol' | 'work_order';
    ledgerUUID?: string; // Link to LocalLedger entry
    synced?: boolean; // NEW: Track sync status
    details?: any; // NEW: Store full protocol payload (e.g. audit measurements)
}

interface ProtocolHistoryState {
    history: ProtocolHistoryEntry[];
    pendingSyncCount: number; // NEW

    // Actions
    addEntry: (entry: Omit<ProtocolHistoryEntry, 'id' | 'timestamp' | 'synced'>) => void;
    getEntriesForAsset: (assetId: string, hours?: number) => ProtocolHistoryEntry[];
    getRecentEntries: (count?: number) => ProtocolHistoryEntry[];
    clearHistory: () => void;
    markAsSynced: (id: string) => void; // NEW
}

// Storage key constant
const STORAGE_KEY = 'anohub_protocol_history';
const CHANNEL_NAME = 'anohub_protocol_channel';

// BroadcastChannel for cross-tab sync
let protocolChannel: BroadcastChannel | null = null;

try {
    protocolChannel = new BroadcastChannel(CHANNEL_NAME);
} catch {
    console.warn('[ProtocolHistory] BroadcastChannel not supported');
}

/**
 * ProtocolHistoryStore - Zustand store with persistence and cross-tab sync
 * 
 * Tracks all generated protocols and work orders for:
 * - Event markers on Executive Dashboard sparklines
 * - Historical context in reports
 * - Audit trail
 */
export const useProtocolHistoryStore = create<ProtocolHistoryState>()(
    persist(
        (set, get) => ({
            history: [],
            pendingSyncCount: 0,

            addEntry: (entry) => {
                const newEntry: ProtocolHistoryEntry = {
                    ...entry,
                    id: `proto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    timestamp: Date.now(),
                    synced: false // Default to unsynced
                };

                set(state => ({
                    history: [newEntry, ...state.history].slice(0, 200),
                    pendingSyncCount: state.pendingSyncCount + 1
                }));

                // Broadcast to other tabs
                protocolChannel?.postMessage({
                    type: 'PROTOCOL_ADDED',
                    entry: newEntry
                });

                console.log(`[ProtocolHistory] Logged: ${newEntry.protocolName} for ${newEntry.assetName}`);

                // SIMULATION: Auto-sync after 5 seconds to demonstrate "Unsynced" state
                setTimeout(() => {
                    get().markAsSynced(newEntry.id);
                }, 5000);
            },

            markAsSynced: (id) => {
                set(state => {
                    const entryIndex = state.history.findIndex(e => e.id === id);
                    if (entryIndex === -1) return state;

                    const newHistory = [...state.history];
                    if (!newHistory[entryIndex].synced) {
                        newHistory[entryIndex] = { ...newHistory[entryIndex], synced: true };
                        return {
                            history: newHistory,
                            pendingSyncCount: Math.max(0, state.pendingSyncCount - 1)
                        };
                    }
                    return state;
                });
            },

            getEntriesForAsset: (assetId, hours = 24) => {
                const cutoff = Date.now() - (hours * 60 * 60 * 1000);
                return get().history.filter(
                    entry => entry.assetId === assetId && entry.timestamp >= cutoff
                );
            },

            getRecentEntries: (count = 10) => {
                return get().history.slice(0, count);
            },

            clearHistory: () => {
                set({ history: [], pendingSyncCount: 0 });
            }
        }),
        {
            name: STORAGE_KEY,
            // Skip rehydration on SSR
            skipHydration: typeof window === 'undefined'
        }
    )
);

// Listen for cross-tab updates
if (protocolChannel) {
    try {
        protocolChannel.onmessage = (event) => {
            if (event.data?.type === 'PROTOCOL_ADDED') {
                const state = useProtocolHistoryStore.getState();
                // Check if entry already exists (avoid duplicates)
                if (!state.history.some(e => e.id === event.data.entry.id)) {
                    useProtocolHistoryStore.setState({
                        history: [event.data.entry, ...state.history].slice(0, 200)
                        // Note: We don't increment pendingSyncCount here for remote tabs to avoid double warning
                    });
                }
            }
        };
    } catch (e) {
        console.warn('[ProtocolHistory] Error in channel listener:', e);
    }
}

// Helper: Convert history entries to sparkline markers
export const historyToSparklineMarkers = (
    entries: ProtocolHistoryEntry[],
    hoursRange: number = 24
): { index: number; color: string; entry: ProtocolHistoryEntry }[] => {
    const now = Date.now();
    const msPerHour = 60 * 60 * 1000;

    return entries.map(entry => {
        const hoursAgo = (now - entry.timestamp) / msPerHour;
        // Map to 24-point array index (0 = oldest, 23 = most recent)
        const index = Math.min(23, Math.max(0, Math.floor(hoursRange - hoursAgo)));

        return {
            index,
            color: entry.type === 'protocol' ? '#FBBF24' : '#A855F7', // Amber for protocol, Purple for work order
            entry
        };
    });
};
