import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import idAdapter from '../utils/idAdapter';
import { InspectionImage } from '../services/StrategicPlanningService';
import {
    ActiveChecklist,
    TurbineType,
    ServiceAlert,
    ChecklistItemResponse,
    FieldNote,
    ChecklistTemplate
} from '../types/checklist';
import { ServiceChecklistEngine } from '../services/ServiceChecklistEngine';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

export interface MaintenanceTask {
    id: string;
    componentId: string; // e.g., 'TURBINE', 'BOLTS'
    title: string;
    description: string; // "Replace Grade 4.6 Bolts"
    recommendedSpec?: number; // e.g., 0.05 mm (Clearance)
    unit?: string;
    status: TaskStatus;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface LogEntry {
    id: string;
    taskId: string;
    timestamp: Date;
    technician: string; // "Amir H."
    measuredValue?: number;
    commentBS: string; // "Zategnuto na 450 Nm, zazor provjeren."
    summaryDE: string; // "Auf 450 Nm angezogen, Spiel geprüft." (Auto-generated)
    proofImage?: InspectionImage;
    pass: boolean; // Validation result;
}

export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface WorkOrder {
    id: string;
    assetId: number;
    assetName: string;
    trigger: 'MANUAL' | 'AI_PREDICTION' | 'SERVICE_ALERT';
    component: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: WorkOrderStatus;
    assignedTechnician?: string;
    requiredParts?: string[];
    estimatedHoursToComplete?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    completionNotes?: string;
}

interface MaintenanceContextType {
    tasks: MaintenanceTask[];
    logs: LogEntry[];
    operatingHours: Record<string, number>;
    workOrders: WorkOrder[];
    createLogEntry: (taskId: string, entry: Omit<LogEntry, 'id' | 'timestamp' | 'summaryDE' | 'pass'>) => Promise<void>;
    validateEntry: (taskId: string, value: number) => { valid: boolean; message: string };
    getTasksByComponent: (componentId: string) => MaintenanceTask[];
    predictServiceDate: (assetId: number, threshold: number) => Date | null;
    // Work Order Management
    createWorkOrder: (order: Omit<WorkOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<WorkOrder>;
    updateWorkOrder: (orderId: string, updates: Partial<Pick<WorkOrder, 'status' | 'assignedTechnician' | 'estimatedHoursToComplete'>>) => Promise<void>;
    completeWorkOrder: (orderId: string, completionNotes: string) => Promise<void>;
    updateOperatingHours: (assetId: number, hours: number) => void;
    // Service Checklist Functions
    activeChecklist: ActiveChecklist | null;
    serviceAlerts: ServiceAlert[];
    startChecklist: (turbineType: TurbineType, assetId: number, assetName: string, technicianName: string) => void;
    updateChecklistItem: (itemId: string, value: any) => void;
    addFieldNote: (itemId: string, transcript: string, audioSrc?: string) => void;
    completeChecklist: () => void;
    acknowledgeAlert: (alertId: string) => void;
    isLoading: boolean;
}

export const protocols = [
    { id: 'P1', name: 'Bearing Inspection', threshold: 2000, description: 'Check for wear and temperature stability.' },
    { id: 'P2', name: 'Oil Analysis', threshold: 4000, description: 'Spectral analysis of lubricating oil.' },
    { id: 'P3', name: 'Major Overhaul', threshold: 10000, description: 'Full disassembly and component validation.' }
];

// MOCK INITIAL TASKS (derived from Audit)
const INITIAL_TASKS: MaintenanceTask[] = [
    {
        id: 'T-101',
        componentId: 'BOLTS',
        title: 'Bolt Replacement',
        description: 'Replace Grade 4.6 with Grade 8.8',
        recommendedSpec: 8.8, // Grade
        unit: 'Grade',
        status: 'PENDING',
        priority: 'HIGH'
    },
    {
        id: 'T-102',
        componentId: 'TURBINE',
        title: 'Radial Clearance Check',
        description: 'Verify radial clearance is within 0.05 - 0.10 mm',
        recommendedSpec: 0.10, // Max limit
        unit: 'mm',
        status: 'PENDING',
        priority: 'MEDIUM'
    }
];

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_TASKS);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage if available (Legacy/Fallback)
    const [operatingHours, setOperatingHours] = useState<Record<string, number>>(() => {
        try {
            const stored = localStorage.getItem('operatingHours');
            return stored ? JSON.parse(stored) : { 'DEFAULT_ASSET': 1250 };
        } catch {
            return { 'DEFAULT_ASSET': 1250 };
        }
    });

    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

