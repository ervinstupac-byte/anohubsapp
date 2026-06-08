import { supabase } from './supabaseClient';

export type DiagnosticLabType = 'SYSTEM_PREDICTION' | 'VIBRATION_ANALYSIS' | 'GOVERNOR_DEADBAND' | 'GENERATOR_AIR_GAP';

export interface DiagnosticSnapshot {
    id: string;
    asset_id: string;
    lab_type: DiagnosticLabType;
    input_parameters: Record<string, any>;
    diagnostic_results: Record<string, any>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export async function saveDiagnosticSnapshot(
    assetId: string,
    labType: DiagnosticLabType,
    inputParams: Record<string, any>,
    diagnosticResults: Record<string, any>
): Promise<{ success: boolean; data: DiagnosticSnapshot | null; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('diagnostic_snapshots')
            .insert({
                asset_id: assetId,
                lab_type: labType,
                input_parameters: inputParams,
                diagnostic_results: diagnosticResults,
                created_by: null,
            })
            .select()
            .single();

        if (error) {
            console.error('[DiagnosticHistoryService] Save error:', error);
            return { success: false, data: null, error: error.message };
        }

        return { success: true, data: data as DiagnosticSnapshot, error: null };
    } catch (e) {
        console.error('[DiagnosticHistoryService] Unhandled error:', e);
        return { success: false, data: null, error: (e as Error).message };
    }
}

export async function getAssetHistory(
    assetId: string
): Promise<{ success: boolean; data: DiagnosticSnapshot[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('diagnostic_snapshots')
            .select('*')
            .eq('asset_id', assetId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DiagnosticHistoryService] Get history error:', error);
            return { success: false, data: [], error: error.message };
        }

        return { success: true, data: data as DiagnosticSnapshot[], error: null };
    } catch (e) {
        console.error('[DiagnosticHistoryService] Unhandled history error:', e);
        return { success: false, data: [], error: (e as Error).message };
    }
}

export async function getAllAssets(): Promise<{ success: boolean; data: any[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('assets')
            .select('id, name, turbine_family, turbine_variant')
            .order('name');
        
        if (error) {
            console.error('[DiagnosticHistoryService] Get assets error:', error);
            return { success: false, data: [], error: error.message };
        }

        return { success: true, data: data || [], error: null };
    } catch (e) {
        console.error('[DiagnosticHistoryService] Unhandled assets error:', e);
        return { success: false, data: [], error: (e as Error).message };
    }
}
