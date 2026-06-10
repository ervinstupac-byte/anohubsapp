import Decimal from 'decimal.js';

// ============================================================================
// SYSTEM CONSTANTS (Inlined to avoid import issues in worker for now)
// ============================================================================
const GRAVITY = 9.81;
const WATER_DENSITY = 1000; // kg/m3

// ============================================================================
// MESSAGE TYPES
// ============================================================================
type WorkerMessage =
    | { id: string; type: 'CALCULATE_EFFICIENCY'; payload: { head: number; flow: number; alpha: number } }
    | { id: string; type: 'CALCULATE_CAVITATION'; payload: { npsh: number; head: number } }
    | { id: string; type: 'CALCULATE_WATER_HAMMER'; payload: { waveSpeed: number; deltaV: number } };

// ============================================================================
// PHYSICS LOGIC
// ============================================================================

const calculateEfficiency = (head: number, flow: number, alpha: number): number => {
    // Heavy Calculation: eta = f(H, Q, alpha)
    // Simulating computational load with high precision Decimal math
    const H = new Decimal(head);
    const Q = new Decimal(flow);
    const A = new Decimal(alpha);

    // Theoretical efficiency curve for Kaplan
    // eta = 0.95 - 0.001 * (abs(H - 30))^1.5 - 0.002 * (abs(Q - 100))^1.2

    // Simulate complex iterative solver if needed
    // In real Kaplan, this involves solving fluid momentum equations.
    // Here we use a high-order polynomial approximation.

    const diffH = H.minus(30).abs().pow(1.5).mul(0.001);
    const diffQ = Q.minus(100).abs().pow(1.2).mul(0.002);

    // Blade angle interaction (alpha) optimizes the curve
    // Optimal alpha for given H/Q usually minimizes losses.
    // If alpha is "wrong", efficiency drops sharply.
    // Heuristic: optimal alpha ~ (flow / head) * constant
    const optimalAlpha = Q.div(H).mul(1.5);
    const alphaDeviation = A.minus(optimalAlpha).abs();
    const alphaPenalty = alphaDeviation.pow(2).mul(0.0005);

    const efficiency = new Decimal(0.95).minus(diffH).minus(diffQ).minus(alphaPenalty);

    return Math.max(0, Math.min(100, efficiency.toNumber() * 100)); // Return %
};

const calculateCavitation = (npsh: number, head: number): number => {
    // Sigma = NPSH / H
    // Thoma Cavitation Coefficient
    const N = new Decimal(npsh);
    const H = new Decimal(head);

    if (H.isZero()) return 0;

    return N.div(H).toNumber();
};

const calculateWaterHammer = (waveSpeed: number, deltaV: number): number => {
    // Delta H = (a * Delta v) / g
    // Joukowsky Equation
    const a = new Decimal(waveSpeed);
    const dv = new Decimal(deltaV);
    const g = new Decimal(GRAVITY);

    return a.mul(dv).div(g).toNumber();
};

// ============================================================================
// WORKER LISTENER
// ============================================================================
console.log('[PhysicsWorker] 🚀 Engine ignited on background thread.');

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { id, type, payload } = e.data;
    const startTime = performance.now();

    let result;
    try {
        switch (type) {
            case 'CALCULATE_EFFICIENCY':
                result = calculateEfficiency(payload.head, payload.flow, payload.alpha);
                break;
            case 'CALCULATE_CAVITATION':
                result = calculateCavitation(payload.npsh, payload.head);
                break;
            case 'CALCULATE_WATER_HAMMER':
                result = calculateWaterHammer(payload.waveSpeed, payload.deltaV);
                break;
            default:
                throw new Error(`Unknown message type: ${(e.data as any).type}`);
        }

        self.postMessage({ id, type, result, duration: performance.now() - startTime });

    } catch (err) {
        self.postMessage({ id, type, error: String(err) });
    }
};
