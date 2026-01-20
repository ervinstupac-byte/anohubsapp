import { InspectionImage } from '../services/StrategicPlanningService';

// Database Row Types (Snake Case)
export interface MaintenanceLogDB {
    id: string;
    task_id: string;
    technician: string;
    comment_bs: string;
    summary_de: string;
    measured_value?: number;
    pass: boolean;
    timestamp: string;
    proof_image_url?: string;
    metadata?: any;
}

export interface WorkOrderDB {
    id: string;
    asset_id: number;
    asset_name: string;
    component: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    trigger_source: string;
    assigned_technician?: string;
    estimated_hours?: number;
    completion_notes?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

// Mapper Functions
export const mapLogFromDB = (row: MaintenanceLogDB) => ({
    id: row.id,
    taskId: row.task_id,
    technician: row.technician,
    commentBS: row.comment_bs,
    summaryDE: row.summary_de,
    measuredValue: row.measured_value,
    pass: row.pass,
    timestamp: new Date(row.timestamp),
    // Reconstruct rudimentary proof image object if url exists
    proofImage: row.proof_image_url ? {
        id: 'img-' + row.id,
        src: row.proof_image_url,
        caption: 'Database Image'
    } as any : undefined
});

export const mapWorkOrderFromDB = (row: WorkOrderDB) => ({
    id: row.id,
    assetId: row.asset_id,
    assetName: row.asset_name,
    component: row.component,
    description: row.description,
    priority: row.priority,
    status: row.status,
    trigger: row.trigger_source as any,
    assignedTechnician: row.assigned_technician,
    estimatedHoursToComplete: row.estimated_hours,
    completionNotes: row.completion_notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined
});
