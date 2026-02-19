/**
 * SovereignStartSequence.ts
 * 
 * "One-Button Start" Orchestrator
 * Coordinates HPU, Pneumatics, and Cooling to bring the unit to readiness.
 */

import { PermissiveManager, PermissiveState } from './PermissiveManager';
import { HPUManager, HPUStatus } from './HPUManager';
import { PneumaticSystemManager, AirSystemStatus } from './PneumaticSystemManager';
import { DewateringSovereign, SumpStatus } from './DewateringSovereign';

export type StartState =
    | 'IDLE'
    | 'CHECK_PERMISSIVES'
    | 'START_AUX_HPU'
    | 'START_AUX_COOLING'
    | 'PREPARE_GOVERNOR'
    | 'RELEASE_BRAKES'
    | 'COMPLETED'
    | 'ABORTED';

export interface SequenceStatus {
    state: StartState;
    stepProgress: number; // 0-100% for current step
    message: string;
    abortReason?: string;
    permissives: PermissiveState;
}

export class SovereignStartSequence {
    private static currentState: StartState = 'IDLE';
    private static stepStartTime = 0;

    // Simulations vars
    private static simulatedPressure = 0;

    /**
     * TICK (Run periodically, e.g. 1Hz)
     */
    public static tick(
        hpuStatus: HPUStatus,
        airStatus: AirSystemStatus,
        sumpStatus: SumpStatus,
        coolingFlowLps: number,
        lockoutActive: boolean
    ): SequenceStatus {

        // 1. Global Safety Check (Always Active)
        const permissives = PermissiveManager.checkPermissives(
            hpuStatus,
            airStatus,
            sumpStatus,
            hpuStatus.pressureBar, // Using HPU pressure as Gov pressure proxy
            coolingFlowLps,
            lockoutActive
        );

        // Immediate Abort Conditions during active sequence
        if (this.currentState !== 'IDLE' && this.currentState !== 'ABORTED' && this.currentState !== 'COMPLETED') {
            if (!permissives.readyToStart) {
                // If we lose a critical permissive mid-start (e.g. oil level drop), ABORT
                // Exception: Some permissives might be "Start Permissives" vs "Run Permissives"
                // For simplicity, we abort on any lost permissive here.
                return this.abort(`Safety Violation: ${permissives.missingConditions.join(', ')}`, permissives);
            }
        }

        // 2. State Machine
        switch (this.currentState) {
            case 'IDLE':
                return this.status('Ready to Start', 0, permissives);

            case 'CHECK_PERMISSIVES':
                if (Date.now() - this.stepStartTime > 2000) {
                    // Simulated checks passed
                    this.transition('START_AUX_HPU');
                }
                return this.status('Verifying Safety Interlocks...', 50, permissives);

            case 'START_AUX_HPU':
                // Command HPU Pump (Simulation: wait for pressure)
                // In real app, we would emit a command here
                if (hpuStatus.pressureBar > 130) {
                    this.transition('START_AUX_COOLING');
                }
                return this.status(`Pressurizing HPU (${hpuStatus.pressureBar.toFixed(0)} bar)...`,
                    Math.min(100, (hpuStatus.pressureBar / 130) * 100), permissives);

            case 'START_AUX_COOLING':
                if (coolingFlowLps > 40) {
                    this.transition('PREPARE_GOVERNOR');
                }
                return this.status('Starting Cooling Water...',
                    Math.min(100, (coolingFlowLps / 50) * 100), permissives);

            case 'PREPARE_GOVERNOR':
                // Move Distributor to Neutral, Reset Faults
                if (Date.now() - this.stepStartTime > 3000) {
                    this.transition('RELEASE_BRAKES');
                }
                return this.status('Initializing Governor...',
                    ((Date.now() - this.stepStartTime) / 3000) * 100, permissives);

            case 'RELEASE_BRAKES':
                if (airStatus.brakeReady) {
                    // Simulate brake release time
                    if (Date.now() - this.stepStartTime > 2000) {
                        this.transition('COMPLETED');
                    }
                }
                return this.status('Releasing Mechanical Brakes...',
                    ((Date.now() - this.stepStartTime) / 2000) * 100, permissives);

            case 'COMPLETED':
                return this.status('Sequence Complete. Unit Ready for Sync.', 100, permissives);

            case 'ABORTED':
                return this.status('Sequence Aborted.', 0, permissives);
        }

        return this.status('Unknown State', 0, permissives);
    }

    // --- Control Methods ---

    public static initiateStart(): boolean {
        if (this.currentState !== 'IDLE' && this.currentState !== 'ABORTED' && this.currentState !== 'COMPLETED') {
            return false; // Already running
        }
        this.transition('CHECK_PERMISSIVES');
        return true;
    }

    public static abortSequence(reason: string): void {
        this.abort(reason, { readyToStart: false, missingConditions: [], permissives: {} });
    }

    public static reset(): void {
        this.currentState = 'IDLE';
    }

    // --- Helpers ---

    private static transition(newState: StartState) {
        console.log(`[SovereignStart] Transition: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
        this.stepStartTime = Date.now();
    }

    private static abort(reason: string, permissives: PermissiveState): SequenceStatus {
        if (this.currentState !== 'ABORTED') {
            console.warn(`[SovereignStart] ABORT: ${reason}`);
            this.currentState = 'ABORTED';
        }
        return {
            state: 'ABORTED',
            stepProgress: 0,
            message: `ABORTED: ${reason}`,
            abortReason: reason,
            permissives
        };
    }

    private static status(msg: string, progress: number, permissives: PermissiveState): SequenceStatus {
        return {
            state: this.currentState,
            stepProgress: progress,
            message: msg,
            permissives
        };
    }
}
