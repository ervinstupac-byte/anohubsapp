import { create } from 'zustand';
import { supabase } from '../services/supabaseClient.ts';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO UTC
  operatorId: string;
  action: string;
  target: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: any;
}

interface AuditStore {
  logs: AuditEntry[];
  logAction: (
    action: string,
    target: string,
    status?: 'SUCCESS' | 'FAILURE',
    details?: any
  ) => Promise<void>;
}

// Checking if supabase is configured
const isSupabaseConfigured = !!supabase;

export const useAuditStore = create<AuditStore>((set, get) => ({
  logs: [],

  logAction: async (
    action: string,
    target: string,
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS',
    details?: any
  ) => {
    // Attempt to get current user ID from localStorage or Supabase session if possible
    const storedSession = localStorage.getItem('sb-kvk-auth-token');
    let operatorId = 'anonymous';
    try {
      if (storedSession) {
        const session = JSON.parse(storedSession);
        operatorId = session.user?.id || session.user?.email || 'anonymous';
      }
    } catch (e) {
      /* ignore */
    }

    const newEntry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      operatorId,
      action,
      target,
      status,
      details,
    };

    // 1. Log to Console (Dev)
    console.log('[AUDIT LOG]', newEntry);

    // 2. Update Local State (for UI display if needed)
    set(state => ({
      logs: [newEntry, ...state.logs],
    }));

    // 3. Persist to Supabase (if configured)
    if (isSupabaseConfigured) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase Timeout')), 1000)
      );

      try {
        const { error } = (await Promise.race([
          supabase.from('audit_logs').insert([
            {
              timestamp: newEntry.timestamp,
              operator_id: newEntry.operatorId,
              action: newEntry.action,
              target: newEntry.target,
              status: newEntry.status,
              details: newEntry.details,
            },
          ]),
          timeoutPromise,
        ])) as any;

        if (error) throw error;
      } catch (err: any) {
        console.debug(
          `[AuditStore] Remote log suppressed (${err.message || 'Unknown'}). Using local storage.`
        );
        try {
          const existing = JSON.parse(sessionStorage.getItem('local_audit_logs') || '[]');
          existing.push(newEntry);
          sessionStorage.setItem('local_audit_logs', JSON.stringify(existing));
        } catch (storeErr) {
          /* ignore */
        }
      }
    }
  },
}));
