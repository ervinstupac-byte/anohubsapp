/**
 * LEGACY BRIDGE SERVICE
 * The Universal Translator 🌉
 * Maps old "Tag Soup" into the structured v1.0 SCADA Heartbeat.
 */

import { SCADASnapshot, PLCVoice } from './SCADAHeartbeat';

// Type for the raw tag soup from the old PLC
export interface LegacyTagMap {
    [key: string]: any;
}

export class LegacyBridge {

    /**
     * UNIFIED DATA BRIDGE
     * Wouves existig real-time tags into the new Heartbeat.
     */
    bridgeExistingData(tags: LegacyTagMap): Partial<PLCVoice> {
        // Mapping Logic: Old Tag -> New Schema

        return {
            timestamp: new Date(), // Real-time

            // Turbine Data
            turbineRPM: tags['U1_SPD_001'] || tags['TURB_SPEED'] || 0,
            turbinePower: tags['U1_MW_001'] || tags['ACT_PWR'] || 0,
            guideVaneOpening: tags['U1_GVO_POS'] || tags['WICKET_GATE'] || 0,

            // Hydraulic
            inletPressure: tags['U1_PEN_PRESS'] || 0,
            flowRate: tags['U1_FLOW_Q'] || 0,

            // Bearings (The messy part - mapping variously named temp tags)
            bearingTemps: {
                guideBearing: tags['U1_TGB_TEMP'] || tags['BRG_GUIDE_T'] || 0,
                thrustBearing: tags['U1_TTB_TEMP'] || tags['BRG_THRUST_T'] || 0,
                generatorBearing: tags['U1_TGB_UPPER'] || 0 // Assuming upper guide is generator bearing here
            },

            // Vital Organs (Enriched Data)
            oilPressure: tags['U1_GOV_OIL_P'] || 0,
            oilTemperature: tags['U1_GOV_OIL_T'] || 0,

            // New v1.0 Fields (might be missing in old PLC, defaulting to safe/null)
            coolingFlowRate: tags['U1_CW_FLOW'] || 0,
            coolingInletTemp: tags['U1_CW_T_IN'] || 0,
            coolingOutletTemp: tags['U1_CW_T_OUT'] || 0
        };
    }

    /**
     * GAP ANALYSIS REPORT GENERATOR
     * Compares Old Limits vs Master Specs
     */
    generateGapAnalysis(legacyLimits: Record<string, number>): string {
        const report = [];
        report.push('# ⚠️ GAP ANALYSIS REPORT: LEGACY vs V1.0');
        report.push('| Parameter | Legacy Limit | Master Spec (v1.0) | Risk |');
        report.push('| :--- | :--- | :--- | :--- |');

        // 1. Deflector Response
        const oldDeflector = legacyLimits['DEFLECTOR_TIME_TRIP'];
        const masterDeflector = 1.0;
        if (oldDeflector > masterDeflector) {
            report.push(`| Deflector Response | ${oldDeflector}s | **${masterDeflector}s** | 🚨 **DANGEROUS**: Old logic too slow for water hammer protection. |`);
        }

        // 2. Jet Alignment
        const oldJetOffset = legacyLimits['JET_OFFSET_MAX'];
        const masterJetOffset = 1.0;
        if (oldJetOffset > masterJetOffset) {
            report.push(`| Jet Offset Tolerance | ${oldJetOffset}mm | **${masterJetOffset}mm** | ⚠️ **WEAR RISK**: Buckets loading unevenly. |`);
        }

        // 3. Vibration BPF
        const oldVibe = legacyLimits['VIBE_TRIP_ISO']; // usually overall RMS
        // New logic is frequency specific, hard to compare directly, but we can note it.
        report.push(`| Vibration Logic | Overall RMS (${oldVibe}mm/s) | **FFT Specific (>2mm/s @ BPF)** | ℹ️ **BLINDSPOT**: Old system ignores hydraulic resonance. |`);

        // 4. Cooling DeltaP
        const oldFilter = legacyLimits['FILTER_DP_HIGH'];
        const masterFilter = 0.5;
        if (oldFilter > masterFilter) {
            report.push(`| Cooling Filter dP | ${oldFilter} bar | **${masterFilter} bar** | ⚠️ **STARVATION RISK**: Filter cleans too late. |`);
        }

        return report.join('\n');
    }
}
