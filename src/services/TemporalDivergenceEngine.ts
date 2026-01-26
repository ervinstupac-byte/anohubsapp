/**
 * TemporalDivergenceEngine.ts
 * 
 * Monte Carlo State-Space Simulator
 * Runs 1000 parallel futures to predict system stability
 * Triggers preemptive adjustments before breaches occur
 */

export interface StateVector {
    load: number; // MW
    frequency: number; // Hz
    reservoirLevel: number; // m
    temperature: number; // °C
    vibration: number; // mm/s
}

export interface SimulationOutcome {
    simulationId: number;
    timeAhead: number; // minutes
    finalState: StateVector;
    stabilityBreach: boolean;
    breachType?: string;
}

export interface DivergenceAnalysis {
    timestamp: number;
    timeHorizon: number; // minutes
    totalSimulations: number;
    breachProbability: number; // %
    preemptiveAction?: string;
}

export class TemporalDivergenceEngine {
    private static readonly SIMULATION_COUNT = 1000;
    private static readonly TIME_HORIZON = 10; // minutes
    private static readonly BREACH_THRESHOLD = 0.90; // 90%

    public static runMonteCarlo(currentState: StateVector): DivergenceAnalysis {
        console.log('[Temporal] Running 1000 Monte Carlo simulations...');

        const outcomes: SimulationOutcome[] = [];
        let breachCount = 0;
        const breachTypes = new Map<string, number>();

        for (let i = 0; i < this.SIMULATION_COUNT; i++) {
            const outcome = this.simulateFuture(i, currentState, this.TIME_HORIZON);
            outcomes.push(outcome);

            if (outcome.stabilityBreach) {
                breachCount++;
                const count = breachTypes.get(outcome.breachType!) || 0;
                breachTypes.set(outcome.breachType!, count + 1);
            }
        }

        const breachProbability = (breachCount / this.SIMULATION_COUNT) * 100;

        let preemptiveAction: string | undefined;
        if (breachProbability > this.BREACH_THRESHOLD * 100) {
            preemptiveAction = this.determinePreemptiveAction(breachTypes);
            console.log(`[Temporal] 🚨 BREACH PROBABILITY: ${breachProbability.toFixed(1)}%`);
            console.log(`[Temporal] Preemptive action: ${preemptiveAction}`);
        }

        const analysis: DivergenceAnalysis = {
            timestamp: Date.now(),
            timeHorizon: this.TIME_HORIZON,
            totalSimulations: this.SIMULATION_COUNT,
            breachProbability,
            preemptiveAction
        };

        return analysis;
    }

    private static simulateFuture(
        simId: number,
        initialState: StateVector,
        minutes: number
    ): SimulationOutcome {
        let state = { ...initialState };
        let stabilityBreach = false;
        let breachType: string | undefined;

        // Simulate forward with random perturbations
        const steps = minutes * 60; // 1 second steps
        for (let t = 0; t < steps; t++) {
            // Random walk with constraints
            state.load += (Math.random() - 0.5) * 0.5; // ±0.25 MW
            state.frequency += (Math.random() - 0.5) * 0.02; // ±0.01 Hz
            state.reservoirLevel += (Math.random() - 0.5) * 0.01; // ±0.005 m
            state.temperature += (Math.random() - 0.5) * 0.1; // ±0.05°C
            state.vibration += (Math.random() - 0.5) * 0.2; // ±0.1 mm/s

            // Check stability constraints
            if (state.frequency < 49.8 || state.frequency > 50.2) {
                stabilityBreach = true;
                breachType = 'FREQUENCY';
                break;
            }
            if (state.temperature > 155) {
                stabilityBreach = true;
                breachType = 'THERMAL';
                break;
            }
            if (state.vibration > 7.1) {
                stabilityBreach = true;
                breachType = 'VIBRATION';
                break;
            }
        }

        return {
            simulationId: simId,
            timeAhead: minutes,
            finalState: state,
            stabilityBreach,
            breachType
        };
    }

    private static determinePreemptiveAction(breachTypes: Map<string, number>): string {
        let maxType = '';
        let maxCount = 0;

        for (const [type, count] of breachTypes.entries()) {
            if (count > maxCount) {
                maxCount = count;
                maxType = type;
            }
        }

        switch (maxType) {
            case 'FREQUENCY':
                return 'REDUCE_LOAD_5MW';
            case 'THERMAL':
                return 'INCREASE_COOLING';
            case 'VIBRATION':
                return 'ACTIVATE_DAMPING';
            default:
                return 'MONITOR_CLOSELY';
        }
    }
}
