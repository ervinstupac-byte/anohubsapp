/**
 * EdgeNeuralNode.ts
 * 
 * Local Inference Engine (Edge Computing)
 * Runs critical protection models directly on the unit controller (PLC/Edge Gateway).
 * Bypasses central server for microsecond-level response to critical events (Vibration, Cavitation).
 */

export interface InferenceResult {
    modelId: string;
    timestamp: number;
    outputProbability: number;
    inferenceTimeMs: number;
    actionTaken: 'NONE' | 'TRIP' | 'ALARM';
}

export class EdgeNeuralNode {
    // Simulated models loaded in memory
    private static models = new Map<string, any>([
        ['VIBRATION_PREDICTOR_V2', { threshold: 0.85 }],
        ['CAVITATION_DETECTOR_V4', { threshold: 0.90 }]
    ]);

    /**
     * RUN LOCAL INFERENCE
     * Low latency execution path.
     */
    public static runInference(
        modelId: string,
        inputs: number[] // Raw sensor data vector
    ): InferenceResult {
        const start = performance.now();

        // Mock Model Logic (Matrix multiplication simulation)
        // In real life: TensorFlow Lite or ONNX Runtime interaction
        const sum = inputs.reduce((a, b) => a + b, 0);
        const avg = sum / (inputs.length || 1);

        // Simulate a probability output based on input intensity
        // Higher input values -> Higher probability of failure for these specific models
        // Normalized 0-1
        const probability = Math.min(1.0, Math.abs(avg) / 10.0);

        const end = performance.now();
        const latency = end - start;

        // Trigger Logic
        const config = this.models.get(modelId);
        let action: InferenceResult['actionTaken'] = 'NONE';

        if (config && probability > config.threshold) {
            // CRITICAL: High Probability of Failure
            action = 'TRIP';
            console.error(`[EdgeNode] ⚡ FAST TRIP: ${modelId} prob ${probability.toFixed(2)} > ${config.threshold}. Latency: ${latency.toFixed(3)}ms`);
        } else if (config && probability > (config.threshold - 0.15)) {
            action = 'ALARM';
        }

        return {
            modelId,
            timestamp: Date.now(),
            outputProbability: probability,
            inferenceTimeMs: latency,
            actionTaken: action
        };
    }
}
