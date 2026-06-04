import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import type { Asset } from '../types';

// --- Assets ---
export const useAssets = () => {
    return useQuery({
        queryKey: ['assets'],
        queryFn: async (): Promise<Asset[]> => {
            const { data, error } = await supabase.from('assets').select('*');
            if (error) throw error;
            return data as Asset[];
        }
    });
};

// --- Work Orders ---
export const useWorkOrders = () => {
    return useQuery({
        queryKey: ['workOrders'],
        queryFn: async () => {
            const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });
};

// --- Maintenance Logs ---
export const useMaintenanceLogs = () => {
    return useQuery({
        queryKey: ['maintenanceLogs'],
        queryFn: async () => {
            const { data, error } = await supabase.from('maintenance_logs').select('*').order('timestamp', { ascending: false });
            if (error) throw error;
            return data;
        }
    });
};

// --- Inventory ---
export const useInventory = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const { data, error } = await supabase.from('inventory_assets').select('*');
            if (error) throw error;
            return data;
        }
    });
};

// --- Threshold Configs ---
export const useThresholdConfigs = (assetIds?: string[]) => {
    return useQuery({
        queryKey: ['thresholdConfigs', assetIds],
        queryFn: async () => {
            let query = supabase.from('threshold_configs').select('*');
            if (assetIds) query = query.in('asset_id', assetIds);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    });
};
