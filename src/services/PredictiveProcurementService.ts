/**
 * PredictiveProcurementService.ts
 * 
 * Intelligent procurement based on Remaining Useful Life (RUL)
 * Triggers purchase requisitions before critical failures
 */

import { WarehouseIntegrationService, SparePart } from './WarehouseIntegrationService';

export interface ProcurementRequisition {
    requisitionId: string;
    componentId: string;
    part: SparePart;
    urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL';
    reason: string;
    rulDays: number; // Days until predicted failure
    logisticsGapDays: number; // leadTime - RUL (can be negative = late)
    estimatedFailureDate: number; // timestamp
    requestedQuantity: number;
    estimatedCost: number;
    createdAt: number;
}

export class PredictiveProcurementService {
    private static requisitions: Map<string, ProcurementRequisition> = new Map();

    /**
     * Check component RUL and trigger procurement if needed
     */
    public static checkComponentProcurement(
        componentId: string,
        rulDays: number,
        assetId: string
    ): ProcurementRequisition | null {
        const part = WarehouseIntegrationService.getPart(componentId);

        if (!part) {
            console.warn(`[Procurement] Component ${componentId} not found in inventory`);
            return null;
        }

        // Decision logic
        const stockQuantity = part.stockQuantity;
        const leadTimeDays = part.leadTimeDays;
        const logisticsGapDays = leadTimeDays - rulDays;

        // Trigger conditions
        const criticalStockout = rulDays < 30 && stockQuantity === 0;
        const urgentProcurement = rulDays < leadTimeDays && stockQuantity === 0;
        const routineProcurement = stockQuantity <= part.reorderPoint;

        if (criticalStockout || urgentProcurement) {
            return this.createRequisition(
                componentId,
                part,
                rulDays,
                criticalStockout ? 'CRITICAL' : 'URGENT',
                logisticsGapDays
            );
        } else if (routineProcurement) {
            return this.createRequisition(
                componentId,
                part,
                rulDays,
                'ROUTINE',
                logisticsGapDays
            );
        }

        return null;
    }

    /**
     * Create procurement requisition
     */
    private static createRequisition(
        componentId: string,
        part: SparePart,
        rulDays: number,
        urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL',
        logisticsGapDays: number
    ): ProcurementRequisition {
        const requisitionId = `REQ-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const estimatedFailureDate = Date.now() + rulDays * 24 * 60 * 60 * 1000;
        const requestedQuantity = Math.max(1, part.reorderPoint - part.stockQuantity + 1);

        let reason = '';
        if (urgency === 'CRITICAL') {
            reason = `CRITICAL: Component failure predicted in ${rulDays} days, ZERO stock available, ` +
                `lead time ${part.leadTimeDays} days. LOGISTICS GAP: ${Math.abs(logisticsGapDays)} days late!`;
        } else if (urgency === 'URGENT') {
            reason = `URGENT: RUL (${rulDays}d) less than lead time (${part.leadTimeDays}d), no stock available`;
        } else {
            reason = `Stock below reorder point (${part.stockQuantity} ≤ ${part.reorderPoint})`;
        }

        const requisition: ProcurementRequisition = {
            requisitionId,
            componentId,
            part,
            urgency,
            reason,
            rulDays,
            logisticsGapDays,
            estimatedFailureDate,
            requestedQuantity,
            estimatedCost: requestedQuantity * part.unitCost,
            createdAt: Date.now()
        };

        this.requisitions.set(requisitionId, requisition);

        console.log(`[Procurement] ${urgency} REQUISITION: ${requisitionId} for ${componentId}`);
        console.log(`  Reason: ${reason}`);

        return requisition;
    }

    /**
     * Scan all assets for procurement needs
     */
    public static scanFleet(): ProcurementRequisition[] {
        const requisitions: ProcurementRequisition[] = [];

        // UNIT-3 Kaplan Servo - Scheduled for Q2 2026 (approx 120 days)
        const servoReq = this.checkComponentProcurement('SERVO-BLADE-ACTUATOR', 120, 'UNIT-3');
        if (servoReq) requisitions.push(servoReq);

        // UNIT-5 Pelton Nozzle #3 - Maintenance Q1 2026 (approx 60 days)
        const nozzleReq = this.checkComponentProcurement('NOZZLE-NEEDLE-ASSEMBLY', 60, 'UNIT-5');
        if (nozzleReq) requisitions.push(nozzleReq);

        // UNIT-5 Pelton Runner Buckets - Based on erosion index (approx 540 days = 18 months)
        const bucketReq = this.checkComponentProcurement('RUNNER-BUCKET', 540, 'UNIT-5');
        if (bucketReq) requisitions.push(bucketReq);

        return requisitions;
    }

    /**
     * Get all requisitions
     */
    public static getAllRequisitions(): ProcurementRequisition[] {
        return Array.from(this.requisitions.values());
    }

    /**
     * Get critical requisitions
     */
    public static getCriticalRequisitions(): ProcurementRequisition[] {
        return Array.from(this.requisitions.values()).filter(r => r.urgency === 'CRITICAL');
    }
}
