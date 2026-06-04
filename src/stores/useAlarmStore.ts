/**
 * useAlarmStore.ts
 *
 * Reactive Zustand store for UI-facing alarm state.
 * Fed by AlarmBridgeContext, consumed by:
 *   - NotificationCenter (sidebar panel)
 *   - WorkflowHeader (badge count)
 *   - DashboardHeader (critical indicator)
 *   - AssetPassportModal (per-asset alarm list)
 *
 * This is the SINGLE source of truth for the notification UI.
 * SovereignAlarmManager is the engineering record-keeper.
 * This store is what makes it visible and reactive.
 */

import { create } from 'zustand';

export type AlarmPriorityUI = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlarmStateUI = 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED';

export interface UIAlarm {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  label: string;
  message: string;
  value: number;
  threshold: number;
  unit: string;
  priority: AlarmPriorityUI;
  state: AlarmStateUI;
  timestamp: number;
  canSelfHeal: boolean;
}

interface AlarmStoreState {
  alarms: UIAlarm[];
  panelOpen: boolean;

  // Derived counts (computed, not stored)
  addAlarm: (alarm: UIAlarm) => void;
  removeAlarm: (alarmId: string) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  clearAll: () => void;
  setAlarms: (alarms: UIAlarm[]) => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;

  // Selectors
  getActiveCount: () => number;
  getCriticalCount: () => number;
  getAlarmsForAsset: (assetId: string) => UIAlarm[];
}

export const useAlarmStore = create<AlarmStoreState>((set, get) => ({
  alarms: [],
  panelOpen: false,

  addAlarm: alarm =>
    set(state => {
      // Deduplicate: don't add if same alarm ID already exists
      if (state.alarms.find(a => a.id === alarm.id)) return state;
      return { alarms: [alarm, ...state.alarms].slice(0, 200) }; // cap at 200
    }),

  removeAlarm: alarmId =>
    set(state => ({
      alarms: state.alarms.filter(a => a.id !== alarmId),
    })),

  acknowledgeAlarm: alarmId =>
    set(state => ({
      alarms: state.alarms.map(a =>
        a.id === alarmId ? { ...a, state: 'ACKNOWLEDGED' as AlarmStateUI } : a
      ),
    })),

  clearAll: () => set({ alarms: [] }),

  setAlarms: alarms => set({ alarms }),

  togglePanel: () => set(state => ({ panelOpen: !state.panelOpen })),
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),

  getActiveCount: () => get().alarms.filter(a => a.state === 'ACTIVE').length,

  getCriticalCount: () =>
    get().alarms.filter(a => a.priority === 'CRITICAL' && a.state === 'ACTIVE').length,

  getAlarmsForAsset: (assetId: string) =>
    get().alarms.filter(a => a.assetId === assetId && a.state !== 'CLEARED'),
}));
