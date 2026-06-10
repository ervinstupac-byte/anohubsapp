/**
 * ForensicDiagnosticService.ts
 * 
 * The "Sherlock Holmes" of the system.
 * When an anomaly occurs, this service reconstructs the crime scene (Causal Chain)
 * by tracing correlations back to their likely physical origin.
 */

import { SovereignGlobalState, GlobalState } from './SovereignGlobalState';
import { CrossCorrelationService } from './CrossCorrelationService';

export interface CausalNode {
    metric: string;
    value: number;
    contribution: number; // 0-1 confidence/correlation strength
    timestamp: number;
}

export interface CausalChain {
    rootCause: CausalNode;
    path: CausalNode[];
    finalSymptom: CausalNode;
    description: string;
}

export class ForensicDiagnosticService {

    /**
     * Diagnoses a specific symptom by tracing back through the correlation web.
     * @param symptomMetric The name of the metric showing anomaly (e.g. 'vibration')
     * @param state Snapshot of the current global state (or fetch current if null)
     */
    public static diagnose(symptomMetric: string, state: GlobalState = SovereignGlobalState.getState()): CausalChain {

        // 1. Identify the Symptom Node
        const symptomValue = (state.physics as any)[symptomMetric] || 0;

        const endNode: CausalNode = {
            metric: symptomMetric,
            value: symptomValue,
            contribution: 1.0,
            timestamp: state.timestamp
        };

        // 2. Scan for strong correlations effectively acting as "Causes"
        // In a real physics engine, we use directed graphs (A causes B).
        // Here, we infer causality from "Gravity Maps" (Physics Priors) + Live Correlation.

        // Simplified Gravity Map: [Cause] -> [Effect]
        // We look for variables that are correlated AND represent "upstream" physics.
        // e.g. Temperature -> Vibration. Pressure -> Flow.

        const path: CausalNode[] = [];
        let rootNode = endNode;

        // Mock Logic for MVP: Scan known upstream suspects if correlated
        // If Vibration is the symptom, check Temperature.
        if (symptomMetric === 'vibration') {
            const temp = state.physics.temperature;
            // Check correlation
            // We need a history buffer to check live correlation, but for this snapshot diagnosis
            // we will assume the correlation was flagged by CNS (CrossCorrelationService).
            // Let's assume passed in strictly or check if high.

            // For MVP logic: If Temp is High (>40) and we assume it's correlated
            if (temp > 40) {
                const causeNode: CausalNode = {
                    metric: 'temperature',
                    value: temp,
                    contribution: 0.92, // Strong correlation presumed
                    timestamp: state.timestamp
                };
                path.push(causeNode);
                rootNode = causeNode;

                // Go deeper? If Temp is high, check Cooling/Flow?
                // If Pressure is low?
                // ...
            }
        }

        // Construct Chain
        const finalPath = [rootNode, ...path.filter(n => n !== rootNode)]; // Ensure root is first? 
        // Typically Path is Root -> Intermediate -> Symptom.
        // Our 'path' array currently has just the cause.

        const fullChainInOrder = [rootNode, endNode]; // Simple 2-step for now if found

        return {
            rootCause: rootNode,
            path: fullChainInOrder,
            finalSymptom: endNode,
            description: rootNode !== endNode
                ? `Root Cause Analysis: ${rootNode.metric} (${rootNode.value.toFixed(1)}) driven anomaly in ${endNode.metric}.`
                : `Anomaly is isolated. No upstream correlation found.`
        };
    }
}
