import { describe, it, expect } from 'vitest';
import { MasterIntelligenceEngine } from '../MasterIntelligenceEngine';

describe('Commissioning Simulation (24h)', () => {
  it('runs a 24-hour simulated cycle and persists wisdom', async () => {
    // Create a minimal mock asset
    const asset: any = {
      id: 'SIM-001',
      name: 'Sim Turbine',
      turbine_family: 'FRANCIS',
      turbine_config: { rated_speed: 600, runner_diameter: 2.5, head: 150, flow_max: 50 }
    };

    // Create 24 hourly telemetry snapshots with gradual sensor drift and a grid event at hour 12
    const history: any[] = [];
    for (let h = 0; h < 24; h++) {
      const drift = h * 0.05; // slow increasing vibration/temp
      const gridEvent = (h === 12) ? { gridFrequency: 47.5 } : { gridFrequency: 50.0 };
      history.push({
        assetId: asset.id,
        timestamp: Date.now() - ((24 - h) * 3600 * 1000),
        common: {
          vibration: 1.5 + drift,
          temperature: 45 + drift * 2,
          output_power: 3.8 + (Math.random() - 0.5) * 0.2,
          efficiency: 88 - drift * 0.1
        },
        specialized: {
          flowRate: 42 + (Math.random() - 0.5) * 2,
          governorHPUTelemetry: [],
          magneticData: null
        }
      });
    }

    const diagnosis = await MasterIntelligenceEngine.analyzeAsset(asset as any, history as any);
    expect(diagnosis).toBeDefined();
    // Ensure persistence loop attached an id
    expect((diagnosis as any).persistedWisdomId).toBeTruthy();
  }, 20000);
});
