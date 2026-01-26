/**
 * WarehouseIntegrationService.ts
 * 
 * Spare Parts Inventory Management
 * Maps critical components to stock quantities and supplier information
 */

export interface SparePart {
    componentId: string;
    partNumber: string;
    description: string;
    assetId: string; // Which unit this part is for
    category: 'BEARING' | 'SEAL' | 'NOZZLE' | 'BLADE' | 'VALVE' | 'SENSOR' | 'OTHER';
    stockQuantity: number;
    reorderPoint: number; // Minimum stock level before reorder
    leadTimeDays: number; // Shipping time from supplier
    unitCost: number; // EUR
    supplierName: string;
    supplierPartNumber: string;
    criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    lastRestocked: number; // timestamp
}

export class WarehouseIntegrationService {
    private static inventory: Map<string, SparePart> = new Map();

    /**
     * Initialize warehouse inventory
     */
    public static initializeInventory(): void {
        console.log('[Warehouse] Initializing spare parts inventory...');

        // UNIT-1 & UNIT-2: Francis Turbines
        this.registerPart({
            componentId: 'BEARING-GUIDE-UPPER',
            partNumber: 'FRA-BRG-001',
            description: 'Guide Bearing Upper (Francis)',
            assetId: 'UNIT-1',
            category: 'BEARING',
            stockQuantity: 2,
            reorderPoint: 1,
            leadTimeDays: 45,
            unitCost: 25000,
            supplierName: 'SKF Croatia',
            supplierPartNumber: 'SKF-H3138',
            criticalityLevel: 'HIGH',
            lastRestocked: Date.now() - 180 * 24 * 60 * 60 * 1000 // 180 days ago
        });

        this.registerPart({
            componentId: 'SEAL-SHAFT-MAIN',
            partNumber: 'FRA-SEAL-002',
            description: 'Main Shaft Seal (Francis)',
            assetId: 'UNIT-1',
            category: 'SEAL',
            stockQuantity: 4,
            reorderPoint: 2,
            leadTimeDays: 30,
            unitCost: 8500,
            supplierName: 'Rade Končar',
            supplierPartNumber: 'RK-SEAL-F85',
            criticalityLevel: 'MEDIUM',
            lastRestocked: Date.now() - 90 * 24 * 60 * 60 * 1000
        });

        // UNIT-3: Kaplan with servo issues
        this.registerPart({
            componentId: 'SERVO-BLADE-ACTUATOR',
            partNumber: 'KAP-SERVO-003',
            description: 'Blade Angle Servo Motor (Kaplan)',
            assetId: 'UNIT-3',
            category: 'OTHER',
            stockQuantity: 0, // CRITICAL: No stock!
            reorderPoint: 1,
            leadTimeDays: 90, // Long lead time!
            unitCost: 45000,
            supplierName: 'Voith Hydro',
            supplierPartNumber: 'VH-SERVO-K68',
            criticalityLevel: 'CRITICAL',
            lastRestocked: 0 // Never restocked
        });

        this.registerPart({
            componentId: 'BEARING-HUB',
            partNumber: 'KAP-BRG-004',
            description: 'Runner Hub Bearing (Kaplan)',
            assetId: 'UNIT-3',
            category: 'BEARING',
            stockQuantity: 1,
            reorderPoint: 1,
            leadTimeDays: 60,
            unitCost: 35000,
            supplierName: 'SKF Croatia',
            supplierPartNumber: 'SKF-K2940',
            criticalityLevel: 'HIGH',
            lastRestocked: Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year ago
        });

        // UNIT-5: Pelton
        this.registerPart({
            componentId: 'NOZZLE-NEEDLE-ASSEMBLY',
            partNumber: 'PEL-NOZ-005',
            description: 'Needle Valve Assembly Nozzle #3 (Pelton)',
            assetId: 'UNIT-5',
            category: 'NOZZLE',
            stockQuantity: 0, // CRITICAL: No stock for water hammer issue!
            reorderPoint: 1,
            leadTimeDays: 120, // Very long lead time
            unitCost: 62000,
            supplierName: 'Litostroj Power',
            supplierPartNumber: 'LP-NEEDLE-P78-03',
            criticalityLevel: 'CRITICAL',
            lastRestocked: 0
        });

        this.registerPart({
            componentId: 'RUNNER-BUCKET',
            partNumber: 'PEL-RUN-006',
            description: 'Pelton Runner Bucket (Replacement Set)',
            assetId: 'UNIT-5',
            category: 'OTHER',
            stockQuantity: 0,
            reorderPoint: 1,
            leadTimeDays: 180, // 6 months!
            unitCost: 125000,
            supplierName: 'Litostroj Power',
            supplierPartNumber: 'LP-BUCKET-P78-SET',
            criticalityLevel: 'CRITICAL',
            lastRestocked: 0
        });

        // UNIT-6: Banki-Michell
        this.registerPart({
            componentId: 'AIR-VALVE-CONTROL',
            partNumber: 'BAN-VALVE-007',
            description: 'Air Regulation Valve (Banki-Michell)',
            assetId: 'UNIT-6',
            category: 'VALVE',
            stockQuantity: 1,
            reorderPoint: 1,
            leadTimeDays: 75,
            unitCost: 12000,
            supplierName: 'Local Supplier',
            supplierPartNumber: 'BM-AIR-VALVE-92',
            criticalityLevel: 'MEDIUM',
            lastRestocked: Date.now() - 200 * 24 * 60 * 60 * 1000
        });

        console.log(`[Warehouse] Inventory initialized with ${this.inventory.size} parts`);
    }

    /**
     * Register a spare part
     */
    private static registerPart(part: SparePart): void {
        this.inventory.set(part.componentId, part);
    }

    /**
     * Get part by component ID
     */
    public static getPart(componentId: string): SparePart | undefined {
        return this.inventory.get(componentId);
    }

    /**
     * Get all parts for a specific asset
     */
    public static getAssetParts(assetId: string): SparePart[] {
        return Array.from(this.inventory.values()).filter(part => part.assetId === assetId);
    }

    /**
     * Check if part is in stock
     */
    public static isInStock(componentId: string): boolean {
        const part = this.inventory.get(componentId);
        return part ? part.stockQuantity > 0 : false;
    }

    /**
     * Get parts below reorder point
     */
    public static getPartsNeedingReorder(): SparePart[] {
        return Array.from(this.inventory.values()).filter(
            part => part.stockQuantity <= part.reorderPoint
        );
    }

    /**
     * Get critical parts with zero stock
     */
    public static getCriticalStockouts(): SparePart[] {
        return Array.from(this.inventory.values()).filter(
            part => part.stockQuantity === 0 && part.criticalityLevel === 'CRITICAL'
        );
    }

    /**
     * Update stock quantity
     */
    public static updateStock(componentId: string, newQuantity: number): void {
        const part = this.inventory.get(componentId);
        if (part) {
            part.stockQuantity = newQuantity;
            if (newQuantity > part.reorderPoint) {
                part.lastRestocked = Date.now();
            }
            console.log(`[Warehouse] ${componentId} stock updated to ${newQuantity}`);
        }
    }

    /**
     * Calculate total inventory value
     */
    public static getTotalInventoryValue(): number {
        return Array.from(this.inventory.values()).reduce(
            (sum, part) => sum + (part.stockQuantity * part.unitCost),
            0
        );
    }
}

// Initialize inventory on module load
// WarehouseIntegrationService.initializeInventory(); // DISABLED: Call manually to avoid blocking startup
