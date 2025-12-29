import { FRANCIS_CONSTANTS } from '../models/FrancisSchema';

export interface FrancisTelemetry {
    bearingTemp: number; // Celsius
    vibration: number;   // mm/s
    siltPpm: number;
    gridFreq: number;    // Hz
    loadMw: number;
    mivStatus: 'OPEN' | 'CLOSED';
}

export interface DiagnosticResult {
    status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
    message: string;
    action?: string;
    referenceProtocol?: string;
}

/**
 * FRANCIS HORIZONTAL LOGIC ENGINE
 * Implements the "Diagnostic Troubleshooting Matrix" from Legacy HTML
 */
export const diagnoseFrancisFault = (data: FrancisTelemetry): DiagnosticResult[] => {
    const results: DiagnosticResult[] = [];

    // 1. BEARING THERMAL LOGIC (from Francis_SOP_Bearings.html)
    if (data.bearingTemp >= FRANCIS_CONSTANTS.TRIP_BEARING_TEMP) {
        results.push({
            status: 'EMERGENCY',
            message: 'Bearing Temp TRIP Threshold Exceeded (>70°C)',
            action: 'EMERGENCY STOP. Check for babbit damage.',
            referenceProtocol: 'FH-BEARINGS-01'
        });
    } else if (data.bearingTemp > FRANCIS_CONSTANTS.MAX_BEARING_TEMP) {
        results.push({
            status: 'WARNING',
            message: 'High Bearing Temperature (>60°C)',
            action: 'Check oil level and cooling water flow. Clean filters.',
            referenceProtocol: 'FH-BEARINGS-02'
        });
    }

    // 2. VIBRATION LOGIC (from Francis_Horizontal.html)
    if (data.vibration > FRANCIS_CONSTANTS.MAX_VIBRATION_ISO) {
        results.push({
            status: 'CRITICAL',
            message: 'High Vibration (>2.5 mm/s)',
            action: 'Check alignment, foundation bolts, and draft tube snifter valves.',
            referenceProtocol: 'FH-DFT-01'
        });
    }

    // 3. SILT FLASH FLOOD LOGIC (from Francis_Emergency_Protocols.html)
    if (data.siltPpm > FRANCIS_CONSTANTS.SILT_CRITICAL_PPM) {
        results.push({
            status: 'EMERGENCY',
            message: `SILT FLASH FLOOD (>${FRANCIS_CONSTANTS.SILT_CRITICAL_PPM} ppm)`,
            action: 'IMMEDIATE SHUTDOWN. Prevent runner erosion.',
            referenceProtocol: 'P-02'
        });
    } else if (data.siltPpm > FRANCIS_CONSTANTS.SILT_WARNING_PPM) {
        results.push({
            status: 'CRITICAL',
            message: `Critical Silt Concentration (>${FRANCIS_CONSTANTS.SILT_WARNING_PPM} ppm)`,
            action: 'Reduce load to minimum. Plan shutdown < 2h.',
            referenceProtocol: 'P-02'
        });
    }

    // 4. GRID FREQUENCY LOGIC (from Francis_Emergency_Protocols.html)
    if (data.gridFreq < 49.0 || data.gridFreq > 51.0) {
        results.push({
            status: 'EMERGENCY',
            message: `Grid Frequency Anomaly (${data.gridFreq} Hz)`,
            action: 'Verify "Island Mode" or Trip Unit.',
            referenceProtocol: 'P-06'
        });
    }

    if (results.length === 0) {
        results.push({ status: 'NORMAL', message: 'Parameters within nominal Francis limits.' });
    }

    return results;
};
