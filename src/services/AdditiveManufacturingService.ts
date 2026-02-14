/**
 * AdditiveManufacturingService.ts
 * 
 * On-Site 3D Printing & Additive Manufacturing
 * Produces critical spare parts when logistics gap exists
 * Enables material sovereignty and supply chain independence
 */

export type PrintMaterial = 'TITANIUM_ALLOY' | 'STAINLESS_316L' | 'INCONEL_718' | 'BRONZE' | 'POLYMER' | 'STEEL' | 'PLA' | 'TPU' | 'NYLON_CF' | 'METAL_SLS';

export interface PrintableComponent {
    kksCode: string;
    componentName: string;
    cadModel: string; // Path to STEP/STL file
    material: PrintMaterial;
    printTime: number; // hours
    materialRequired: number; // kg
    postProcessing: string[];
    quality: 'PROTOTYPE' | 'FUNCTIONAL' | 'CRITICAL';
}

export interface PrintJob {
    jobId: string;
    component: PrintableComponent;
    trigger: 'LOGISTICS_GAP' | 'RUL_CRITICAL' | 'EMERGENCY' | 'SCHEDULED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'QUEUED' | 'PRINTING' | 'POST_PROCESS' | 'QUALITY_CHECK' | 'COMPLETED';
    startTime: number;
    estimatedCompletion: number;
    actualCompletion: number | null;
}

export class AdditiveManufacturingService {
    private static componentLibrary: Map<string, PrintableComponent> = new Map();
    private static printQueue: PrintJob[] = [];
    private static materialInventory: Map<string, number> = new Map(); // Material -> kg available

    /**
     * Initialize component library with critical parts
     */
    public static initializeLibrary(): void {
        console.log('[3D Print] Initializing printable component library...');

        // Bearings
        this.registerComponent({
            kksCode: '10LAA01',
            componentName: 'Guide Bearing Housing',
            cadModel: '/vault/cad/bearings/guide_bearing_housing.step',
            material: 'STAINLESS_316L',
            printTime: 18,
            materialRequired: 12.5,
            postProcessing: ['Heat treatment', 'CNC finishing', 'Surface polishing'],
            quality: 'CRITICAL'
        });

        // Seals
        this.registerComponent({
            kksCode: '10LBB01',
            componentName: 'Shaft Seal Ring',
            cadModel: '/vault/cad/seals/shaft_seal.step',
            material: 'BRONZE',
            printTime: 6,
            materialRequired: 2.3,
            postProcessing: ['Precision machining', 'Surface coating'],
            quality: 'FUNCTIONAL'
        });

        // Turbine components
        this.registerComponent({
            kksCode: '10PAA01',
            componentName: 'Guide Vane Actuator Link',
            cadModel: '/vault/cad/turbine/guide_vane_link.step',
            material: 'TITANIUM_ALLOY',
            printTime: 8,
            materialRequired: 1.8,
            postProcessing: ['Heat treatment', 'X-ray inspection'],
            quality: 'CRITICAL'
        });

        // Sensors brackets
        this.registerComponent({
            kksCode: '10TVB01-MOUNT',
            componentName: 'Vibration Sensor Mounting Bracket',
            cadModel: '/vault/cad/sensors/vib_sensor_bracket.step',
            material: 'STAINLESS_316L',
            printTime: 3,
            materialRequired: 0.5,
            postProcessing: ['Deburring'],
            quality: 'FUNCTIONAL'
        });

        // Initialize material inventory
        this.materialInventory.set('TITANIUM_ALLOY', 50); // 50 kg
        this.materialInventory.set('STAINLESS_316L', 100); // 100 kg
        this.materialInventory.set('INCONEL_718', 25); // 25 kg
        this.materialInventory.set('BRONZE', 40); // 40 kg
        this.materialInventory.set('POLYMER', 30); // 30 kg
        this.materialInventory.set('STEEL', 200); // 200 kg (Legacy fallback)
        this.materialInventory.set('PLA', 50); // Prototyping
        this.materialInventory.set('TPU', 40); // Seals/Gaskets
        this.materialInventory.set('NYLON_CF', 30); // Structural
        this.materialInventory.set('METAL_SLS', 100); // High-performance Sintering

        console.log(`[3D Print] ✅ ${this.componentLibrary.size} components registered`);
        console.log(`[3D Print] Material inventory initialized`);
    }

    /**
     * Register printable component
     */
    private static registerComponent(component: PrintableComponent): void {
        this.componentLibrary.set(component.kksCode, component);
    }

    /**
     * Trigger print requisition on logistics gap
     */
    public static checkLogisticsGap(
        componentId: string,
        logisticsGapDays: number,
        rulDays: number
    ): PrintJob | null {
        const component = this.componentLibrary.get(componentId);

        if (!component) {
            console.log(`[3D Print] Component ${componentId} not in printable library`);
            return null;
        }

        // Check if material is available
        const materialAvailable = this.materialInventory.get(component.material) || 0;
        if (materialAvailable < component.materialRequired) {
            console.log(`[3D Print] ⚠️ Insufficient material: ${component.material}`);
            console.log(`  Required: ${component.materialRequired} kg, Available: ${materialAvailable} kg`);
            return null;
        }

        // Decision logic
        let shouldPrint = false;
        let trigger: PrintJob['trigger'] = 'LOGISTICS_GAP'; // Default initializer
        let priority: PrintJob['priority'] = 'MEDIUM'; // Default initializer

        if (logisticsGapDays > 0 && rulDays < 90) {
            // Part will fail before it arrives
            shouldPrint = true;
            trigger = 'LOGISTICS_GAP';
            priority = logisticsGapDays > 30 ? 'CRITICAL' : 'HIGH';
        } else if (rulDays < 30) {
            // RUL critical, print proactively
            shouldPrint = true;
            trigger = 'RUL_CRITICAL';
            priority = 'HIGH';
        }

        if (!shouldPrint) {
            return null;
        }

        return this.createPrintJob(component, trigger, priority);
    }

