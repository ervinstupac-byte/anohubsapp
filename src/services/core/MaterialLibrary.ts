/**
 * MaterialLibrary.ts
 * 
 * NC-10100: Material Calibration
 * Registry of standard engineering materials used in penstock and turbine construction.
 * Defines density, yield strength, and elastic modulus for structural calculations.
 */

export interface MaterialProperties {
    name: string;
    density: number; // kg/m³
    yieldStrengthMPa: number; // MPa
    elasticModulusGPa: number; // GPa
    description: string;
}

export const MATERIAL_LIBRARY: Record<string, MaterialProperties> = {
    S235: {
        name: 'S235 Structural Steel',
        density: 7850,
        yieldStrengthMPa: 235,
        elasticModulusGPa: 210,
        description: 'Standard structural steel for general applications.'
    },
    // Alias for generic legacy references
    STEEL: {
        name: 'Standard Steel (Generic)',
        density: 7850,
        yieldStrengthMPa: 235,
        elasticModulusGPa: 210,
        description: 'Generic steel fallback (mapped to S235 properties).'
    },
    S355: {
        name: 'S355 High-Strength Steel',
        density: 7850,
        yieldStrengthMPa: 355,
        elasticModulusGPa: 210,
        description: 'High-strength low-alloy steel for critical load-bearing structures.'
    },
    STAINLESS_304: {
        name: 'Stainless Steel 304',
        density: 8000,
        yieldStrengthMPa: 205,
        elasticModulusGPa: 193,
        description: 'Austenitic stainless steel with excellent corrosion resistance.'
    },
    STAINLESS_316: {
        name: 'Stainless Steel 316',
        density: 8000,
        yieldStrengthMPa: 240,
        elasticModulusGPa: 193,
        description: 'Molybdenum-alloyed stainless steel for harsh marine/chloride environments.'
    }
} as const;

export type MaterialKey = keyof typeof MATERIAL_LIBRARY;

export class MaterialService {
    /**
     * Get material properties by ID
     */
    static getMaterial(key: MaterialKey | string): MaterialProperties {
        const mat = MATERIAL_LIBRARY[key as MaterialKey];
        if (!mat) {
            console.warn(`Material '${key}' not found, defaulting to S235`);
            return MATERIAL_LIBRARY.S235;
        }
        return mat;
    }

    /**
     * Get Yield Strength in MPa
     */
    static getYieldStrength(key: MaterialKey | string): number {
        return this.getMaterial(key).yieldStrengthMPa;
    }
}
