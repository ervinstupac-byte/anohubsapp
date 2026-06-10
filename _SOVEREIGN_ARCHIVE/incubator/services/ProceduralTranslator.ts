/**
 * ProceduralTranslator.ts
 * 
 * Translates technical AI decisions into human-readable procedural instructions
 * Bridges the gap between autonomous AI and human operators
 */

export interface ProceduralInstruction {
    original: string; // Technical AI decision
    translated: string; // Human-readable instruction
    urgency: 'ROUTINE' | 'IMPORTANT' | 'URGENT' | 'CRITICAL';
    category: 'ADJUSTMENT' | 'INSPECTION' | 'MAINTENANCE' | 'EMERGENCY';
}

export class ProceduralTranslator {

    /**
     * Translate conjugate curve error to manual instruction
     */
    public static translateConjugateCurveError(
        assetId: string,
        currentAngle: number,
        optimalAngle: number,
        efficiencyGap: number,
        servoOffset?: number
    ): ProceduralInstruction {
        const adjustment = optimalAngle - currentAngle;
        const urgency = efficiencyGap > 2.0 ? 'URGENT' : efficiencyGap > 1.0 ? 'IMPORTANT' : 'ROUTINE';

        let translated = `MANUAL BLADE ANGLE ADJUSTMENT - ${assetId}\n`;
        translated += `\n`;
        translated += `Current Situation:\n`;
        translated += `- Turbine is operating ${efficiencyGap.toFixed(1)}% below optimal efficiency\n`;
        translated += `- Current blade angle: ${currentAngle.toFixed(1)}°\n`;
        translated += `- Optimal blade angle: ${optimalAngle.toFixed(1)}°\n`;
        translated += `\n`;
        translated += `Required Action:\n`;

        if (servoOffset) {
            translated += `1. The servo has a ${servoOffset.toFixed(1)}° mechanical backlash\n`;
            translated += `2. To achieve ${optimalAngle.toFixed(1)}°, set servo to ${(optimalAngle + servoOffset).toFixed(1)}°\n`;
            translated += `3. Physical adjustment: ADD ${adjustment.toFixed(1)}° to blade setting\n`;
            translated += `4. Servo setpoint: ${(optimalAngle + servoOffset).toFixed(1)}° (compensated)\n`;
        } else {
            translated += `1. ${adjustment > 0 ? 'INCREASE' : 'DECREASE'} blade angle by ${Math.abs(adjustment).toFixed(1)}°\n`;
            translated += `2. New setpoint: ${optimalAngle.toFixed(1)}°\n`;
        }

        translated += `\n`;
        translated += `Expected Result:\n`;
        translated += `- Efficiency will improve by approximately ${efficiencyGap.toFixed(1)}%\n`;
        translated += `- Monitor power output for stabilization (2-3 minutes)\n`;

        return {
            original: `ConjugateCurveError: Δφ=${adjustment.toFixed(2)}°, Δη=${efficiencyGap.toFixed(2)}%`,
            translated,
            urgency,
            category: 'ADJUSTMENT'
        };
    }

    /**
     * Translate vortex detection to manual instruction
     */
    public static translateVortexSuppression(
        assetId: string,
        vortexFrequency: number,
        amplitude: number,
        rheingansRange: [number, number]
    ): ProceduralInstruction {
        const urgency = amplitude > 0.5 ? 'URGENT' : amplitude > 0.3 ? 'IMPORTANT' : 'ROUTINE';

        let translated = `DRAFT TUBE VORTEX SUPPRESSION - ${assetId}\n`;
        translated += `\n`;
        translated += `urrent Situation:\n`;
        translated += `- Vortex rope detected in draft tube\n`;
        translated += `- Vortex frequency: ${vortexFrequency.toFixed(2)} Hz\n`;
        translated += `- Resonance range: ${rheingansRange[0].toFixed(2)}-${rheingansRange[1].toFixed(2)} Hz\n`;
        translated += `- Pressure amplitude: ${amplitude.toFixed(2)} bar\n`;
        translated += `\n`;
        translated += `Required Action (Choose ONE):\n`;
        translated += `\n`;
        translated += `OPTION 1 - Air Injection (Recommended):\n`;
        translated += `1. Open air admission valve to draft tube\n`;
        translated += `2. Start with 200 m³/h air flow\n`;
        translated += `3. Monitor vibration reduction (should decrease within 30 seconds)\n`;
        translated += `4. Adjust air flow as needed (range: 0-500 m³/h)\n`;
        translated += `5. Vortex should dissipate when air flow is optimized\n`;
        translated += `\n`;
        translated += `OPTION 2 - Load Shift:\n`;
        translated += `1. Change load by ±5% to shift operating point\n`;
        translated += `2. This moves vortex frequency out of resonance range\n`;
        translated += `3. Monitor for 2 minutes to verify vortex suppression\n`;
        translated += `\n`;
        translated += `Safety Notes:\n`;
        translated += `- High amplitude (>0.5 bar) can damage draft tube concrete\n`;
        translated += `- Prolonged vortex exposure reduces bearing life\n`;

        return {
            original: `VortexDetected: f=${vortexFrequency}Hz, A=${amplitude}bar`,
            translated,
            urgency,
            category: 'ADJUSTMENT'
        };
    }

