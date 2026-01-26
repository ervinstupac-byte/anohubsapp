import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuditSnapshot {
    id: string;
    timestamp: number;
    type: 'heatmap' | 'diagnostic' | 'manual';
    data: {
        systemHealth: string;
        diagnostics: any[];
        deltaMap: any;
        neuralPulse: {
            progress: number;
            weights: Record<string, number>;
        };
        screenshot?: string; // Base64 image
    };
    metadata: {
        operator?: string;
        notes?: string;
        tags?: string[];
    };
}

interface DigitalLedgerState {
    snapshots: AuditSnapshot[];
    addSnapshot: (snapshot: Omit<AuditSnapshot, 'id' | 'timestamp'>) => void;
    getSnapshot: (id: string) => AuditSnapshot | undefined;
    getRecentSnapshots: (count: number) => AuditSnapshot[];
    clearOldSnapshots: (daysToKeep: number) => void;
}

export const useDigitalLedger = create<DigitalLedgerState>()(
    persist(
        (set, get) => ({
            snapshots: [],

            addSnapshot: (snapshot) => {
                const newSnapshot: AuditSnapshot = {
                    ...snapshot,
                    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now()
                };

                set((state) => ({
                    snapshots: [newSnapshot, ...state.snapshots].slice(0, 1000) // Keep last 1000
                }));

                console.log('📸 AUDIT SNAPSHOT CAPTURED:', newSnapshot.id);
                return newSnapshot.id;
            },

            getSnapshot: (id) => {
                return get().snapshots.find(s => s.id === id);
            },

            getRecentSnapshots: (count) => {
                return get().snapshots.slice(0, count);
            },

            clearOldSnapshots: (daysToKeep) => {
                const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
                set((state) => ({
                    snapshots: state.snapshots.filter(s => s.timestamp > cutoffTime)
                }));
            }
        }),
        {
            name: 'anohub-digital-ledger',
            version: 1
        }
    )
);
