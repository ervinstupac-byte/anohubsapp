/**
 * ServiceChecklistEngine
 * 
 * Core engine for turbine-specific service checklists with:
 * - Dynamic template loading
 * - 0.05mm precision validation
 * - Automatic Service Alert generation
 * - Expert validation logic
 */

import {
    TurbineType,
    ChecklistTemplate,
    ChecklistItem,
    ChecklistItemResponse,
    ValidationResult,
    ServiceAlert,
    MeasurementConfig,
    AlertSeverity
} from '../types/checklist';

// Import JSON templates
import peltonTemplate from '../data/checklistTemplates/pelton.json';
import kaplanTemplate from '../data/checklistTemplates/kaplan.json';
import francisTemplate from '../data/checklistTemplates/francis.json';

export class ServiceChecklistEngine {

    /**
     * Load checklist template for specific turbine type
     */
    static getTemplateForTurbine(type: TurbineType): ChecklistTemplate {
        switch (type) {
            case 'PELTON':
                return peltonTemplate as ChecklistTemplate;
            case 'KAPLAN':
                return kaplanTemplate as ChecklistTemplate;
            case 'FRANCIS':
                return francisTemplate as ChecklistTemplate;
            default:
                throw new Error(`Unknown turbine type: ${type}`);
        }
    }

    /**
     * Get all items from template (flattened)
     */
    static getAllItems(template: ChecklistTemplate): ChecklistItem[] {
        return template.categories.flatMap(cat => cat.items);
    }

    /**
     * Find specific item by ID
     */
    static getItemById(template: ChecklistTemplate, itemId: string): ChecklistItem | undefined {
        return this.getAllItems(template).find(item => item.id === itemId);
    }

    /**
     * Validate checklist item response
     * THE 0.05mm WARNING SYSTEM
     */
    static validateChecklistItem(
        item: ChecklistItem,
        value: any
    ): ValidationResult {

        // BOOLEAN validation
        if (item.type === 'BOOLEAN') {
            const boolValue = Boolean(value);
            return {
                isValid: true,
                severity: 'OK',
                message: boolValue ? 'Confirmed' : 'Not Detected'
            };
        }

        // MEASUREMENT validation - CRITICAL FOR 0.05mm PRECISION
        if (item.type === 'MEASUREMENT' && item.measurementConfig) {
            return this.validateMeasurement(value, item.measurementConfig);
        }

        // PHOTO validation
        if (item.type === 'PHOTO' && item.photoConfig) {
            const photoCount = Array.isArray(value) ? value.length : 0;
            const minRequired = item.photoConfig.minPhotos;

            if (photoCount < minRequired) {
                return {
                    isValid: false,
                    severity: 'CRITICAL',
                    message: `Insufficient photos: ${photoCount}/${minRequired} required`
                };
            }

            return {
                isValid: true,
                severity: 'OK',
                message: `${photoCount} photos captured`
            };
        }

        return {
            isValid: false,
            severity: 'CRITICAL',
            message: 'Invalid item configuration'
        };
    }

    /**
     * THE 0.05mm PRECISION VALIDATION LOGIC
     * Critical for tolerance checking
     */
    private static validateMeasurement(
        measuredValue: number,
        config: MeasurementConfig
    ): ValidationResult {

        // Check if value is within acceptable range
        if (measuredValue < config.minValue || measuredValue > config.maxValue) {
            return {
                isValid: false,
                severity: 'CRITICAL',
                message: `OUT OF RANGE: ${measuredValue}${config.unit} (Range: ${config.minValue}-${config.maxValue}${config.unit})`,
                deviation: Math.abs(measuredValue - config.nominalValue)
            };
        }

        const deviation = Math.abs(measuredValue - config.nominalValue);

        // CRITICAL: Exceeds tolerance - GENERATE SERVICE ALERT
        if (deviation > config.tolerance) {
            const deviationPercent = ((deviation / config.tolerance) * 100).toFixed(0);
            return {
                isValid: false,
                severity: 'CRITICAL',
                message: `⚠️ TOLERANCE EXCEEDED: ${deviation.toFixed(3)}${config.unit} deviation (${deviationPercent}% over limit of ${config.tolerance}${config.unit})`,
                deviation
            };
        }

        // WARNING: Approaching tolerance limit (> 75%)
        if (deviation > config.tolerance * 0.75) {
            const deviationPercent = ((deviation / config.tolerance) * 100).toFixed(0);
            return {
                isValid: true,
                severity: 'WARNING',
                message: `⚡ WARNING: ${deviation.toFixed(3)}${config.unit} deviation (${deviationPercent}% of tolerance). Approaching limit.`,
                deviation
            };
        }

        // OK: Within acceptable tolerance
        return {
            isValid: true,
            severity: 'OK',
            message: `✓ OK: ${deviation.toFixed(3)}${config.unit} deviation (within ${config.tolerance}${config.unit} tolerance)`,
            deviation
        };
    }

