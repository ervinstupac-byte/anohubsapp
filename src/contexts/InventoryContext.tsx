import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.ts';

export interface InventoryItem {
    id: string;
    name: string;
    partNumber: string;
    category: string;
    quantity: number;
    minStockThreshold: number;
    unitPrice: number;
    turbineTypes: string[];
    maintenanceSpecs?: {
        tools: string[];
        instructions: string[];
        clearance?: string;
    };
}

interface InventoryContextType {
    inventory: InventoryItem[];
    getMissingParts: (turbineType: string) => InventoryItem[];
    getTotalInventoryValue: () => number;
    updateStock: (itemId: string, delta: number) => Promise<void>;
    loading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const INITIAL_GUEST_INVENTORY: InventoryItem[] = [
        { id: '1', name: 'Runner Blade (Francis)', partNumber: 'FR-BLD-01', category: 'Mechanical', quantity: 3, minStockThreshold: 2, unitPrice: 15000, turbineTypes: ['francis'], maintenanceSpecs: { tools: ['Crane'], instructions: ['Inspect for cavitation'] } },
        { id: '2', name: 'Guide Vane Seal', partNumber: 'GV-SEAL-05', category: 'Seals', quantity: 50, minStockThreshold: 20, unitPrice: 120, turbineTypes: ['francis', 'kaplan'], maintenanceSpecs: { tools: ['Seal Puller'], instructions: ['Replace annually'] } },
        { id: '3', name: 'Thrust Bearing Pad', partNumber: 'TB-PAD-09', category: 'Bearings', quantity: 4, minStockThreshold: 6, unitPrice: 4500, turbineTypes: ['pelton', 'francis', 'kaplan'], maintenanceSpecs: { tools: ['Micrometer'], instructions: ['Check for Babbitt wear'] } }
    ];

    const fetchInventory = async () => {
        setLoading(true);

        // NC-76.3: Strict 1s timeout for inventory fetch
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Inventory Fetch Timeout')), 1000)
        );

        try {
            const { data, error } = await Promise.race([
                supabase.from('inventory_assets').select('*'),
                timeoutPromise
            ]) as any;

            if (error) throw error;

            if (data) {
                setInventory(data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    partNumber: item.part_number,
                    category: item.category,
                    quantity: item.quantity,
                    minStockThreshold: item.min_stock_threshold,
                    unitPrice: parseFloat(item.unit_price),
                    turbineTypes: item.turbine_types || [],
                    maintenanceSpecs: item.maintenance_specs
                })));
            }
        } catch (err: any) {
            console.debug(`[InventoryContext] Fetch suppressed (${err.message || 'Unknown'}). Using Guest Fallback.`);
            setInventory(INITIAL_GUEST_INVENTORY);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const getMissingParts = useCallback((turbineType: string) => {
        // Find parts compatible with this turbine type that are below threshold
        return inventory.filter(part =>
            part.turbineTypes.includes(turbineType.toLowerCase()) &&
            part.quantity < part.minStockThreshold
        );
    }, [inventory]);

    const getTotalInventoryValue = useCallback(() => {
        return inventory.reduce((total, part) => total + (part.quantity * part.unitPrice), 0);
    }, [inventory]);

    const updateStock = async (itemId: string, delta: number) => {
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        const { error } = await supabase
            .from('inventory_assets')
            .update({ quantity: newQuantity })
            .eq('id', itemId);

        if (!error) {
            setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
        }
    };

    return (
        <InventoryContext.Provider value={{ inventory, getMissingParts, getTotalInventoryValue, updateStock, loading }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within an InventoryProvider');
    return context;
};
