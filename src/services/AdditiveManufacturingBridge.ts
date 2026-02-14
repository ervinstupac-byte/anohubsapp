/**
 * AdditiveManufacturingBridge.ts
 * 
 * 3D Printing & Digital Blueprint Manager
 * Connects to on-site or local AM hubs to print spares on demand.
 * Eliminates lead times for printable components (seals, bushings, impellers).
 */

import { PrintMaterial } from './AdditiveManufacturingService';

export interface PrintJob {
    jobId: string;
    partId: string;
    material: PrintMaterial;
    printTimeHours: number;
    status: 'QUEUED' | 'PRINTING' | 'COMPLETED' | 'FAILED';
    progressPct: number;
}

export class AdditiveManufacturingBridge {
    private static printQueue: PrintJob[] = [];

    /**
     * CHECK AND TRIGGER PRINT
     * If wear > threshold and part is printable, queue it.
     */
    public static checkWearAndPrint(
        partId: string,
        wearLevelPct: number, // 0-100%
        isPrintable: boolean,
        stockCount: number
    ): PrintJob | null {

        const WEAR_THRESHOLD = 70.0;

        // If worn AND no stock (or low stock strategy), print immediately
        if (isPrintable && wearLevelPct > WEAR_THRESHOLD && stockCount < 1) {
            return this.queuePrint(partId);
        }

        return null;
    }

    private static queuePrint(partId: string): PrintJob {
        // Mock job creation
        const job: PrintJob = {
            jobId: `PRT-${Date.now().toString().slice(-4)}`,
            partId,
            material: 'TPU', // Default for seals
            printTimeHours: 12,
            status: 'QUEUED',
            progressPct: 0
        };

        this.printQueue.push(job);
        console.log(`[AdditiveBridge] 🖨️ Queued print for ${partId}. Material: ${job.material}`);

        return job;
    }

    public static getQueue(): PrintJob[] {
        return this.printQueue;
    }
}
