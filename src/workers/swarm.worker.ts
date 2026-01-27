// NC-90: Multi-Agent Simulation Swarm Worker Skeleton
// Purpose: Simulate cascade of 3-5 power plants simultaneously.

// ============================================================================
// MESSAGE TYPES
// ============================================================================
type SwarmMessage =
    | { type: 'INIT_SWARM'; payload: { plants: number } }
    | { type: 'UPDATE_CASCADE'; payload: { flow: number } }
    | { type: 'TERMINATE' };

// ============================================================================
// SWARM STATE
// ============================================================================
let swarmActive = false;
let plants: any[] = [];

// ============================================================================
// LOGIC
// ============================================================================

const initializeSwarm = (count: number) => {
    plants = Array.from({ length: count }).map((_, i) => ({
        id: `HPP-${i + 1}`,
        flow: 10,
        head: 100 - (i * 10), // Cascade head loss
        output: 0
    }));
    swarmActive = true;
    console.log(`[SwarmWorker] 🐝 Initialized swarm with ${count} agents`);
};

const simulateStep = (inputFlow: number) => {
    if (!swarmActive) return;

    // Simulate flow propagation through cascade
    let currentFlow = inputFlow;

    const results = plants.map(plant => {
        // Simple logic placeholder
        // In real NC-90, this would call Physics Logic for each plant
        const efficiency = 0.9 + (Math.random() * 0.05);
        const power = 9.81 * plant.head * currentFlow * efficiency;

        // Flow downstream (minus loss/evaporation)
        currentFlow = currentFlow * 0.98;

        return {
            id: plant.id,
            powerMW: power / 1000,
            flowOut: currentFlow
        };
    });

    self.postMessage({ type: 'SWARM_UPDATE', payload: results });
};

// ============================================================================
// LISTENER
// ============================================================================
self.onmessage = (e: MessageEvent<SwarmMessage>) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT_SWARM':
            initializeSwarm((payload as any).plants);
            break;
        case 'UPDATE_CASCADE':
            simulateStep((payload as any).flow);
            break;
        case 'TERMINATE':
            swarmActive = false;
            plants = [];
            break;
    }
};
