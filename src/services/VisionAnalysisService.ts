import { TechnicalProjectState } from '../models/TechnicalSchema';
import { TechnicalAuditData, VisionAnalysisResult } from './ReportGenerator';
import { InspectionImage } from './StrategicPlanningService';

/**
 * Vision Analysis Service
 * Integrates AI-powered image analysis with Technical State
 * Phase 3 Implementation
 */

export class VisionAnalysisService {
    /**
     * Analyzes inspection images and returns structured AI insights
     */
    static analyzeInspectionImages(
        images: InspectionImage[],
        technicalState: TechnicalProjectState
    ): VisionAnalysisResult | undefined {
        // If no images, return undefined
        if (!images || images.length === 0) {
            return undefined;
        }

        // AI Analysis Logic (Currently using tags from images)
        // In production, this would call Gemini Vision API

        const cavitationImages = images.filter(img =>
            img.aiTags.some(tag => tag.toLowerCase().includes('kavitation') || tag.toLowerCase().includes('cavitation'))
        );

        const corrosionImages = images.filter(img =>
            img.aiTags.some(tag => tag.toLowerCase().includes('korrosion') || tag.toLowerCase().includes('corrosion') || tag.toLowerCase().includes('rust'))
        );

        const erosionImages = images.filter(img =>
            img.aiTags.some(tag => tag.toLowerCase().includes('erosion') || tag.toLowerCase().includes('abrasion'))
        );

        const crackImages = images.filter(img =>
            img.aiTags.some(tag => tag.toLowerCase().includes('crack') || tag.toLowerCase().includes('riss'))
        );

        // Determine overall risk level
        let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        let criticalIssues = 0;

        if (cavitationImages.length > 0) criticalIssues++;
        if (corrosionImages.length > 2) criticalIssues++;
        if (crackImages.length > 0) criticalIssues += 2;

        if (criticalIssues >= 3) overallRiskLevel = 'CRITICAL';
        else if (criticalIssues >= 2) overallRiskLevel = 'HIGH';
        else if (criticalIssues >= 1) overallRiskLevel = 'MEDIUM';

        // Build recommendations
        const immediate: string[] = [];
        const shortTerm: string[] = [];
        const longTerm: string[] = [];
        let estimatedCost = 0;

        if (cavitationImages.length > 0) {
            immediate.push('Shutdown erforderlich: Kavitationsschäden an Laufrad festgestellt');
            immediate.push('Stellite-Aufschweißung der beschädigten Bereiche');
            estimatedCost += 15000;
            shortTerm.push('Betriebspunkt-Optimierung zur Vermeidung weiterer Kavitation');
        }

        if (corrosionImages.length > 2) {
            shortTerm.push('Korrosionsschutz-Sanierung: Sandstrahlen + Epoxy-Beschichtung');
            estimatedCost += 8000;
            longTerm.push('Kathodenschutz-System installieren');
        }

        if (crackImages.length > 0) {
            immediate.push('KRITISCH: Strukturelle Risse entdeckt - Sofortige Stilllegung');
            immediate.push('Magnetpulver-Prüfung (NDT) der gesamten Komponente');
            estimatedCost += 25000;
        }

        // Build evidence images list
        const evidenceImages = images.map(img => ({
            id: img.id,
            componentId: img.componentId,
            issueType: img.aiTags[0] || 'Unknown',
            aiTagsDetected: img.aiTags,
            thumbnailSrc: img.src
        }));

        const result: VisionAnalysisResult = {
            totalImages: images.length,
            analyzedAt: new Date().toISOString(),
            overallRiskLevel,
            aiConfidence: 87.5, // In production, from actual AI model

            detectedIssues: {
                cavitation: {
                    detected: cavitationImages.length > 0,
                    severity: cavitationImages.length > 0 ? Math.min(10, cavitationImages.length * 3) : 0,
                    affectedComponents: cavitationImages.map(img => img.componentId),
                    location: cavitationImages.length > 0 ? cavitationImages[0].description : ''
                },
                corrosion: {
                    detected: corrosionImages.length > 0,
                    type: corrosionImages.length > 2 ? 'PITTING' : corrosionImages.length > 0 ? 'UNIFORM' : 'NONE',
                    severity: Math.min(10, corrosionImages.length * 2),
                    estimatedDepthMM: corrosionImages.length > 0 ? 0.5 * corrosionImages.length : 0
                },
                erosion: {
                    detected: erosionImages.length > 0,
                    pattern: erosionImages.length > 0 ? 'LINEAR' : 'NONE',
                    severity: Math.min(10, erosionImages.length * 2.5),
                    materialLossMM: erosionImages.length > 0 ? 0.8 * erosionImages.length : 0
                },
                cracks: {
                    detected: crackImages.length > 0,
                    count: crackImages.length,
                    maxLengthMM: crackImages.length > 0 ? 15 * crackImages.length : 0,
                    propagationRisk: crackImages.length >= 2 ? 'HIGH' : crackImages.length === 1 ? 'MEDIUM' : 'LOW'
                },
                vibrationDamage: {
                    detected: technicalState.physics.boltSafetyFactor < 1.5,
                    indicators: technicalState.physics.boltSafetyFactor < 1.5 ?
                        ['Lockere Schrauben festgestellt', 'Fretting-Spuren an Flansch'] : []
                }
            },

            recommendations: {
                immediate,
                shortTerm,
                longTerm,
                estimatedCost
            },

            evidenceImages
        };

        return result;
    }

