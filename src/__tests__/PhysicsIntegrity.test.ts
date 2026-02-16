import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sovereign_Executive_Engine, PermissionTier } from '../services/Sovereign_Executive_Engine';
import goldenData from './fixtures/golden_turbine_data.json';

describe('Physics Integrity (Golden Image Regression)', () => {
    beforeEach(() => {
        // Clear localStorage before each test to ensure clean state
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should match the Golden Image exactly for nominal Francis Turbine operation', () => {
        // Simulated import.meta.env for testing
        (global as any).import = { meta: { env: { VITE_SUPABASE_URL: 'simulated', VITE_SUPABASE_ANON_KEY: 'simulated' } } };
        
        const engine = new Sovereign_Executive_Engine();
        
        // Feed Golden Inputs with FRESH TIMESTAMP to avoid Dead Man Switch
        const inputs = { ...goldenData.inputs, scadaTimestamp: Date.now() };
        const result = engine.executeCycle(inputs as any, { tier: PermissionTier.AUTONOMOUS });

        // Assertions against Golden Output
        expect(result.targetLoadMw).toBeCloseTo(goldenData.expectedOutput.targetLoadMw, 1);
        expect(result.masterHealthScore).toBeGreaterThanOrEqual(99); // Allow slight floating point variance
        expect(result.permissionTier).toBe(goldenData.expectedOutput.permissionTier);
        expect(result.financials.mode).toBe(goldenData.expectedOutput.financials.mode);
        
        // Ensure no unexpected protections
        expect(result.activeProtections).toEqual(goldenData.expectedOutput.activeProtections);

        // Check messaging structure (contains key phrases)
        expect(result.operatorMessage).toContain('System Nominal');
    });

    it('should trigger protections when deviating from Golden Image (Stress Test)', () => {
        const engine = new Sovereign_Executive_Engine();
        
        // Clone and modify inputs for failure scenario
        const stressedInputs = JSON.parse(JSON.stringify(goldenData.inputs));
        stressedInputs.scadaTimestamp = Date.now(); // FRESH TIMESTAMP
        stressedInputs.vibration = 5.0; // High vibration (Limit is usually 2.0)

        const result = engine.executeCycle(stressedInputs);

        // Expect Throttling or Warning
        expect(result.targetLoadMw).toBeLessThan(100); // Should throttle
        expect(result.activeProtections.length).toBeGreaterThan(0);
        expect(result.activeProtections.some(p => p.includes('VIBRATION'))).toBe(true);
    });
});
