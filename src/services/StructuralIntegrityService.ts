import Decimal from 'decimal.js';
import { TechnicalProjectState } from '../core/TechnicalSchema';

/**
 * STRUCTURAL INTEGRITY SERVICE
 * Uses Barlow's Formula to assess pressure-bearing capacity.
 * Formula: P = (2 * S * t) / D
 */
export const StructuralIntegrityService = {
    /**
     * Calculates the Maximum Allowable Working Pressure (MAWP)
     * @param yieldStrength MPa
     * @param wallThickness m
     * @param diameter m
     * @returns MAWP in Bar
     */
    calculateMAWP: (yieldStrength: number, wallThickness: number, diameter: number): number => {
        const S = new Decimal(yieldStrength);
        const t = new Decimal(wallThickness);
        const D = new Decimal(diameter);

        if (D.isZero()) return 0;

        // P (MPa) = (2 * S * t) / D
        const mawpMPa = S.mul(t).mul(2).div(D);
        return mawpMPa.mul(10).toNumber(); // Convert MPa to Bar
    },

    /**
     * Calculates the Structural Safety Margin
     * @param currentPressureBar Bar
     * @param mawpBar Bar
     * @returns Percentage (0-100)
     */
    calculateMargin: (currentPressureBar: number, mawpBar: number): number => {
        if (mawpBar <= 0) return 0;
        const margin = ((mawpBar - currentPressureBar) / mawpBar) * 100;
        return Math.max(0, Math.min(100, margin));
    },

    /**
     * Full audit of technical state
     */
    audit: (state: TechnicalProjectState) => {
        const { penstock, physics } = state;
        const mawp = StructuralIntegrityService.calculateMAWP(
            penstock.materialYieldStrength,
            penstock.wallThickness,
            penstock.diameter
        );

        const currentPressure = physics.staticPressureBar + physics.surgePressureBar;
        const margin = StructuralIntegrityService.calculateMargin(currentPressure, mawp);

        return {
            mawp,
            currentPressure,
            margin,
            isSafe: margin >= 20,
            status: (margin < 20 ? 'CRITICAL' : margin < 40 ? 'WARNING' : 'NORMAL') as 'NORMAL' | 'WARNING' | 'CRITICAL'
        };
    }
};
