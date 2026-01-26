/**
 * KKSAssetTagger.ts
 * 
 * KKS (Kraftwerk-Kennzeichensystem) Nomenclature Implementation
 * German power plant identification system - industry standard
 * 
 * Format: [Plant][System][Component][Number]
 * Example: 10GCA01 = Plant 1, Generator (G), Cooling (C), Sensor A, #01
 */

export interface KKSTag {
    code: string; // e.g., "10GCA01"
    description: string;
    assetId: string; // Internal reference
    system: string; // G=Generator, T=Turbine, E=Electrical, etc.
    component: string; // Detailed component type
    location: string;
    datasheetUrl?: string;
}

export class KKSAssetTagger {
    private static registry: Map<string, KKSTag> = new Map();

    /**
     * Initialize KKS registry with all fleet sensors
     */
    public static initializeRegistry(): void {
        console.log('[KKS] Initializing asset registry...');

        // UNIT-1: Francis Turbine (Zakučac 1)
        this.registerSensor('10TVB01', 'Turbine Vibration Bearing 1', 'UNIT-1', 'T', 'Vibration', 'Upper Guide Bearing');
        this.registerSensor('10TVB02', 'Turbine Vibration Bearing 2', 'UNIT-1', 'T', 'Vibration', 'Lower Guide Bearing');
        this.registerSensor('10TTB01', 'Turbine Temperature Bearing 1', 'UNIT-1', 'T', 'Temperature', 'Upper Guide Bearing Oil');
        this.registerSensor('10TTB02', 'Turbine Temperature Bearing 2', 'UNIT-1', 'T', 'Temperature', 'Lower Guide Bearing Oil');
        this.registerSensor('10TPI01', 'Turbine Pressure Inlet', 'UNIT-1', 'T', 'Pressure', 'Spiral Case');
        this.registerSensor('10TPD01', 'Turbine Pressure Draft Tube', 'UNIT-1', 'T', 'Pressure', 'Draft Tube');
        this.registerSensor('10TGA01', 'Turbine Gate Opening', 'UNIT-1', 'T', 'Gate', 'Guide Vane Position');
        this.registerSensor('10GPA01', 'Generator Power Active', 'UNIT-1', 'G', 'Power', 'Terminals');
        this.registerSensor('10GPR01', 'Generator Power Reactive', 'UNIT-1', 'G', 'Power', 'Terminals');
        this.registerSensor('10GVT01', 'Generator Voltage', 'UNIT-1', 'G', 'Voltage', 'Terminals');
        this.registerSensor('10GFR01', 'Generator Frequency', 'UNIT-1', 'G', 'Frequency', 'Terminals');

        // UNIT-3: Kaplan Turbine (Peruća K1)
        this.registerSensor('30TBA01', 'Turbine Blade Angle', 'UNIT-3', 'T', 'Blade', 'Runner Servo Position');
        this.registerSensor('30THP01', 'Turbine Hub Pressure', 'UNIT-3', 'T', 'Pressure', 'Runner Hub Cavity');
        this.registerSensor('30TSM01', 'Turbine Servo Motor Position', 'UNIT-3', 'T', 'Servo', 'Blade Actuator');
        this.registerSensor('30TCE01', 'Turbine Conjugate Error', 'UNIT-3', 'T', 'Calculated', 'Efficiency Deviation');

        // UNIT-5: Pelton Turbine (Senj P1)
        this.registerSensor('50TNP01', 'Turbine Needle Position Nozzle 1', 'UNIT-5', 'T', 'Needle', 'Nozzle #1');
        this.registerSensor('50TNP02', 'Turbine Needle Position Nozzle 2', 'UNIT-5', 'T', 'Needle', 'Nozzle #2');
        this.registerSensor('50TNP03', 'Turbine Needle Position Nozzle 3', 'UNIT-5', 'T', 'Needle', 'Nozzle #3');
        this.registerSensor('50TPR01', 'Turbine Pressure Nozzle 1', 'UNIT-5', 'T', 'Pressure', 'Nozzle #1 Manifold');
        this.registerSensor('50TDF01', 'Turbine Deflector Position Nozzle 1', 'UNIT-5', 'T', 'Deflector', 'Jet Deflector #1');

        // UNIT-6: Banki-Michell (Lešće BM1)
        this.registerSensor('60TAV01', 'Turbine Air Valve Position', 'UNIT-6', 'T', 'Air Valve', 'Internal Ventilation');
        this.registerSensor('60TIP01', 'Turbine Internal Pressure', 'UNIT-6', 'T', 'Pressure', 'Runner Chamber');

        // Electrical/Breaker tags
        this.registerSensor('10ECB01', 'Electrical Circuit Breaker Generator', 'UNIT-1', 'E', 'Breaker', 'CB-GEN');
        this.registerSensor('10ECB02', 'Electrical Circuit Breaker Transformer', 'UNIT-1', 'E', 'Breaker', 'CB-TX');
        this.registerSensor('10ECB03', 'Electrical Circuit Breaker Grid', 'UNIT-1', 'E', 'Breaker', 'CB-GRID');

        console.log(`[KKS] Registry initialized with ${this.registry.size} tags`);
    }

    /**
     * Register a single sensor with KKS code
     */
    private static registerSensor(
        code: string,
        description: string,
        assetId: string,
        system: string,
        component: string,
        location: string
    ): void {
        const tag: KKSTag = {
            code,
            description,
            assetId,
            system,
            component,
            location,
            datasheetUrl: `/datasheets/${code}.pdf` // Simulated datasheet link
        };

        this.registry.set(code, tag);
    }

    /**
     * Get KKS tag by code
     */
    public static getTag(code: string): KKSTag | undefined {
        return this.registry.get(code);
    }

    /**
     * Get all tags for a specific asset
     */
    public static getAssetTags(assetId: string): KKSTag[] {
        return Array.from(this.registry.values()).filter(tag => tag.assetId === assetId);
    }

    /**
     * Search tags by component type
     */
    public static searchByComponent(component: string): KKSTag[] {
        return Array.from(this.registry.values()).filter(tag =>
            tag.component.toLowerCase().includes(component.toLowerCase())
        );
    }

    /**
     * Generate KKS tooltip content
     */
    public static generateTooltip(code: string): string {
        const tag = this.getTag(code);
        if (!tag) return `Unknown KKS: ${code}`;

        return `
KKS: ${tag.code}
Description: ${tag.description}
Asset: ${tag.assetId}
System: ${tag.system}
Component: ${tag.component}
Location: ${tag.location}
Datasheet: ${tag.datasheetUrl}
        `.trim();
    }

    /**
     * Export complete registry for documentation
     */
    public static exportRegistry(): KKSTag[] {
        return Array.from(this.registry.values());
    }
}

// Initialize on module load (DISABLED: Call manually to avoid blocking startup)
// KKSAssetTagger.initializeRegistry();
