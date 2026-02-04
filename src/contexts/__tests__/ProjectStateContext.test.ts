import { describe, it, expect, beforeEach } from 'vitest';
import ProjectStateManager from '../ProjectStateContext';
import { EventJournal } from '../../services/EventJournal';
import { DEFAULT_TECHNICAL_STATE } from '../../core/TechnicalSchema';

describe('ProjectStateManager canonical sync (NC-94)', () => {
    beforeEach(() => {
        // reset canonical state to defaults
        try { ProjectStateManager.setState(DEFAULT_TECHNICAL_STATE as any); } catch (e) { }
    });

    it('flags efficiency discrepancy and writes canonical efficiency', () => {
        const telemetry: Record<string, any> = {
            'asset-x': {
                assetId: 'asset-x',
                timestamp: Date.now(),
                output: 0.05, // MW (very small)
                pumpFlowRate: 1, // m3/s
                reservoirLevel: 122.5,
                head_m: 122.5,
                flow_m3s: 1,
                efficiency: 5 // % (deliberately low)
            }
        };

        const assets = [{ id: 'asset-x', name: 'Test Asset', specs: { designHead: 122.5 }, capacity: 0.05, status: 'Operational' }];

        ProjectStateManager.updateFromTelemetry(telemetry, assets as any);

        const recent = EventJournal.recent(20);
        const found = recent.find(r => r.type === 'efficiency_discrepancy');
        expect(found).toBeTruthy();

        const state = ProjectStateManager.getState();
        // canonical efficiency should be a number between 0 and 1
        expect(typeof state.hydraulic.efficiency).toBe('number');
        expect(state.hydraulic.efficiency).toBeGreaterThanOrEqual(0);
        expect(state.hydraulic.efficiency).toBeLessThanOrEqual(1);
    });
});
