/**
 * Document Tagging & Discovery System
 * Smart librarian that matches documents to components
 */

export interface DocumentMetadata {
    // Core identification
    id: string;
    fileName: string;
    category: DocumentCategory;

    // The Smart Stickers! 🏷️
    // These tags tell the librarian which components need this document
    applicableToComponentTypes: string[];  // ["Shaft_Seal", "Thrust_Bearing_SKF_*"]
    applicableToAssetPaths: string[];      // ["*/Turbine/Shaft/ShaftSeal", "*/Generator/Bearings/*"]
    turbineTypes: string[];                // ["francis", "kaplan"] - which turbine families
    turbineVariants: string[];             // ["horizontal", "vertical"]

    // Additional filters
    manufacturer?: string;                 // "EagleBurgmann", "SKF"
    powerRangeMW?: { min: number; max: number };
    headRangeM?: { min: number; max: number };

    // Document properties
    language: string;
    version: string;
    publishedDate: string;
    lastUpdated: string;
    fileType: 'PDF' | 'DOCX' | 'VIDEO' | 'IMAGE';
    fileSizeKB: number;
    storagePath: string;  // Supabase storage path

    // Relevance scoring
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    mandatory?: boolean;  // Required reading before maintenance
}

export enum DocumentCategory {
    SOP = 'SOP',                           // Standard Operating Procedure
    MAINTENANCE_MANUAL = 'MAINTENANCE_MANUAL',
    INSTALLATION_GUIDE = 'INSTALLATION_GUIDE',
    TROUBLESHOOTING = 'TROUBLESHOOTING',
    SAFETY_PROCEDURE = 'SAFETY_PROCEDURE',
    TECHNICAL_DRAWING = 'TECHNICAL_DRAWING',
    SPARE_PARTS_CATALOG = 'SPARE_PARTS_CATALOG',
    WARRANTY_INFO = 'WARRANTY_INFO',
    TRAINING_MATERIAL = 'TRAINING_MATERIAL'
}

/**
 * Example: Tagging the Shaft Seal Replacement PDF
 * 
 * 🎯 GOAL: Make this PDF appear ONLY when the ant clicks on Shaft Seal
 */
export const EXAMPLE_SHAFT_SEAL_DOCUMENT: DocumentMetadata = {
    id: 'DOC_854',
    fileName: 'Francis_Horizontal_Seal_Replacement.pdf',
    category: DocumentCategory.MAINTENANCE_MANUAL,

    // 🏷️ THE MAGIC STICKERS!

    // Sticker #1: Component Type Match
    applicableToComponentTypes: [
        'Shaft_Seal',                    // Exact match
        'Mechanical_Face_Seal',          // Specific seal type
        'EagleBurgmann_MG12'             // Manufacturer model
    ],

    // Sticker #2: Asset Path Match (with wildcards!)
    applicableToAssetPaths: [
        '*/Turbine/Shaft/ShaftSeal',     // Any unit, but must be THIS exact path
        'Unit_01/Turbine/Shaft/ShaftSeal' // Also exact unit match (higher priority)
    ],

    // Sticker #3: Turbine Family
    turbineTypes: ['francis'],         // Only Francis turbines
    turbineVariants: ['horizontal'],   // Only horizontal mounting

    // Sticker #4: Manufacturer
    manufacturer: 'EagleBurgmann',

    // Sticker #5: Size Range
    powerRangeMW: { min: 1, max: 10 }, // Applicable to 1-10 MW machines
    headRangeM: { min: 40, max: 150 }, // Head range for horizontal Francis

    // Document details
    language: 'en',
    version: '3.2',
    publishedDate: '2023-06-15',
    lastUpdated: '2024-01-10',
    fileType: 'PDF',
    fileSizeKB: 4500,
    storagePath: 'engineering-docs/francis/seals/Francis_Horizontal_Seal_Replacement_v3.2.pdf',

    priority: 'CRITICAL',
    mandatory: true  // Must read before touching the seal!
};

/**
 * Example: General bearing maintenance guide (broader match)
 */
export const EXAMPLE_BEARING_GUIDE: DocumentMetadata = {
    id: 'DOC_112',
    fileName: 'SKF_Bearing_Maintenance_Guide.pdf',
    category: DocumentCategory.MAINTENANCE_MANUAL,

    // Broader matching - applies to ALL SKF bearings
    applicableToComponentTypes: [
        'Thrust_Bearing_SKF_*',    // Wildcard - any SKF thrust bearing
        'Guide_Bearing_SKF_*',      // Any SKF guide bearing
        '*_Bearing'                 // Really broad - any bearing
    ],

    applicableToAssetPaths: [
        '*/Generator/Bearings/*',   // Anywhere under Generator/Bearings
        '*/Turbine/Bearings/*'      // Or under Turbine/Bearings
    ],

    turbineTypes: ['francis', 'pelton', 'kaplan'], // Universal!
    turbineVariants: ['horizontal', 'vertical'],

    manufacturer: 'SKF',

    language: 'en',
    version: '8.1',
    publishedDate: '2022-03-01',
    lastUpdated: '2023-11-20',
    fileType: 'PDF',
    fileSizeKB: 8200,
    storagePath: 'engineering-docs/universal/bearings/SKF_Maintenance_Guide_v8.1.pdf',

    priority: 'HIGH',
    mandatory: false
};

