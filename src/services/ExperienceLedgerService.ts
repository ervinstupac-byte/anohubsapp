import { supabase } from './supabaseClient';
import { ExperienceLedgerSchema } from '../schemas/supabase';

type LedgerInput = Partial<{
  symptom_observed: string;
  actual_cause: string;
  resolution_steps: string;
  asset_id: string | null;
  work_order_id: string | null;
}>;

export const ExperienceLedgerService = {
  async list(asset_id?: string, limit = 50) {
    // Verify there is an active authenticated session to avoid 401 console logs for guests
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = !!data.session;
    } catch (e) {}

    if (!hasSession) {
      console.debug('[ExperienceLedgerService] Guest user: simulating empty experience ledger.');
      return { success: true, data: [] };
    }

    try {
      let query = supabase
        .from('experience_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (asset_id) {
        query = query.eq('asset_id', asset_id);
      }

      const { data, error } = await query;
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e };
    }
  },

  async getById(id: string) {
    // Verify there is an active authenticated session to avoid 401 console logs for guests
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = !!data.session;
    } catch (e) {}

    if (!hasSession) {
      return { success: true, data: null };
    }

    try {
      const { data, error } = await supabase
        .from('experience_ledger')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e };
    }
  },

  async update(id: string, entry: LedgerInput) {
    // Verify there is an active authenticated session to avoid 401 console logs for guests
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = !!data.session;
    } catch (e) {}

    if (!hasSession) {
      return { success: true, data: entry };
    }

    const payload = {
      symptom_observed: entry.symptom_observed,
      actual_cause: entry.actual_cause,
      resolution_steps: entry.resolution_steps,
      asset_id: entry.asset_id ?? null,
      work_order_id: entry.work_order_id ?? null
    };

    try {
      const { data, error } = await supabase
        .from('experience_ledger')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e };
    }
  },

  async delete(id: string) {
    // Verify there is an active authenticated session to avoid 401 console logs for guests
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = !!data.session;
    } catch (e) {}

    if (!hasSession) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('experience_ledger').delete().eq('id', id);
      if (error) return { success: false, error };
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  },

  async record(entry: LedgerInput) {
    const payload = {
      symptom_observed: entry.symptom_observed || 'MANUAL_NOTE',
      actual_cause: entry.actual_cause || '',
      resolution_steps: entry.resolution_steps || '',
      asset_id: entry.asset_id || null,
      work_order_id: entry.work_order_id || null,
      created_at: new Date().toISOString()
    };

    // Verify there is an active authenticated session to avoid 401 console logs for guests
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = !!data.session;
    } catch (e) {}

    if (!hasSession) {
      console.debug('[ExperienceLedgerService] Guest user: simulating experience ledger insertion.');
      return { success: true, data: payload as any };
    }

    // Validate shape before inserting
    const parsed = ExperienceLedgerSchema.partial().safeParse(payload);
    if (!parsed.success) {
      // still attempt to insert, but log the validation error
      try {
        await supabase.from('experience_ledger').insert(payload);
      } catch (e) {
        console.warn('ExperienceLedgerService.record failed insert with invalid payload', e, parsed.error);
      }
      return { success: false, error: parsed.error };
    }

    const { data, error } = await supabase.from('experience_ledger').insert(parsed.data).select().single();
    if (error) return { success: false, error };
    return { success: true, data };
  }
  ,
  async lookupDiagnosis(symptom_key: string, asset_id?: string) {
    try {
      // Verify there is an active authenticated session to avoid 401 console logs for guests
      let hasSession = false;
      try {
        const { data } = await supabase.auth.getSession();
        hasSession = !!data.session;
      } catch (e) {}

      if (!hasSession) {
        console.debug('[ExperienceLedgerService] Guest user: skipping database lookup.');
        return { success: true, data: [] };
      }

      let query = supabase
        .from('expert_knowledge_base')
        .select('*')
        .ilike('symptom_key', `%${symptom_key}%`)
        .limit(25);

      if (asset_id) {
        query = query.eq('asset_id', asset_id as any);
      }

      const { data, error } = await query;
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e };
    }
  }
};

export default ExperienceLedgerService;
