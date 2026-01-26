/**
 * InspectionAnomalyLibrary.ts
 * 
 * Visual AI Defect Classifier
 * Library of known defect signatures (Cracks, Spalling, Corrosion, Objects).
 * Auto-classifies imagery from robots.
 */

export type DefectType = 'CRACK_CONCRETE' | 'SPALLING' | 'CORROSION_PITTING' | 'FOREIGN_OBJECT' | 'NONE';

export interface ClassificationResult {
    imageId: string;
    detectedType: DefectType;
    confidence: number; // 0-100%
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: { x: number; y: number; z: number };
}

export class InspectionAnomalyLibrary {

    /**
     * CLASSIFY IMAGE (Simulated AI Inference)
     */
    public static classifyImage(
        imageId: string,
        features: string[] // Mock features extracted from image
    ): ClassificationResult {

        let type: DefectType = 'NONE';
        let severity: ClassificationResult['severity'] = 'LOW';
        let confidence = 0;

        // Mock Inference Rules
        if (features.includes('linear_fracture')) {
            type = 'CRACK_CONCRETE';
            confidence = 88;
            severity = 'MEDIUM';
        } else if (features.includes('rust_color') && features.includes('rough_texture')) {
            type = 'CORROSION_PITTING';
            confidence = 92;
            severity = 'HIGH';
        } else if (features.includes('exposed_aggregate')) {
            type = 'SPALLING';
            confidence = 75;
            severity = 'MEDIUM';
        } else if (features.includes('unidentified_blob')) {
            type = 'FOREIGN_OBJECT';
            confidence = 60;
            severity = 'LOW'; // Review required
        } else {
            type = 'NONE';
            confidence = 99;
        }

        // Criticality Override
        if (type === 'CRACK_CONCRETE' && features.includes('growing')) {
            severity = 'CRITICAL';
        }

        return {
            imageId,
            detectedType: type,
            confidence,
            severity,
            location: { x: 10, y: 20, z: 5 } // Mock local coordinates
        };
    }

    public static getDefectDescription(type: DefectType): string {
        switch (type) {
            case 'CRACK_CONCRETE': return 'Structural fissure in concrete lining.';
            case 'SPALLING': return 'Surface flaking exposing aggregate/rebar.';
            case 'CORROSION_PITTING': return 'Localized chemical/oxidation attack on metal.';
            case 'FOREIGN_OBJECT': return 'Debris or obstruction in flow path.';
            default: return 'No anomalies detected.';
        }
    }
}
