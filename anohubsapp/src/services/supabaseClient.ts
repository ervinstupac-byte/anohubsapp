import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Nedostaju Supabase ključevi u .env datoteci!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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