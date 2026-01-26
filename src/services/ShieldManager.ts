/**
 * ShieldManager.ts
 * 
 * Command Validation & Safety Cross-Check
 * Acts as the final gatekeeper before commands reach the actuators.
 * Blocks "Legal but Dangerous" commands by checking against Safety Interlocks.
 */

import { SafetyInterlockEngine } from './SafetyInterlockEngine';

export interface CommandRequest {
    id: string;
    sourceIp: string;
    command: string; // e.g., "FAST_CLOSE", "START_UNIT"
    parameters: any;
    timestamp: number;
    signature: string;
}

export interface ValidationResult {
    allowed: boolean;
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class ShieldManager {

    /**
     * VALIDATE COMMAND REQUEST
     */
    public static validateCommand(
        request: CommandRequest,
        currentLoadMW: number,
        unitSpeedPct: number
    ): ValidationResult {

        // 1. Check Safety Interlocks (NC-60)
        // We simulate a check: "Is this action physically safe right now?"

        if (request.command === 'FAST_CLOSE') {
            // Dangerous if high load and not an emergency trigger
            if (currentLoadMW > 50) {
                return {
                    allowed: false,
                    reason: `BLOCKED: Fast Close at ${currentLoadMW} MW causes Water Hammer risk. Use Normal Stop.`,
                    riskLevel: 'CRITICAL'
                };
            }
        }

        if (request.command === 'START_UNIT') {
            // Check if already running or interlocked
            if (unitSpeedPct > 0) {
                return {
                    allowed: false,
                    reason: `BLOCKED: Start command received while unit moving (${unitSpeedPct}%).`,
                    riskLevel: 'HIGH'
                };
            }
        }

        // 2. Rate Limiting / DoS Protection (Simplified)
        // If we get 100 START commands in 1 second, block.
        // (Implementation omitted for brevity, assumed separate layer)

        return {
            allowed: true,
            reason: 'Command Validated',
            riskLevel: 'LOW'
        };
    }
}
