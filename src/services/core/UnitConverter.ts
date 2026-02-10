/**
 * UnitConverter.ts
 * 
 * NC-10001: Foundation Lockdown - Unit Normalization Layer
 * Centralized, type-safe unit conversions to prevent "magic number" division errors.
 * 
 * Rules:
 * 1. No manual division by 100, 1000, or 1e6 in services.
 * 2. All conversions must be explicit functions.
 */

import Decimal from 'decimal.js';

export class UnitConverter {
    /**
     * Convert Pascals [Pa] to Bar [bar]
     * 1 Bar = 100,000 Pa
     */
    static paToBar(pascals: number | Decimal): number {
        const val = Decimal.isDecimal(pascals) ? pascals : new Decimal(pascals);
        return val.div(100000).toNumber();
    }

    /**
     * Convert Bar [bar] to Pascals [Pa]
     * 1 Bar = 100,000 Pa
     */
    static barToPa(bar: number | Decimal): number {
        const val = Decimal.isDecimal(bar) ? bar : new Decimal(bar);
        return val.mul(100000).toNumber();
    }

    /**
     * Convert Pascals [Pa] to Megapascals [MPa]
     * 1 MPa = 1,000,000 Pa
     */
    static paToMPa(pascals: number | Decimal): number {
        const val = Decimal.isDecimal(pascals) ? pascals : new Decimal(pascals);
        return val.div(1000000).toNumber();
    }

    /**
     * Convert Megapascals [MPa] to Pascals [Pa]
     * 1 MPa = 1,000,000 Pa
     */
    static mpaToPa(mpa: number | Decimal): number {
        const val = Decimal.isDecimal(mpa) ? mpa : new Decimal(mpa);
        return val.mul(1000000).toNumber();
    }

    /**
     * Convert Meters [m] to Feet [ft]
     * 1 m = 3.28084 ft
     */
    static metersToFeet(meters: number | Decimal): number {
        const val = Decimal.isDecimal(meters) ? meters : new Decimal(meters);
        return val.mul(3.28084).toNumber();
    }

    /**
     * Convert Feet [ft] to Meters [m]
     * 1 ft = 0.3048 m
     */
    static feetToMeters(feet: number | Decimal): number {
        const val = Decimal.isDecimal(feet) ? feet : new Decimal(feet);
        return val.mul(0.3048).toNumber();
    }

    /**
     * Convert GigaPascals [GPa] to Pascals [Pa]
     * 1 GPa = 1,000,000,000 Pa
     */
    static gpaToPa(gpa: number | Decimal): number {
        const val = Decimal.isDecimal(gpa) ? gpa : new Decimal(gpa);
        return val.mul(1e9).toNumber();
    }
}