/**
 * The Smart Matching Algorithm
 * Scores documents by relevance to a component
 */
export interface DocumentMatch {
    document: DocumentMetadata;
    relevanceScore: number;
    matchReasons: string[];
}

export class DocumentDiscoveryService {
    /**
     * Find all documents relevant to a specific component
     * 
     * Example: When ant clicks "Unit_01/Turbine/Shaft/ShaftSeal"
     */
    static findDocumentsForComponent(
        componentPath: string,
        componentType: string,
        turbineType: string,
        variant: string,
        allDocuments: DocumentMetadata[]
    ): DocumentMatch[] {
        const matches: DocumentMatch[] = [];

        for (const doc of allDocuments) {
            const match = this.scoreDocument(doc, componentPath, componentType, turbineType, variant);

            if (match.relevanceScore > 0) {
                matches.push(match);
            }
        }

        // Sort by relevance (highest first)
        return matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Calculate relevance score for a single document
     */
    private static scoreDocument(
        doc: DocumentMetadata,
        componentPath: string,
        componentType: string,
        turbineType: string,
        variant: string
    ): DocumentMatch {
        let score = 0;
        const reasons: string[] = [];

        // === EXACT PATH MATCH (Highest Priority) ===
        if (doc.applicableToAssetPaths.includes(componentPath)) {
            score += 100;
            reasons.push(`Exact path match: ${componentPath}`);
        }

        // === WILDCARD PATH MATCH ===
        for (const pattern of doc.applicableToAssetPaths) {
            if (this.matchesWildcard(componentPath, pattern)) {
                score += 75;
                reasons.push(`Path pattern match: ${pattern}`);
                break;
            }
        }

        // === COMPONENT TYPE MATCH ===
        for (const type of doc.applicableToComponentTypes) {
            if (this.matchesWildcard(componentType, type)) {
                score += 50;
                reasons.push(`Component type match: ${type}`);
                break;
            }
        }

        // === TURBINE TYPE MATCH ===
        if (doc.turbineTypes.includes(turbineType)) {
            score += 30;
            reasons.push(`Turbine type: ${turbineType}`);
        }

        // === VARIANT MATCH ===
        if (doc.turbineVariants.includes(variant)) {
            score += 20;
            reasons.push(`Variant: ${variant}`);
        }

        // === PRIORITY BONUS ===
        if (doc.priority === 'CRITICAL') score += 15;
        if (doc.mandatory) score += 10;

        // === RECENCY BONUS ===
        const ageMonths = this.getDocumentAgeMonths(doc.lastUpdated);
        if (ageMonths < 6) {
            score += 5;
            reasons.push('Recently updated');
        }

        return {
            document: doc,
            relevanceScore: score,
            matchReasons: reasons
        };
    }

    /**
     * Wildcard matching helper
     * "STAR/Generator..." matches "Unit_01/Generator..."
      */
    private static matchesWildcard(value: string, pattern: string): boolean {
        const regexPattern = pattern
            .replace(/\*/g, '.*')  // * becomes .*
            .replace(/\//g, '\\/'); // Escape forward slashes

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(value);
    }

    private static getDocumentAgeMonths(lastUpdated: string): number {
        const now = new Date();
        const updated = new Date(lastUpdated);
        return (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24 * 30);
    }
}

/**
 * EXAMPLE USAGE:
 * 
 * ```typescript
 * // Ant clicks on Thrust Bearing
 * const componentPath = "Unit_01/Generator/Bearings/ThrustBearing";
 * const componentType = "Thrust_Bearing_SKF_NN3020";
 * 
 * const relevantDocs = DocumentDiscoveryService.findDocumentsForComponent(
 *   componentPath,
 *   componentType,
 *   'francis',
 *   'horizontal',
 *   [EXAMPLE_SHAFT_SEAL_DOCUMENT, EXAMPLE_BEARING_GUIDE, ...]
 * );
 * 
 * // Results:
 * // 1. SKF_Bearing_Maintenance_Guide.pdf (Score: 175)
 * //    - Path pattern match: *\/Generator/Bearings/*
 * //    - Component type match: Thrust_Bearing_SKF_*
 * //    - Turbine type: francis
 * // 
 * // 2. Francis_Horizontal_Seal_Replacement.pdf (Score: 30)
 * //    - Turbine type: francis
 * //    (Lower score because it's for seals, not bearings)
 * ```
 */
