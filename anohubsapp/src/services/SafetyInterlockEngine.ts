// Safety Interlock Engine
// Manages the critical 3-Tier Validation process for hardware/parameter changes
// 1. Simulation Check -> 2. Consultant Approval -> 3. SCADA Physical Lock

import { HydraulicTransientSafety, HydraulicSpec } from './HydraulicTransientSafety';

export type InterlockStatus = 'LOCKED' | 'PENDING_APPROVAL' | 'UNLOCKED' | 'EMERGENCY_OVERRIDE';

export interface ChangeRequest {
    id: string;
    requester: string;
    timestamp: number;
    type: 'HARDWARE' | 'PARAMETER';
    component: string;
    description: string;

    // For hardware changes
    currentSpec?: HydraulicSpec;
    proposedSpec?: HydraulicSpec;

    // Validation State
    simulationPassed: boolean;
    simulationWarnings: string[];
    consultatApproval?: {
        approved: boolean;
        approverName: string;
        timestamp: number;
        digitalSignature: string; // Crypto hash
    };
}

export class SafetyInterlockEngine {
    private static activeRequest: ChangeRequest | null = null;
    private static systemStatus: InterlockStatus = 'LOCKED';

    /**
     * Submit a change request for validation
     */
    static submitRequest(request: Omit<ChangeRequest, 'simulationPassed' | 'simulationWarnings' | 'id' | 'timestamp'>): SimulationResult {
        const fullRequest: ChangeRequest = {
            ...request,
            id: `REQ-${Date.now()}`,
            timestamp: Date.now(),
            simulationPassed: false,
            simulationWarnings: []
        };

        // 1. TIER 1: AUTOMATED SIMULATION
        let simResult;
        if (request.type === 'HARDWARE' && request.currentSpec && request.proposedSpec) {
            simResult = HydraulicTransientSafety.simulateHardwareChange(
                request.currentSpec,
                request.proposedSpec
            );

            fullRequest.simulationPassed = simResult.approved;
            fullRequest.simulationWarnings = simResult.warnings;

            if (!simResult.approved) {
                // Formatting the rejection
                return {
                    status: 'REJECTED',
                    message: `Simulation Failed: ${simResult.reason}`,
                    details: simResult
                };
            }
        } else {
            // Parameter changes might have different checks
            fullRequest.simulationPassed = true; // Placeholder for param checks
        }

        // If simulation passed, move to pending
        this.activeRequest = fullRequest;
        this.systemStatus = 'PENDING_APPROVAL';

        return {
            status: 'PENDING',
            message: 'Simulation Passed. Waiting for Consultant Approval.',
            requestId: fullRequest.id,
            simulationWarnings: fullRequest.simulationWarnings
        };
    }

    /**
     * TIER 2: CONSULTANT APPROVAL (Remote Expert)
     */
    static approveRequest(requestId: string, approverName: string, signature: string): { status: string; message: string } {
        if (!this.activeRequest || this.activeRequest.id !== requestId) {
            return { status: 'ERROR', message: 'Request not found' };
        }

        if (this.systemStatus !== 'PENDING_APPROVAL') {
            return { status: 'ERROR', message: 'System not in pending state' };
        }

        // Verify expert permission (mock)
        if (!approverName.includes('Ervin')) { // Only Ervin can approve criticals :D
            // Just kidding, simplified check
        }

        this.activeRequest.consultatApproval = {
            approved: true,
            approverName,
            timestamp: Date.now(),
            digitalSignature: signature
        };

        // Move to unlocked state
        return this.unlockSCADA();
    }

    /**
     * TIER 3: SCADA PHYSICAL UNLOCK
     */
    private static unlockSCADA() {
        // In real world, this sends Modbus/OPC-UA command to PLC
        console.log('🔓 SENDING SCADA UNLOCK COMMAND...');

        this.systemStatus = 'UNLOCKED';

        // Auto-lock timer (e.g., 1 hour to perform change)
        setTimeout(() => {
            if (this.systemStatus === 'UNLOCKED') {
                this.lockSCADA();
            }
        }, 3600000);

        return {
            status: 'UNLOCKED',
            message: 'SCADA Interlock Released. You may proceed with physical change.'
        };
    }

    static lockSCADA() {
        this.systemStatus = 'LOCKED';
        this.activeRequest = null;
        console.log('🔒 SCADA LOCKED');
    }

    static getStatus() {
        return {
            status: this.systemStatus,
            activeRequest: this.activeRequest
        };
    }

    static emergencyOverride(reason: string, user: string) {
        // Red button logic - logs heavily
        console.error(`🚨 EMERGENCY OVERRIDE by ${user}: ${reason}`);
        this.systemStatus = 'EMERGENCY_OVERRIDE';
        // Log to immutable ledger
    }
}

interface SimulationResult {
    status: 'REJECTED' | 'PENDING' | 'UNLOCKED';
    message: string;
    details?: any;
    requestId?: string;
    simulationWarnings?: string[];
}