    // Service Checklist State
    const [activeChecklist, setActiveChecklist] = useState<ActiveChecklist | null>(null);
    const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>([]);

    // --- SUPABASE SYNC ---
    React.useEffect(() => {
        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('maintenance_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_logs' }, (payload: any) => {
                console.log('⚡ Realtime Log Update:', payload);
                fetchLogs(); // Refresh on simple change
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, (payload: any) => {
                console.log('⚡ Realtime WO Update:', payload);
                fetchWorkOrders();
            })
            .subscribe();

        return () => {
            try { (supabase as any).removeChannel(channel); } catch (e) { }
        };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([fetchLogs(), fetchWorkOrders()]);
        setIsLoading(false);
    };

    const fetchLogs = async () => {
        const { data, error } = await supabase
            .from('maintenance_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching logs:', error);
            return;
        }

        if (data) {
            // Map DB Types to App Types (Simple mapping)
            const mappedLogs: LogEntry[] = data.map((row: any) => ({
                id: row.id,
                taskId: row.task_id,
                technician: row.technician,
                commentBS: row.comment_bs,
                summaryDE: row.summary_de,
                measuredValue: row.measured_value,
                pass: row.pass,
                timestamp: new Date(row.timestamp),
                proofImage: row.proof_image_url ? { src: row.proof_image_url } as any : undefined
            }));
            setLogs(mappedLogs);
        }
    };

    const fetchWorkOrders = async () => {
        const { data, error } = await supabase
            .from('work_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching work orders:', error);
            return;
        }

