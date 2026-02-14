import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../stores/useAppStore';
import { useInventory } from './InventoryContext.tsx';

export interface WorkOrderStep {
    id: string;
    order_id: string;
    step_number: number;
    description: string;
    target_value: number | null;
    unit: string | null;
    required_tools: string[];
    required_consumables: { name: string; quantity: number }[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    actual_value?: number;
}

export interface WorkOrder {
    id: string;
    asset_id: number;
    title: string;
    issue_type: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'SEALED';
    steps: WorkOrderStep[];
}

interface WorkOrderContextType {
    activeWorkOrder: WorkOrder | null;
    currentStepIndex: number;
    loading: boolean;
    startWorkOrder: (id: string) => Promise<void>;
    completeStep: (value?: number) => Promise<void>;
    confirmTools: (tools: string[]) => Promise<void>;
    verifyWorkOrder: () => Promise<void>;
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

export const WorkOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const { inventory, updateStock } = useInventory();

    const startWorkOrder = async (id: string) => {
        setLoading(true);
        const { data: order } = await supabase
            .from('work_orders')
            .select('*, steps:work_order_steps(*)')
            .eq('id', id)
            .single();

        if (order) {
            setActiveWorkOrder(order);
            // Find first pending step
            const pendingIdx = order.steps.findIndex((s: any) => s.status === 'PENDING');
            setCurrentStepIndex(pendingIdx !== -1 ? pendingIdx : 0);

            await supabase.from('work_orders').update({ status: 'IN_PROGRESS' }).eq('id', id);
        }
        setLoading(false);
    };

    const completeStep = async (value?: number) => {
        if (!activeWorkOrder) return;
        const currentStep = activeWorkOrder.steps[currentStepIndex];

        // Real-time Validation
        if (currentStep.target_value !== null && value !== undefined) {
            if (value > currentStep.target_value * 1.2) {
                showToast(`Upozorenje: Vrijednost ${value}${currentStep.unit} je izvan tolerancije!`, 'error');
            }
        }

        // Process Consumables
        for (const consumable of currentStep.required_consumables) {
            const item = inventory.find(i => i.name.includes(consumable.name));
            if (item) {
                await updateStock(item.id, -consumable.quantity);
            }
        }

        const { error } = await supabase
            .from('work_order_steps')
            .update({
                status: 'COMPLETED',
                actual_value: value,
                completed_at: new Date().toISOString()
            })
            .eq('id', currentStep.id);

        if (!error) {
            showToast(`Korak "${currentStep.description}" završen.`, 'success');
            if (currentStepIndex < activeWorkOrder.steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                showToast("Svi koraci završeni. Čeka se ovjera inženjera.", "info");
            }
        }
    };

    const confirmTools = async (tools: string[]) => {
        showToast(`Alati potvrđeni: ${tools.join(', ')}. Status: U UPOTREBI.`, 'info');
    };

    const verifyWorkOrder = async () => {
        if (!activeWorkOrder) return;
        await supabase.from('work_orders').update({ status: 'SEALED' }).eq('id', activeWorkOrder.id);
        setActiveWorkOrder(null);
        showToast("Nalog ovjeren (Verified by Chief Engineer).", "success");
    };

    return (
        <WorkOrderContext.Provider value={{
            activeWorkOrder,
            currentStepIndex,
            loading,
            startWorkOrder,
            completeStep,
            confirmTools,
            verifyWorkOrder
        }}>
            {children}
        </WorkOrderContext.Provider>
    );
};

export const useWorkOrder = () => {
    const context = useContext(WorkOrderContext);
    if (!context) throw new Error('useWorkOrder must be used within WorkOrderProvider');
    return context;
};
