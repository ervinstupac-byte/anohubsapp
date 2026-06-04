import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
import { SIMULATED_INITIAL_TASKS, getSimulatedTranslation } from '../services/DemoDataOracle';

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

export const protocols = [
    { id: 'P1', name: 'Bearing Inspection', threshold: 2000, description: 'Check for wear and temperature stability.' },
    { id: 'P2', name: 'Oil Analysis', threshold: 4000, description: 'Spectral analysis of lubricating oil.' },
    { id: 'P3', name: 'Major Overhaul', threshold: 10000, description: 'Full disassembly and component validation.' }
];

interface MaintenanceStore {
    tasks: MaintenanceTask[];
    logs: LogEntry[];
    operatingHours: Record<string, number>;
    workOrders: WorkOrder[];
    activeChecklist: ActiveChecklist | null;
    serviceAlerts: ServiceAlert[];
    isLoading: boolean;

    // Initialization
    fetchData: () => Promise<void>;
    fetchLogs: () => Promise<void>;
    fetchWorkOrders: () => Promise<void>;
    
    // Task & Log Management
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
    startChecklist: (turbineType: TurbineType, assetId: number, assetName: string, technicianName: string) => void;
    updateChecklistItem: (itemId: string, value: any) => void;
    addFieldNote: (itemId: string, transcript: string, audioSrc?: string) => void;
    completeChecklist: () => void;
    acknowledgeAlert: (alertId: string) => void;
}

const INITIAL_TASKS = SIMULATED_INITIAL_TASKS;