    /**
     * Translate water hammer event to manual instruction
     */
    public static translateWaterHammer(
        assetId: string,
        nozzleId: string,
        surgePressure: number,
        needleSpeed: number
    ): ProceduralInstruction {
        const urgency = surgePressure > 30 ? 'CRITICAL' : surgePressure > 20 ? 'URGENT' : 'IMPORTANT';

        let translated = `WATER HAMMER PREVENTION - ${assetId} ${nozzleId}\n`;
        translated += `\n`;
        translated += `Current Situation:\n`;
        translated += `- Pressure surge detected: ${surgePressure.toFixed(1)} bar\n`;
        translated += `- Needle closing rate: ${needleSpeed.toFixed(1)} mm/s (TOO FAST)\n`;
        translated += `- Safe closing rate: <5 mm/s\n`;
        translated += `\n`;
        translated += `Required Action:\n`;
        translated += `1. SLOW DOWN needle closing rate immediately\n`;
        translated += `2. Maximum safe speed: 5 mm/s\n`;
        translated += `3. Use S-curve profile for closing (gradual acceleration/deceleration)\n`;
        translated += `4. If surge >30 bar: STOP closing and activate deflector instead\n`;
        translated += `\n`;
        translated += `Manual Needle Operation:\n`;
        translated += `- Start closing: 2 mm/s initial rate\n`;
        translated += `- Mid-stroke: Maximum 5 mm/s\n`;
        translated += `- Final 20mm: Reduce to 2 mm/s\n`;
        translated += `- Total closing time: Approximately 30-40 seconds\n`;
        translated += `\n`;
        translated += `Emergency Procedure:\n`;
        translated += `- If immediate shutdown needed: Activate deflector FIRST\n`;
        translated += `- Then close needle slowly while deflector diverts flow\n`;
        translated += `- Never close needle rapidly (causes penstock fatigue)\n`;

        return {
            original: `WaterHammer: ΔP=${surgePressure}bar, v=${needleSpeed}mm/s`,
            translated,
            urgency,
            category: 'EMERGENCY'
        };
    }

    /**
     * Translate high vibration alarm to manual instruction
     */
    public static translateHighVibration(
        assetId: string,
        bearing: string,
        vibration: number,
        temperature: number
    ): ProceduralInstruction {
        const urgency = vibration > 4.0 ? 'CRITICAL' : vibration > 2.5 ? 'URGENT' : 'IMPORTANT';

        let translated = `HIGH VIBRATION ALARM - ${assetId} ${bearing}\n`;
        translated += `\n`;
        translated += `Current Situation:\n`;
        translated += `- Vibration level: ${vibration.toFixed(1)} mm/s RMS\n`;
        translated += `- Bearing temperature: ${temperature.toFixed(0)}°C\n`;
        translated += `- Normal range: <1.8 mm/s\n`;
        translated += `- Warning threshold: >2.5 mm/s\n`;
        translated += `- Emergency threshold: >4.0 mm/s\n`;
        translated += `\n`;

        if (vibration > 4.0) {
            translated += `⚠️ CRITICAL - IMMEDIATE ACTION REQUIRED:\n`;
            translated += `1. INITIATE EMERGENCY SHUTDOWN NOW\n`;
            translated += `2. Do not attempt to reduce vibration - STOP UNIT\n`;
            translated += `3. Wait for complete stop before inspection\n`;
            translated += `4. Inspect bearing for damage before restart\n`;
        } else if (vibration > 2.5) {
            translated += `Required Action:\n`;
            translated += `1. REDUCE LOAD by 20% immediately\n`;
            translated += `2. Monitor vibration for 5 minutes\n`;
            translated += `3. If vibration persists: Reduce load further\n`;
            translated += `4. If vibration >3.5 mm/s: Initiate controlled shutdown\n`;
            translated += `\n`;
            translated += `Inspection Checklist:\n`;
            translated += `- Check bearing oil level and quality\n`;
            translated += `- Verify cooling water flow\n`;
            translated += `- Listen for unusual noise\n`;
            translated += `- Check foundation bolts for looseness\n`;
        }

        return {
            original: `HighVibration: ${bearing}=${vibration}mm/s, T=${temperature}°C`,
            translated,
            urgency,
            category: urgency === 'CRITICAL' ? 'EMERGENCY' : 'INSPECTION'
        };
    }

    /**
     * Format instruction for display
     */
    public static formatForDisplay(instruction: ProceduralInstruction): string {
        const border = '─'.repeat(80);
        const urgencyColors = {
            ROUTINE: '🟢',
            IMPORTANT: '🟡',
            URGENT: '🟠',
            CRITICAL: '🔴'
        };

        let output = '\n';
        output += border + '\n';
        output += `${urgencyColors[instruction.urgency]} ${instruction.urgency} - ${instruction.category}\n`;
        output += border + '\n';
        output += instruction.translated + '\n';
        output += border + '\n';
        output += `Technical: ${instruction.original}\n`;
        output += border + '\n';

        return output;
    }
}
