import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CLIENT — credentials from environment only (no hardcoded fallbacks)
// ============================================================================

// Cross-environment variable access (Vite vs Node)
const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// ============================================================================
// CONNECTION STATE
// ============================================================================
export interface ConnectionState {
    isConnected: boolean;
    isVerified: boolean;
    lastCheck: Date | null;
    error: string | null;
}

const connectionState: ConnectionState = {
    isConnected: false,
    isVerified: false,
    lastCheck: null,
    error: null
};

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================
let _supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        _supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
            global: {
                headers: {
                    'x-client-info': 'anohubs-monolit/1.0'
                }
            }
        });
        connectionState.isConnected = true;
        console.log('[SupabaseClient] ✅ Client created successfully');
    } catch (err) {
        console.error('[SupabaseClient] ❌ Failed to create client:', err);
        connectionState.error = String(err);
    }
} else {
    console.warn('[SupabaseClient] ⚠️ Missing credentials - creating noop client');
}

// ============================================================================
// NOOP CLIENT (Fallback for build/CI)
// ============================================================================
if (!_supabase) {
    const noopFrom = () => ({
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        eq() { return this; },
        neq() { return this; },
        order() { return this; },
        limit() { return this; },
        range() { return this; },
        maybeSingle: async () => ({ data: null, error: null }),
    });

    const noopChannel = () => ({
        on() { return this; },
        subscribe: async () => ({}),
    });

    const noopStorage = () => ({
        from: () => ({
            upload: async () => ({ error: null, data: null }),
            download: async () => ({ data: null, error: null }),
            getPublicUrl: () => ({ publicURL: '' })
        })
    });

    _supabase = {
        from: noopFrom,
        channel: noopChannel,
        removeChannel: () => { },
        storage: noopStorage(),
        auth: {
            getUser: async () => ({ data: null, error: null }),
            getSession: async () => ({ data: null, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        }
    } as any;
}

export const supabase: SupabaseClient = _supabase as SupabaseClient;

export function getSafeClient(): SupabaseClient {
    return _supabase as SupabaseClient;
}

// ============================================================================
// CONNECTION VERIFICATION
// ============================================================================

/**
 * Verify the database connection by attempting a simple query.
 * Returns true if connection is healthy, false otherwise.
 */
export async function verifyConnection(timeoutMs: number = 3000): Promise<boolean> {
    if (!_supabase || !connectionState.isConnected) {
        connectionState.isVerified = false;
        connectionState.error = 'Client not initialized';
        return false;
    }

    try {
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
        );

        // Simple health check query
        const queryPromise = _supabase.from('assets').select('id', { count: 'exact', head: true });

        await Promise.race([queryPromise, timeoutPromise]);

        connectionState.isVerified = true;
        connectionState.lastCheck = new Date();
        connectionState.error = null;
        console.log('[SupabaseClient] ✅ Connection verified');
        return true;
    } catch (err: any) {
        connectionState.isVerified = false;
        connectionState.lastCheck = new Date();
        connectionState.error = err.message || 'Unknown error';
        console.warn('[SupabaseClient] ⚠️ Connection verification failed:', err.message);
        return false;
    }
}

/**
 * Get the current connection state
 */
export function getConnectionState(): ConnectionState {
    return { ...connectionState };
}

// ============================================================================
// TABLE COUNT UTILITY
// ============================================================================

/**
 * Get an exact count for a table using a GET with count=exact.
 * Falls back to array length when count is not provided by the client.
 */
export async function getTableCount(table: string): Promise<number> {
    try {
        const client = getSafeClient();
        const res: any = await client.from(table).select('id', { count: 'exact' });
        const { count, data } = res || {};
        if (typeof count === 'number') return count;
        if (Array.isArray(data)) return data.length;
        return 0;
    } catch (e) {
        console.error(`getTableCount failed for ${table}:`, (e as Error).message || e);
        return 0;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================
// Keep these for backward compatibility
const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseAnonKey;

export { SUPABASE_URL, SUPABASE_ANON_KEY };