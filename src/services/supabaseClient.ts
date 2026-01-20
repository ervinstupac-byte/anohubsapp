import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Build-time tolerant supabase client: if env missing, provide a noop client that
// implements commonly used methods to avoid import-time throws during CI/Vercel builds.
let _supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('[supabaseClient] VITE_SUPABASE env missing — creating noop client for build/CI.');

    const noopFrom = () => ({
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        eq() { return this; },
        order() { return this; },
        limit() { return this; }
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
        removeChannel: () => {},
        storage: noopStorage(),
        auth: {
            getUser: async () => ({ data: null, error: null })
        }
    };
}

export const supabase: any = _supabase;

export function getSafeClient() {
    return _supabase;
}

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