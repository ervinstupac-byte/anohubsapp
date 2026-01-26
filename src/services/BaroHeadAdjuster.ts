/**
 * BaroHeadAdjuster.ts
 * 
 * Atmospheric Pressure Compensation
 * Updates net head calculation based on barometric variance
 * Improves efficiency model accuracy
 */

export class BaroHeadAdjuster {
    private static readonly STANDARD_PRESSURE = 1013.25; // hPa (sea level)

    public static calculateNetHead(
        grossHead: number, // meters
        atmosphericPressure: number // hPa
    ): number {
        // Atmospheric pressure affects water column behavior
        // Convert pressure difference to equivalent head
        const pressureDiff = atmosphericPressure - this.STANDARD_PRESSURE;
        const pressureHead = (pressureDiff * 100) / (9.81 * 1000); // Pa to meters

        const netHead = grossHead + pressureHead;

        if (Math.abs(pressureHead) > 0.1) {
            console.log(`[BaroHead] Atmospheric compensation: ${pressureHead > 0 ? '+' : ''}${pressureHead.toFixed(2)}m`);
            console.log(`  Pressure: ${atmosphericPressure.toFixed(1)} hPa`);
            console.log(`  Net head: ${netHead.toFixed(2)}m`);
        }

        return netHead;
    }
}
