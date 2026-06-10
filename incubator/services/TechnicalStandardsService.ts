/**
 * Technical Standards Database
 * ISO/DIN standards with automatic linking
 */

import { TechnicalStandard, AnalysisType } from '../types/aiFinding';

export const STANDARDS_DB: TechnicalStandard[] = [
    {
        id: 'iso_10816_1',
        standardCode: 'ISO 10816-1',
        title: 'Mechanical vibration - Evaluation of machine vibration by measurements on non-rotating parts',
        titleDE: 'Mechanische Schwingungen - Bewertung der Schwingungen von Maschinen durch Messungen an nicht-rotierenden Teilen',
        category: 'VIBRATION',
        applicableConditions: ['VIBRATION', 'CAVITATION'],
        url: 'https://www.iso.org/standard/51839.html'
    },
    {
        id: 'din_51524',
        standardCode: 'DIN 51524',
        title: 'Pressure fluids - Hydraulic oils',
        titleDE: 'Druckflüssigkeiten - Hydrauliköle',
        category: 'LUBRICATION',
        applicableConditions: ['THERMAL'],
        url: 'https://www.din.de'
    },
    {
        id: 'iso_4406',
        standardCode: 'ISO 4406',
        title: 'Hydraulic fluid power - Fluids - Method for coding the level of contamination by solid particles',
        titleDE: 'Fluidtechnik - Hydraulikflüssigkeiten - Verfahren zur Kodierung des Verschmutzungsgrades durch feste Partikel',
        category: 'HYDRAULICS',
        applicableConditions: ['EROSION', 'CORROSION']
    },
    {
        id: 'astm_g32',
        standardCode: 'ASTM G32',
        title: 'Standard Test Method for Cavitation Erosion Using Vibratory Apparatus',
        titleDE: 'Standardprüfverfahren für Kavitationserosion mit Vibrationsgerät',
        category: 'MECHANICAL',
        applicableConditions: ['CAVITATION', 'EROSION']
    },
    {
        id: 'iso_8044',
        standardCode: 'ISO 8044',
        title: 'Corrosion of metals and alloys - Basic terms and definitions',
        titleDE: 'Korrosion von Metallen und Legierungen - Grundbegriffe',
        category: 'MECHANICAL',
        applicableConditions: ['CORROSION']
    },
    {
        id: 'din_743',
        standardCode: 'DIN 743',
        title: 'Calculation of load capacity of shafts and axles',
        titleDE: 'Tragfähigkeitsberechnung von Wellen und Achsen',
        category: 'MECHANICAL',
        applicableConditions: ['CRACK', 'THERMAL']
    }
];

export class TechnicalStandardsService {

    /**
     * Get applicable standards for analysis type
     */
    static getApplicableStandards(analysisType: AnalysisType): TechnicalStandard[] {
        return STANDARDS_DB.filter(std =>
            std.applicableConditions.includes(analysisType)
        );
    }

    /**
     * Get standard by code
     */
    static getStandardByCode(code: string): TechnicalStandard | undefined {
        return STANDARDS_DB.find(std => std.standardCode === code);
    }

    /**
     * Get all standards
     */
    static getAllStandards(): TechnicalStandard[] {
        return STANDARDS_DB;
    }

    /**
     * Find best matching standard for analysis
     */
    static findBestStandard(
        analysisType: AnalysisType,
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    ): TechnicalStandard | undefined {
        const applicable = this.getApplicableStandards(analysisType);

        if (applicable.length === 0) return undefined;

        // Prefer vibration standards for critical findings
        if (severity === 'CRITICAL' || severity === 'HIGH') {
            const vibStandard = applicable.find(s => s.category === 'VIBRATION');
            if (vibStandard) return vibStandard;
        }

        return applicable[0];
    }
}
