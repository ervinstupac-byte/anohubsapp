import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CLIENT (NC-76.4 - Hardcoded Credentials + Connection Verification)
// ============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials missing! Check .env file.');
    // NC-11920: Visual Feedback for Missing Env Vars
    if (typeof window !== 'undefined') {
        const errorBanner = document.createElement('div');
        errorBanner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ef4444;color:white;text-align:center;padding:12px;font-family:monospace;font-weight:bold;z-index:99999;border-top:2px solid #b91c1c;';
        errorBanner.innerHTML = '⚠️ CRITICAL: SUPABASE CREDENTIALS MISSING. CHECK .ENV CONFIGURATION.';
        document.body.appendChild(errorBanner);
    }
}

// Cross-environment variable access (Vite vs Node) - FALLBACK only
const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
};

// Use hardcoded values first, then fall back to env vars
const supabaseUrl = SUPABASE_URL || getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = SUPABASE_ANON_KEY || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// ============================================================================
// CONNECTION STATE
// ============================================================================
export interface ConnectionState {
    isConnected: boolean;
    isVerified: boolean;
    lastCheck: Date | null;
    error: string | null;
}

let connectionState: ConnectionState = {
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
const createNoopClient = (): any => {
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
        unsubscribe: async () => ({}),
    });

    const noopStorage = () => ({
        from: () => ({
            upload: async () => ({ error: null, data: null }),
            download: async () => ({ data: null, error: null }),
            getPublicUrl: () => ({ publicURL: '' })
        })
    });

    return {
        from: noopFrom,
        channel: noopChannel,
        removeChannel: () => { },
        storage: noopStorage(),
        auth: {
            getUser: async () => ({ data: null, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        }
    };
};

if (!_supabase) {
    _supabase = createNoopClient();
}

// Proxy wrapper to switch to NOOP if connection fails (Offline Mode)
const proxyHandler = {
    get(target: any, prop: string | symbol) {
        // If we are offline/verified failed, redirect 'from', 'channel', 'storage' to NOOP
        if (connectionState.isVerified === false && connectionState.lastCheck !== null) {
            // Only intercept data calls, allow auth/helpers if needed? 
            // Actually, safer to just use NOOP for everything to prevent 404s.
            if (['from', 'channel', 'storage'].includes(String(prop))) {
                // Return NOOP implementation for these properties
                return createNoopClient()[prop];
            }
        }
        return target[prop];
    }
};

export const supabase: SupabaseClient = new Proxy(_supabase as any, proxyHandler) as SupabaseClient;

export function getSafeClient(): SupabaseClient {
    // Return NOOP if not connected
    if (connectionState.isVerified === false && connectionState.lastCheck !== null) {
        return createNoopClient();
    }
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
export { SUPABASE_URL, SUPABASE_ANON_KEY };