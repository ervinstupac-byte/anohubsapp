import React, { createContext, useContext, useState, ReactNode } from 'react';
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
    pass: boolean; // Validation result
}

interface MaintenanceContextType {
    tasks: MaintenanceTask[];
    logs: LogEntry[];
    operatingHours: Record<string, number>;
    createLogEntry: (taskId: string, entry: Omit<LogEntry, 'id' | 'timestamp' | 'summaryDE' | 'pass'>) => void;
    validateEntry: (taskId: string, value: number) => { valid: boolean; message: string };
    getTasksByComponent: (componentId: string) => MaintenanceTask[];
    predictServiceDate: (assetId: string, threshold: number) => Date | null;

    // NEW: Service Checklist Functions
    activeChecklist: ActiveChecklist | null;
    serviceAlerts: ServiceAlert[];
    startChecklist: (turbineType: TurbineType, assetId: string, assetName: string, technicianName: string) => void;
    updateChecklistItem: (itemId: string, value: any) => void;
    addFieldNote: (itemId: string, transcript: string, audioSrc?: string) => void;
    completeChecklist: () => void;
    acknowledgeAlert: (alertId: string) => void;
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
    const [operatingHours, setOperatingHours] = useState<Record<string, number>>({ 'DEFAULT_ASSET': 1250 });

    // NEW: ServiceChecklist State
    const [activeChecklist, setActiveChecklist] = useState<ActiveChecklist | null>(null);
    const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>([]);

    const predictServiceDate = (assetId: string, threshold: number) => {
        const hours = operatingHours[assetId] || 0;
        const remaining = threshold - (hours % threshold);
        const dailyHours = 20; // Assumption
        const daysRemaining = remaining / dailyHours;
        const date = new Date();
        date.setDate(date.getDate() + daysRemaining);
        return date;
    };

    const validateEntry = (taskId: string, value: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.recommendedSpec === undefined) return { valid: true, message: 'OK' };

        // Custom logic per task type (Mocked)
        if (task.componentId === 'TURBINE' && value > task.recommendedSpec) {
            return { valid: false, message: `Vrijednost izvan tolerancije! (${value} > ${task.recommendedSpec})` };
        }

        return { valid: true, message: 'OK' };
    };

    const createLogEntry = (taskId: string, entry: Omit<LogEntry, 'id' | 'timestamp' | 'summaryDE' | 'pass'>) => {
        // Validation Check
        const validation = entry.measuredValue ? validateEntry(taskId, entry.measuredValue) : { valid: true };

        // Mock Translation Logic (Simple Map or static for prototype)
        const translations: Record<string, string> = {
            "Zategnuto na 450 Nm": "Auf 450 Nm angezogen",
            "Provjera zazora": "Spielprüfung",
            "Zamjena vijaka": "Schraubenaustausch"
        };
        const summaryDE = translations[entry.commentBS] || "Wartung durchgeführt.";

        const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
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

        // Update Task Status
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'COMPLETED' } : t
        ));
    };

    const getTasksByComponent = (id: string) => tasks.filter(t => t.componentId === id);

    // NEW: Service Checklist Functions
    const startChecklist = (turbineType: TurbineType, assetId: string, assetName: string, technicianName: string) => {
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

        // TODO: Save to database
        console.log('Checklist completed:', activeChecklist);
    };

    const acknowledgeAlert = (alertId: string) => {
        setServiceAlerts(prev => prev.map(alert =>
            alert.id === alertId
                ? { ...alert, acknowledgedAt: new Date().toISOString() }
                : alert
        ));
    };

    return (
        <MaintenanceContext.Provider value={{
            tasks,
            logs,
            operatingHours,
            createLogEntry,
            validateEntry,
            getTasksByComponent,
            predictServiceDate,
            // NEW: ServiceChecklist
            activeChecklist,
            serviceAlerts,
            startChecklist,
            updateChecklistItem,
            addFieldNote,
            completeChecklist,
            acknowledgeAlert
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