    /**
     * Generate Service Alert from validation failure
     * Automatically creates alert for client portal
     */
    static generateServiceAlert(
        checklistId: string,
        assetId: string,
        assetName: string,
        item: ChecklistItem,
        response: ChecklistItemResponse,
        technicianName: string
    ): ServiceAlert | null {

        // Only generate alerts for validation failures
        if (response.validationResult.isValid ||
            response.validationResult.severity !== 'CRITICAL') {
            return null;
        }

        // Determine alert severity
        let severity: AlertSeverity = 'MEDIUM';

        if (item.type === 'MEASUREMENT' && item.measurementConfig && response.measurementValue !== undefined) {
            const deviation = response.validationResult.deviation || 0;
            const tolerance = item.measurementConfig.tolerance;

            // Deviation > 2x tolerance = CRITICAL
            if (deviation > tolerance * 2) {
                severity = 'CRITICAL';
            }
            // Deviation > 1.5x tolerance = HIGH
            else if (deviation > tolerance * 1.5) {
                severity = 'HIGH';
            }
            // Deviation > tolerance = MEDIUM
            else {
                severity = 'MEDIUM';
            }
        }

        // Build alert description
        let description = response.validationResult.message || 'Validation failed';

        if (item.expertNotes) {
            description += `\n\nExpert Note: ${item.expertNotes}`;
        }

        const alert: ServiceAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            checklistId,
            itemId: item.id,
            assetId,
            assetName,
            severity,
            title: `${item.label} - Tolerance Exceeded`,
            description,
            measuredValue: response.measurementValue,
            nominalValue: item.measurementConfig?.nominalValue,
            deviation: response.validationResult.deviation,
            unit: item.measurementConfig?.unit,
            createdAt: new Date().toISOString(),
            technicianName
        };

        return alert;
    }

    /**
     * Placeholder for Speech-to-Text translation
     * In production, this would call Google Translate API
     */
    static async translateFieldNotes(
        text: string,
        targetLang: 'de' | 'en' = 'de'
    ): Promise<string> {
        // TODO: Integrate real translation API
        // For now, return placeholder
        if (targetLang === 'de') {
            return `[DE] ${text}`;
        }
        return text;
    }

    /**
     * Calculate checklist progress
     */
    static calculateProgress(
        template: ChecklistTemplate,
        responses: ChecklistItemResponse[]
    ): {
        totalItems: number;
        completedItems: number;
        photosTaken: number;
        requiredPhotos: number;
        alertsGenerated: number;
    } {
        const allItems = this.getAllItems(template);
        const photosTaken = responses
            .filter(r => r.photos && r.photos.length > 0)
            .reduce((sum, r) => sum + (r.photos?.length || 0), 0);

        const alertsGenerated = responses
            .filter(r => !r.validationResult.isValid && r.validationResult.severity === 'CRITICAL')
            .length;

        return {
            totalItems: allItems.length,
            completedItems: responses.length,
            photosTaken,
            requiredPhotos: template.requiredPhotos,
            alertsGenerated
        };
    }

    /**
     * Check if checklist is complete
     */
    static isChecklistComplete(
        template: ChecklistTemplate,
        responses: ChecklistItemResponse[]
    ): boolean {
        const allItems = this.getAllItems(template);
        const requiredItems = allItems.filter(item => item.required);

        // All required items must have responses
        const requiredCompleted = requiredItems.every(item =>
            responses.some(r => r.itemId === item.id)
        );

        // Required photos must be met
        const progress = this.calculateProgress(template, responses);
        const photosComplete = progress.photosTaken >= progress.requiredPhotos;

        return requiredCompleted && photosComplete;
    }

    /**
     * Export checklist as German audit text
     * For PDF generation
     */
    static exportToAuditText(
        template: ChecklistTemplate,
        responses: ChecklistItemResponse[],
        fieldNotes: Map<string, string>  // itemId -> German transcript
    ): string {
        let auditText = `WARTUNGSPROTOKOLL - ${template.turbineType} TURBINE\n`;
        auditText += `Version: ${template.version}\n`;
        auditText += `Datum: ${new Date().toLocaleDateString('de-DE')}\n\n`;

        template.categories.forEach(category => {
            auditText += `\n## ${category.nameDE}\n`;

            category.items.forEach(item => {
                const response = responses.find(r => r.itemId === item.id);
                auditText += `\n### ${item.labelDE}\n`;

                if (response) {
                    auditText += `Status: ${response.validationResult.message}\n`;

                    if (response.measurementValue !== undefined) {
                        auditText += `Gemessen: ${response.measurementValue}${item.measurementConfig?.unit || ''}\n`;
                    }

                    if (response.booleanValue !== undefined) {
                        auditText += `Ergebnis: ${response.booleanValue ? 'JA' : 'NEIN'}\n`;
                    }

                    const note = fieldNotes.get(item.id);
                    if (note) {
                        auditText += `Techniker-Notiz: ${note}\n`;
                    }
                } else {
                    auditText += `Status: NICHT GEPRÜFT\n`;
                }
            });
        });

        return auditText;
    }
}
