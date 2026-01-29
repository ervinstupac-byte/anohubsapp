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
  async record(entry: LedgerInput) {
    const payload = {
      symptom_observed: entry.symptom_observed || 'MANUAL_NOTE',
      actual_cause: entry.actual_cause || '',
      resolution_steps: entry.resolution_steps || '',
      asset_id: entry.asset_id || null,
      work_order_id: entry.work_order_id || null,
      created_at: new Date().toISOString()
    };

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
