import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// During SSG/CI (e.g. Vercel builds) env vars may be unavailable.
// Don't throw at module import time — provide a safe noop client so the
// bundler doesn't fail. Runtime usage that requires Supabase will still
// receive null/empty responses and should handle them.
let supabaseInstance: any = null;
if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // Minimal noop client surface used during build-time when keys are missing.
    // Methods return resolved promises with empty data shapes to avoid crashes.
    // Keep simple chainable methods for queries used across the app.
    const chainable = () => {
        const obj: any = {
            select: async () => ({ data: [], error: null }),
            insert: async () => ({ data: null, error: null }),
            update: async () => ({ data: null, error: null }),
            delete: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
            eq() { return this; },
            gte() { return this; },
            lte() { return this; },
            in() { return this; },
            order() { return this; },
            limit() { return this; },
        };
        return obj;
    };

    supabaseInstance = {
        from: (_: string) => chainable(),
        rpc: async () => ({ data: [], error: null }),
        storage: {
            from: (_bucket: string) => ({
                getPublicUrl: (_path: string) => ({ publicUrl: null }),
                upload: async () => ({ data: null, error: null }),
                download: async () => ({ data: null, error: null }),
            }),
        },
    };
    // eslint-disable-next-line no-console
    console.warn('Supabase env vars missing: using noop client (build/CI environment).');
}

export const supabase = supabaseInstance;

/**
 * Get an exact count for a table using a GET with count=exact.
 * Falls back to array length when count is not provided by the client.
 */
export async function getTableCount(table: string): Promise<number> {
    try {
        const res: any = await supabase.from(table).select('id', { count: 'exact' });
        const { count, data } = res;
        if (typeof count === 'number') return count;
        if (Array.isArray(data)) return data.length;
        return 0;
    } catch (e) {
        console.error(`getTableCount failed for ${table}:`, (e as Error).message || e);
        return 0;
    }
}