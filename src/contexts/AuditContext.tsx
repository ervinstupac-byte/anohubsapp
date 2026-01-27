import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface AuditContextType {
    logAction: (action: string, target: string, status?: 'SUCCESS' | 'FAILURE', details?: any) => Promise<void>;
    logs: AuditEntry[]; // For local display/debugging if needed
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    // We can't always rely on useAuth inside AuditProvider if AuditProvider wraps AuthProvider, 
    // but typically Auth wraps Audit or vice versa. 
    // For now, let's assume we get the user ID from the session or local storage if useAuth isn't ready.
    // Ideally, useAuth should be available if AuditProvider is inside AuthProvider.

    // Checking if supabase is configured
    const isSupabaseConfigured = !!supabase;

    const logAction = async (action: string, target: string, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS', details?: any) => {

        // Attempt to get current user ID from localStorage or Supabase session if possible
        // In a real app, this would come from the AuthContext
        const storedSession = localStorage.getItem('sb-kvk-auth-token'); // Example key, might vary
        let operatorId = 'anonymous';
        try {
            if (storedSession) {
                const session = JSON.parse(storedSession);
                operatorId = session.user?.id || session.user?.email || 'anonymous';
            }
        } catch (e) {
            // ignore
        }

        const newEntry: AuditEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            operatorId,
            action,
            target,
            status,
            details
        };

        // 1. Log to Console (Dev)
        console.log('[AUDIT LOG]', newEntry);

        // 2. Update Local State (for UI display if needed)
        setLogs(prev => [newEntry, ...prev]);

        // 3. Persist to Supabase (if configured)
        // 3. Persist to Supabase (if configured)
        if (isSupabaseConfigured) {
            // NC-76.3: Strict 1s timeout to prevent blocking application boot
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Supabase Timeout')), 1000)
            );

            try {
                // Race the insert against the 1s timeout
                const { error } = await Promise.race([
                    supabase
                        .from('audit_logs')
                        .insert([
                            {
                                timestamp: newEntry.timestamp,
                                operator_id: newEntry.operatorId,
                                action: newEntry.action,
                                target: newEntry.target,
                                status: newEntry.status,
                                details: newEntry.details
                            }
                        ]),
                    timeoutPromise
                ]) as any;

                if (error) throw error;

            } catch (err: any) {
                // SILENT FALLBACK: Log as debug only to keep console clean
                console.debug(`[AuditContext] Remote log suppressed (${err.message || 'Unknown'}). Using local storage.`);

                // Fallback: Save to sessionStorage so we don't lose the "paper trail" for this session
                try {
                    const existing = JSON.parse(sessionStorage.getItem('local_audit_logs') || '[]');
                    existing.push(newEntry);
                    sessionStorage.setItem('local_audit_logs', JSON.stringify(existing));
                } catch (storeErr) {
                    // storage full or disabled, ignore
                }
            }
        }
    };

    return (
        <AuditContext.Provider value={{ logAction, logs }}>
            {children}
        </AuditContext.Provider>
    );
};

export const useAudit = () => {
    const context = useContext(AuditContext);
    if (context === undefined) {
        throw new Error('useAudit must be used within an AuditProvider');
    }
    return context;
};