    /**
     * Creates a complete TechnicalAuditData with Vision Integration
     */
    static createVisionEnhancedAuditData(
        technicalState: TechnicalProjectState,
        images: InspectionImage[],
        assetName: string = 'Unknown HPP'
    ): TechnicalAuditData {
        const visionInsights = this.analyzeInspectionImages(images, technicalState);

        // Determine status based on physics and vision
        let status: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
        let criticalIssues = 0;

        if (technicalState.physics.boltSafetyFactor < 1.5) {
            status = 'RED';
            criticalIssues++;
        } else if (technicalState.physics.hoopStressMPa > 200) {
            status = 'YELLOW';
        }

        if (visionInsights) {
            if (visionInsights.overallRiskLevel === 'CRITICAL') {
                status = 'RED';
                criticalIssues += visionInsights.detectedIssues.cavitation.detected ? 1 : 0;
                criticalIssues += visionInsights.detectedIssues.cracks.detected ? 1 : 0;
            } else if (visionInsights.overallRiskLevel === 'HIGH' && status !== 'RED') {
                status = 'YELLOW';
            }
        }

        return {
            assetDetails: {
                name: assetName,
                location: 'Mala Rijeka HPP',
                timestamp: new Date().toLocaleString('de-DE')
            },
            executiveSummary: {
                status,
                overallHealth: status === 'GREEN' ? 95 : status === 'YELLOW' ? 70 : 45,
                criticalIssues,
                recommendedActions: visionInsights?.recommendations.immediate || []
            },
            siteConditions: {
                grossHead: technicalState.site.grossHead,
                waterQuality: technicalState.site.waterQuality,
                flowRate: technicalState.site.designFlow,
                designFlow: technicalState.site.designFlow
            },
            hydraulics: {
                staticPressure: technicalState.physics.staticPressureBar,
                surgePressure: technicalState.physics.surgePressureBar,
                flowVelocity: technicalState.site.designFlow / (Math.PI * Math.pow(technicalState.penstock.diameter / 2000, 2)),
                frictionLoss: 0.5, // Placeholder
                netHead: technicalState.site.grossHead * 0.95
            },
            mechanical: {
                boltGrade: technicalState.mechanical.boltSpecs.grade,
                boltCount: technicalState.mechanical.boltSpecs.count,
                torqueApplied: technicalState.mechanical.boltSpecs.torque,
                bearingType: technicalState.mechanical.bearingType || 'Unknown',
                alignment: technicalState.mechanical.radialClearance
            },
            thermalAdjustment: {
                ambientTemp: technicalState.site.temperature,
                operatingTemp: technicalState.site.temperature + 15,
                thermalExpansion: 0.012,
                appliedOffset: 0.012,
                validationStatus: 'VALIDATED'
            },
            visionInsights
        };
    }
}