    /**
     * Create print job
     */
    private static createPrintJob(
        component: PrintableComponent,
        trigger: PrintJob['trigger'],
        priority: PrintJob['priority']
    ): PrintJob {
        const jobId = `PRINT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const startTime = Date.now();
        const estimatedCompletion = startTime + component.printTime * 60 * 60 * 1000;

        const job: PrintJob = {
            jobId,
            component,
            trigger,
            priority,
            status: 'QUEUED',
            startTime,
            estimatedCompletion,
            actualCompletion: null
        };

        this.printQueue.push(job);

        console.log('\n' + '🖨️'.repeat(40));
        console.log('3D PRINT REQUISITION TRIGGERED');
        console.log('🖨️'.repeat(40));
        console.log(`Job ID: ${jobId}`);
        console.log(`Component: ${component.componentName} (${component.kksCode})`);
        console.log(`Trigger: ${trigger}`);
        console.log(`Priority: ${priority}`);
        console.log(`Material: ${component.material} (${component.materialRequired} kg)`);
        console.log(`Print Time: ${component.printTime} hours`);
        console.log(`Quality Level: ${component.quality}`);
        console.log('🖨️'.repeat(40) + '\n');

        // Start printing
        this.startPrinting(job);

        return job;
    }

    /**
     * Start printing process
     */
    private static startPrinting(job: PrintJob): void {
        job.status = 'PRINTING';

        console.log(`[3D Print] Starting print job ${job.jobId}...`);
        console.log(`  Loading CAD model: ${job.component.cadModel}`);
        console.log(`  Slicing for metal powder bed fusion`);
        console.log(`  Layer height: 30 microns`);
        console.log(`  Estimated layers: ${Math.floor(job.component.printTime * 1000)}`);

        // Deduct material from inventory
        const current = this.materialInventory.get(job.component.material) || 0;
        this.materialInventory.set(job.component.material, current - job.component.materialRequired);

        // Simulate printing (in production: actual printer control)
        setTimeout(() => {
            this.completePrinting(job);
        }, job.component.printTime * 1000); // Shortened for demo
    }

    /**
     * Complete printing and post-processing
     */
    private static completePrinting(job: PrintJob): void {
        job.status = 'POST_PROCESS';
        console.log(`[3D Print] Print complete for ${job.jobId}`);
        console.log(`  Post-processing: ${job.component.postProcessing.join(', ')}`);

        // Quality check
        setTimeout(() => {
            job.status = 'QUALITY_CHECK';
            console.log(`[3D Print] Quality inspection...`);

            setTimeout(() => {
                job.status = 'COMPLETED';
                job.actualCompletion = Date.now();

                console.log('\n' + '✅'.repeat(40));
                console.log(`COMPONENT READY: ${job.component.componentName}`);
                console.log('✅'.repeat(40));
                console.log(`Job ID: ${job.jobId}`);
                console.log(`Total time: ${((job.actualCompletion - job.startTime) / 1000 / 60).toFixed(0)} minutes`);
                console.log(`Status: APPROVED for installation`);
                console.log('✅'.repeat(40) + '\n');

                // Add to warehouse inventory
                console.log(`[3D Print] Component stored in Sovereign Vault`);
            }, 2000);
        }, 3000);
    }

    /**
     * Get manufacturing statistics
     */
    public static getStatistics(): {
        totalJobs: number;
        completed: number;
        inProgress: number;
        materialInventory: Map<string, number>;
        printableComponents: number;
    } {
        return {
            totalJobs: this.printQueue.length,
            completed: this.printQueue.filter(j => j.status === 'COMPLETED').length,
            inProgress: this.printQueue.filter(j => j.status === 'PRINTING' || j.status === 'POST_PROCESS').length,
            materialInventory: new Map(this.materialInventory),
            printableComponents: this.componentLibrary.size
        };
    }

    /**
     * Calculate material runway (how long can we print before running out)
     */
    public static calculateMaterialRunway(material: string): {
        material: string;
        available: number; // kg
        avgConsumptionPerPrint: number;
        estimatedPrints: number;
        runwayMonths: number;
    } {
        const available = this.materialInventory.get(material) || 0;

        // Calculate average consumption from library
        const componentsUsingMaterial = Array.from(this.componentLibrary.values())
            .filter(c => c.material === material);

        const avgConsumption = componentsUsingMaterial.length > 0
            ? componentsUsingMaterial.reduce((sum, c) => sum + c.materialRequired, 0) / componentsUsingMaterial.length
            : 0;

        const estimatedPrints = avgConsumption > 0 ? Math.floor(available / avgConsumption) : 0;
        const runwayMonths = estimatedPrints * 2; // Assume 1 print every 2 months

        return {
            material,
            available,
            avgConsumptionPerPrint: avgConsumption,
            estimatedPrints,
            runwayMonths
        };
    }
}

// Initialize library (DISABLED: Call manually to avoid blocking startup)
// AdditiveManufacturingService.initializeLibrary();