        if (data) {
            const mappedOrders: WorkOrder[] = data.map((row: any) => ({
                id: row.id,
                assetId: row.asset_id,
                assetName: row.asset_name,
                component: row.component,
                description: row.description,
                priority: row.priority,
                status: row.status,
                trigger: row.trigger_source,
                assignedTechnician: row.assigned_technician,
                estimatedHoursToComplete: row.estimated_hours,
                completionNotes: row.completion_notes,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
                completedAt: row.completed_at ? new Date(row.completed_at) : undefined
            }));
            setWorkOrders(mappedOrders);
        }
    };

    const predictServiceDate = useCallback((assetId: number, threshold: number) => {
        const hours = operatingHours[assetId] || 0;
        const remaining = threshold - (hours % threshold);
        const dailyHours = 20; // Assumption
        const daysRemaining = remaining / dailyHours;
        const date = new Date();
        date.setDate(date.getDate() + daysRemaining);
        return date;
    }, [operatingHours]);

    const validateEntry = useCallback((taskId: string, value: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.recommendedSpec === undefined) return { valid: true, message: 'OK' };

        // Custom logic per task type (Mocked)
        if (task.componentId === 'TURBINE' && value > task.recommendedSpec) {
            return { valid: false, message: `Vrijednost izvan tolerancije! (${value} > ${task.recommendedSpec})` };
        }

        return { valid: true, message: 'OK' };
    }, [tasks]);

    const createLogEntry = useCallback(async (taskId: string, entry: Omit<LogEntry, 'id' | 'timestamp' | 'summaryDE' | 'pass'>) => {
        // Validation Check
        const validation = entry.measuredValue ? validateEntry(taskId, entry.measuredValue) : { valid: true };

        // Mock Translation Logic (Simple Map or static for prototype)
        const translations: Record<string, string> = {
            "Zategnuto na 450 Nm": "Auf 450 Nm angezogen",
            "Provjera zazora": "Spielprüfung",
            "Zamjena vijaka": "Schraubenaustausch"
        };
        const summaryDE = translations[entry.commentBS] || "Wartung durchgeführt.";

        // 1. Optimistic Update (UI feels instant)
        const tempId = Math.random().toString(36).substr(2, 9);
        const newLog: LogEntry = {
            id: tempId,
            taskId,
            timestamp: new Date(),
            technician: entry.technician,
            commentBS: entry.commentBS,
            measuredValue: entry.measuredValue,
            proofImage: entry.proofImage,
            summaryDE,
            pass: validation.valid
        };
        setLogs(prev => [newLog, ...prev]);

        // 2. Persist to Supabase
        const { error } = await supabase.from('maintenance_logs').insert({
            task_id: taskId,
            technician: entry.technician,
            comment_bs: entry.commentBS,
            summary_de: summaryDE,
            measured_value: entry.measuredValue,
            pass: validation.valid,
            proof_image_url: entry.proofImage?.src
        });

        if (error) {
            console.error('Failed to save log to Supabase:', error);
        }

        // Update Task Status
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'COMPLETED' } : t
        ));
    }, [validateEntry]);

    const getTasksByComponent = useCallback((id: string) => tasks.filter(t => t.componentId === id), [tasks]);

    // NEW: Service Checklist Functions
    const startChecklist = (turbineType: TurbineType, assetId: number, assetName: string, technicianName: string) => {
        const template = ServiceChecklistEngine.getTemplateForTurbine(turbineType);

        const newChecklist: ActiveChecklist = {
            id: `checklist_${Date.now()}`,
            templateId: `${turbineType}_${template.version}`,
            turbineType,
            assetId,
            assetName,
            startedAt: new Date().toISOString(),
            technicianName,
            items: [],
            fieldNotes: [],
            generatedAlerts: [],
            progress: {
                totalItems: ServiceChecklistEngine.getAllItems(template).length,
                completedItems: 0,
                photosTaken: 0,
                requiredPhotos: template.requiredPhotos,
                alertsGenerated: 0
            }
        };

        setActiveChecklist(newChecklist);
    };

    const updateChecklistItem = (itemId: string, value: any) => {
        if (!activeChecklist) return;

        const template = ServiceChecklistEngine.getTemplateForTurbine(activeChecklist.turbineType);
        const item = ServiceChecklistEngine.getItemById(template, itemId);
        if (!item) return;

        // Validate the value
        const validationResult = ServiceChecklistEngine.validateChecklistItem(item, value);

        // Create response
        const response: ChecklistItemResponse = {
            itemId,
            timestamp: new Date().toISOString(),
            validationResult
        };

        // Store value based on type
        if (item.type === 'BOOLEAN') {
            response.booleanValue = Boolean(value);
        } else if (item.type === 'MEASUREMENT') {
            response.measurementValue = Number(value);
        } else if (item.type === 'PHOTO') {
            response.photos = value;
        }

        // Generate Service Alert if validation failed
        if (!validationResult.isValid && validationResult.severity === 'CRITICAL') {
            const alert = ServiceChecklistEngine.generateServiceAlert(
                activeChecklist.id,
                activeChecklist.assetId,
                activeChecklist.assetName,
                item,
                response,
                activeChecklist.technicianName
            );

            if (alert) {
                setServiceAlerts(prev => [...prev, alert]);
                setActiveChecklist(prev => prev ? {
                    ...prev,
                    generatedAlerts: [...prev.generatedAlerts, alert]
                } : null);
            }
        }

        // Update checklist with response
        setActiveChecklist(prev => {
            if (!prev) return null;

            const existingIndex = prev.items.findIndex(r => r.itemId === itemId);
            let newItems;

            if (existingIndex >= 0) {
                // Update existing
                newItems = [...prev.items];
                newItems[existingIndex] = response;
            } else {
                // Add new
                newItems = [...prev.items, response];
            }

            // Recalculate progress
            const progress = ServiceChecklistEngine.calculateProgress(template, newItems);

            return {
                ...prev,
                items: newItems,
                progress: {
                    ...progress,
                    alertsGenerated: prev.generatedAlerts.length
                }
            };
        });
    };

    const addFieldNote = async (itemId: string, transcript: string, audioSrc?: string) => {
        if (!activeChecklist) return;

        // Auto-translate to German (placeholder)
        const transcriptDE = await ServiceChecklistEngine.translateFieldNotes(transcript, 'de');

        const note: FieldNote = {
            id: `note_${Date.now()}`,
            itemId,
            audioSrc,
            transcriptOriginal: transcript,
            transcriptDE,
            recordedAt: new Date().toISOString()
        };

        setActiveChecklist(prev => prev ? {
            ...prev,
            fieldNotes: [...prev.fieldNotes, note]
        } : null);
    };

    const completeChecklist = () => {
        if (!activeChecklist) return;

        setActiveChecklist(prev => prev ? {
            ...prev,
            completedAt: new Date().toISOString()
        } : null);

        // Save completed checklist to localStorage
        if (activeChecklist) {
            try {
                const savedChecklists = JSON.parse(localStorage.getItem('maintenanceChecklists') || '[]');
                savedChecklists.push({ ...activeChecklist, completedAt: new Date().toISOString() });
                localStorage.setItem('maintenanceChecklists', JSON.stringify(savedChecklists));
                console.log('[MaintenanceContext] Checklist saved to localStorage:', activeChecklist.id);
            } catch (error) {
                console.error('[MaintenanceContext] Failed to save checklist:', error);
            }
        }
    };

    /**
     * Create a new work order
     * Supports manual creation, AI triggers, and service alert escalation
     */
    const createWorkOrder = useCallback(async (
        order: Omit<WorkOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>
    ): Promise<WorkOrder> => {

        // Optimistic UI
        const tempId = `WO-${Date.now()}`;
        const newOrder: WorkOrder = {
            ...order,
            id: tempId,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setWorkOrders(prev => [...prev, newOrder]);

        // Supabase Insert
        const numeric = idAdapter.toNumber(order.assetId);
        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : order.assetId;

        const { data, error } = await supabase.from('work_orders').insert({
            asset_id: assetDbId,
            asset_name: order.assetName,
            component: order.component,
            description: order.description,
            priority: order.priority,
            status: 'PENDING',
            trigger_source: order.trigger
        }).select().single();

        if (error) {
            console.error("Failed to create WO in DB:", error);
            return newOrder;
        }

        return { ...newOrder, id: data.id };
    }, []);

    /**
     * Update existing work order status and metadata
     */
    const updateWorkOrder = useCallback(async (
        orderId: string,
        updates: Partial<Pick<WorkOrder, 'status' | 'assignedTechnician' | 'estimatedHoursToComplete'>>
    ): Promise<void> => {

        // Optimistic
        setWorkOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, ...updates, updatedAt: new Date() }
                    : order
            )
        );

        // DB Update
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.assignedTechnician) dbUpdates.assigned_technician = updates.assignedTechnician;
        if (updates.estimatedHoursToComplete) dbUpdates.estimated_hours = updates.estimatedHoursToComplete;
        dbUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('work_orders')
            .update(dbUpdates)
            .eq('id', orderId);

        if (error) console.error("Failed to update WO:", error);
    }, []);

    /**
     * Complete work order and record completion notes
     */
    const completeWorkOrder = useCallback(async (orderId: string, completionNotes: string): Promise<void> => {
        // Optimistic
        setWorkOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? {
                        ...order,
                        status: 'COMPLETED' as WorkOrderStatus,
                        completedAt: new Date(),
                        completionNotes,
                        updatedAt: new Date()
                    }
                    : order
            )
        );

        // DB Update
        const { error } = await supabase
            .from('work_orders')
            .update({
                status: 'COMPLETED',
                completion_notes: completionNotes,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) console.error("Failed to complete WO:", error);
    }, []);

    /**
     * Update operating hours for asset tracking
     * Used by AI Prediction Context for RUL calculations
     */
    const updateOperatingHours = useCallback((assetId: number, hours: number): void => {
        setOperatingHours(prev => ({ ...prev, [assetId]: hours }));
        console.log(`[MaintenanceContext] Operating hours updated: ${assetId} = ${hours}h`);
    }, []);

    const acknowledgeAlert = useCallback((alertId: string) => {
        setServiceAlerts(prev => prev.map(alert =>
            alert.id === alertId
                ? { ...alert, acknowledgedAt: new Date().toISOString() }
                : alert
        ));
    }, []);

    return (
        <MaintenanceContext.Provider value={{
            tasks,
            logs,
            operatingHours,
            workOrders,
            createLogEntry,
            validateEntry,
            getTasksByComponent,
            predictServiceDate,
            // Work Order Management
            createWorkOrder,
            updateWorkOrder,
            completeWorkOrder,
            updateOperatingHours,
            // ServiceChecklist
            activeChecklist,
            serviceAlerts,
            startChecklist,
            updateChecklistItem,
            addFieldNote,
            completeChecklist,
            acknowledgeAlert,
            isLoading
        }}>
            {children}
        </MaintenanceContext.Provider>
    );
};

export const useMaintenance = () => {
    const context = useContext(MaintenanceContext);
    if (!context) throw new Error("useMaintenance must be used within MaintenanceProvider");
    return context;
};