export const useMaintenanceStore = create<MaintenanceStore>()(
    persist(
        (set, get) => {
            // --- Internal helper functions ---
            const validateEntry = (taskId: string, value: number) => {
                const task = get().tasks.find(t => t.id === taskId);
                if (!task || task.recommendedSpec === undefined) return { valid: true, message: 'OK' };

                if (task.componentId === 'TURBINE' && value > task.recommendedSpec) {
                    return { valid: false, message: `Vrijednost izvan tolerancije! (${value} > ${task.recommendedSpec})` };
                }
                return { valid: true, message: 'OK' };
            };

            return {
                tasks: INITIAL_TASKS,
                logs: [],
                operatingHours: { 'DEFAULT_ASSET': 1250 },
                workOrders: [],
                activeChecklist: null,
                serviceAlerts: [],
                isLoading: true,

                fetchData: async () => {
                    set({ isLoading: true });
                    await Promise.all([get().fetchLogs(), get().fetchWorkOrders()]);
                    set({ isLoading: false });
                },

                fetchLogs: async () => {
                    const { data, error } = await supabase
                        .from('maintenance_logs')
                        .select('*')
                        .order('timestamp', { ascending: false });

                    if (error) {
                        console.error('Error fetching logs:', error);
                        return;
                    }

                    if (data) {
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
                        set({ logs: mappedLogs });
                    }
                },

                fetchWorkOrders: async () => {
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
                        set({ workOrders: mappedOrders });
                    }
                },

                predictServiceDate: (assetId: number, threshold: number) => {
                    const hours = get().operatingHours[assetId] || 0;
                    const remaining = threshold - (hours % threshold);
                    const dailyHours = 20;
                    const daysRemaining = remaining / dailyHours;
                    const date = new Date();
                    date.setDate(date.getDate() + daysRemaining);
                    return date;
                },

                validateEntry,

                createLogEntry: async (taskId: string, entry: Omit<LogEntry, 'id' | 'timestamp' | 'summaryDE' | 'pass'>) => {
                    const validation = entry.measuredValue ? validateEntry(taskId, entry.measuredValue) : { valid: true };
                    const summaryDE = getSimulatedTranslation(entry.commentBS);

                    // Optimistic Update
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
                    set(state => ({ logs: [newLog, ...state.logs] }));

                    // Persist to Supabase
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
                    set(state => ({
                        tasks: state.tasks.map(t =>
                            t.id === taskId ? { ...t, status: 'COMPLETED' } : t
                        )
                    }));
                },

                getTasksByComponent: (id: string) => get().tasks.filter(t => t.componentId === id),

                startChecklist: (turbineType: TurbineType, assetId: number, assetName: string, technicianName: string) => {
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
                    set({ activeChecklist: newChecklist });
                },

                updateChecklistItem: (itemId: string, value: any) => {
                    const state = get();
                    if (!state.activeChecklist) return;

                    const template = ServiceChecklistEngine.getTemplateForTurbine(state.activeChecklist.turbineType);
                    const item = ServiceChecklistEngine.getItemById(template, itemId);
                    if (!item) return;

                    const validationResult = ServiceChecklistEngine.validateChecklistItem(item, value);

                    const response: ChecklistItemResponse = {
                        itemId,
                        timestamp: new Date().toISOString(),
                        validationResult
                    };

                    if (item.type === 'BOOLEAN') {
                        response.booleanValue = Boolean(value);
                    } else if (item.type === 'MEASUREMENT') {
                        response.measurementValue = Number(value);
                    } else if (item.type === 'PHOTO') {
                        response.photos = value;
                    }

                    let newServiceAlerts = state.serviceAlerts;
                    let newGeneratedAlerts = state.activeChecklist.generatedAlerts;

                    if (!validationResult.isValid && validationResult.severity === 'CRITICAL') {
                        const alert = ServiceChecklistEngine.generateServiceAlert(
                            state.activeChecklist.id,
                            state.activeChecklist.assetId,
                            state.activeChecklist.assetName,
                            item,
                            response,
                            state.activeChecklist.technicianName
                        );

                        if (alert) {
                            newServiceAlerts = [...newServiceAlerts, alert];
                            newGeneratedAlerts = [...newGeneratedAlerts, alert];
                        }
                    }

                    const existingIndex = state.activeChecklist.items.findIndex(r => r.itemId === itemId);
                    let newItems;
                    if (existingIndex >= 0) {
                        newItems = [...state.activeChecklist.items];
                        newItems[existingIndex] = response;
                    } else {
                        newItems = [...state.activeChecklist.items, response];
                    }

                    const progress = ServiceChecklistEngine.calculateProgress(template, newItems);

                    set({
                        activeChecklist: {
                            ...state.activeChecklist,
                            items: newItems,
                            generatedAlerts: newGeneratedAlerts,
                            progress: {
                                ...progress,
                                alertsGenerated: newGeneratedAlerts.length
                            }
                        },
                        serviceAlerts: newServiceAlerts
                    });
                },

                addFieldNote: async (itemId: string, transcript: string, audioSrc?: string) => {
                    const state = get();
                    if (!state.activeChecklist) return;

                    const transcriptDE = await ServiceChecklistEngine.translateFieldNotes(transcript, 'de');
                    const note: FieldNote = {
                        id: `note_${Date.now()}`,
                        itemId,
                        audioSrc,
                        transcriptOriginal: transcript,
                        transcriptDE,
                        recordedAt: new Date().toISOString()
                    };

                    set({
                        activeChecklist: {
                            ...state.activeChecklist,
                            fieldNotes: [...state.activeChecklist.fieldNotes, note]
                        }
                    });
                },

                completeChecklist: () => {
                    const state = get();
                    if (!state.activeChecklist) return;

                    const completedChecklist = {
                        ...state.activeChecklist,
                        completedAt: new Date().toISOString()
                    };

                    set({ activeChecklist: completedChecklist });

                    // Save completed checklist to localStorage
                    try {
                        const savedChecklists = JSON.parse(localStorage.getItem('maintenanceChecklists') || '[]');
                        savedChecklists.push(completedChecklist);
                        localStorage.setItem('maintenanceChecklists', JSON.stringify(savedChecklists));
                        console.log('[MaintenanceStore] Checklist saved to localStorage:', completedChecklist.id);
                    } catch (error) {
                        console.error('[MaintenanceStore] Failed to save checklist:', error);
                    }
                },

                createWorkOrder: async (
                    order: Omit<WorkOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>
                ): Promise<WorkOrder> => {
                    const tempId = `WO-${Date.now()}`;
                    const newOrder: WorkOrder = {
                        ...order,
                        id: tempId,
                        status: 'PENDING',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    set(state => ({ workOrders: [...state.workOrders, newOrder] }));

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
                },

                updateWorkOrder: async (
                    orderId: string,
                    updates: Partial<Pick<WorkOrder, 'status' | 'assignedTechnician' | 'estimatedHoursToComplete'>>
                ): Promise<void> => {
                    set(state => ({
                        workOrders: state.workOrders.map(order =>
                            order.id === orderId
                                ? { ...order, ...updates, updatedAt: new Date() }
                                : order
                        )
                    }));

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
                },

                completeWorkOrder: async (orderId: string, completionNotes: string): Promise<void> => {
                    set(state => ({
                        workOrders: state.workOrders.map(order =>
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
                    }));

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
                },

                updateOperatingHours: (assetId: number, hours: number): void => {
                    set(state => ({ operatingHours: { ...state.operatingHours, [assetId]: hours } }));
                    console.log(`[MaintenanceStore] Operating hours updated: ${assetId} = ${hours}h`);
                },

                acknowledgeAlert: (alertId: string) => {
                    set(state => ({
                        serviceAlerts: state.serviceAlerts.map(alert =>
                            alert.id === alertId
                                ? { ...alert, acknowledgedAt: new Date().toISOString() }
                                : alert
                        )
                    }));
                }
            };
        },
        {
            name: 'maintenance-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ operatingHours: state.operatingHours })
        }
    )
);
