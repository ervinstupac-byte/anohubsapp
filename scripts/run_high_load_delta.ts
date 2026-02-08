import { useTelemetryStore } from '../src/features/telemetry/store/useTelemetryStore';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  const start = Date.now();
  const durationMs = 10000; // 10 seconds
  const tickMs = 200; // 5 Hz updates

  console.log('[High-Load] Starting 10s simulation: increasing hydraulic flow and head');

  while (Date.now() - start < durationMs) {
    const t = (Date.now() - start) / 1000;
    const head = 50 + 5 * Math.sin(t); // modest oscillation around 50 m
    const flow = 30 + 3 * Math.cos(t); // oscillation around 30 m3/s
    const efficiency = 0.92; // hold near nominal fractional

    useTelemetryStore.getState().updateTelemetry({
      hydraulic: { head, flow, efficiency }
    });
    await sleep(tickMs);
  }

  const final = useTelemetryStore.getState();
  const delta = typeof final.deltaToOptimum === 'number' ? final.deltaToOptimum : NaN;
  const hydraulic = final.hydraulic;
  const physics = final.physics;
  console.log('[High-Load] Complete.');
  console.log('Final hydraulic:', { head: hydraulic.head, flow: hydraulic.flow, efficiency: hydraulic.efficiency });
  console.log('Final physics:', physics);
  console.log(`Detected Efficiency Delta (Δ): ${Number.isNaN(delta) ? 'N/A' : delta.toFixed(2) + '%'}`);
}

run().catch(e => {
  console.error('[High-Load] Simulation error:', e);
  process.exit(1);
});
