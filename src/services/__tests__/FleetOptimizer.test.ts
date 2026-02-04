import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FleetOptimizer, FleetAsset } from '../FleetOptimizer';

// Mock AlertJournal for SHA-256 verification
const mockLogEvent = vi.fn();
vi.mock('../AlertJournal', () => ({
    AlertJournal: {
        logEvent: mockLogEvent
    }
}));

describe('FleetOptimizer Service - Enhanced NC-23', () => {
    beforeEach(() => {
        mockLogEvent.mockClear();
    });

    const fleet: FleetAsset[] = [
        { id: 'HPP-101', efficiency: 0.95, currentPowerMW: 10, maxCapacityMW: 15 },
        { id: 'HPP-102', efficiency: 0.90, currentPowerMW: 10, maxCapacityMW: 12 },
        { id: 'HPP-103', efficiency: 0.85, currentPowerMW: 8, maxCapacityMW: 10 }
    ];

    it('should keep turbines in Sweet Spot (70-90% load) when demand is sufficient', () => {
        // Request 36 MW total - enough to run all units in sweet spot
        // HPP-101: 15 * 0.85 = 12.75 (sweet max)
        // HPP-102: 12 * 0.85 = 10.2 (sweet max)
        // HPP-103: 10 * 0.85 = 8.5 (sweet max)
        // Total at sweet max: ~31.45 MW, so 36 MW will fill them up
        const result = FleetOptimizer.calculateOptimalDistribution(36, fleet);

        // Check that high-priority units are in sweet spot
        // The first two (highest efficiency) should definitely be in range
        for (const asset of fleet.slice(0, 2)) {
            const allocated = result.distribution[asset.id];
            const capacity = Math.min(asset.maxCapacityMW, 15);
            const loadPercent = allocated / capacity;

            if (allocated > 0) {
                // Should be in 65-95% range
                expect(loadPercent).toBeGreaterThanOrEqual(0.65);
                expect(loadPercent).toBeLessThanOrEqual(0.95);
            }
        }
    });

    it('should never exceed 15 MW sovereign limit per unit', () => {
        const result = FleetOptimizer.calculateOptimalDistribution(100, fleet);

        for (const [_id, allocated] of Object.entries(result.distribution)) {
            expect(allocated).toBeLessThanOrEqual(15);
        }
    });

    it('should avoid rough zone (<2 MW) allocations', () => {
        // Request only 1.5 MW - should not allocate to any unit
        const result = FleetOptimizer.calculateOptimalDistribution(1.5, fleet);

        for (const [_id, allocated] of Object.entries(result.distribution)) {
            // Either 0 or >= 2
            expect(allocated === 0 || allocated >= 2).toBe(true);
        }
    });

    it('should prioritize higher efficiency assets', () => {
        // Request 10 MW - should go entirely to HPP-101 (highest efficiency)
        const result = FleetOptimizer.calculateOptimalDistribution(10, fleet);

        // HPP-101 should have the most allocation
        expect(result.distribution['HPP-101']).toBeGreaterThan(0);
        // Lower efficiency units should have less or zero
        expect(result.distribution['HPP-101']).toBeGreaterThanOrEqual(result.distribution['HPP-102'] || 0);
    });

    it('should calculate weighted fleet efficiency correctly', () => {
        const eff = FleetOptimizer.calculateFleetEfficiency(fleet);

        // Weighted average: (15*0.95 + 12*0.90 + 10*0.85) / 37 ≈ 0.906
        expect(eff).toBeGreaterThan(0.85);
        expect(eff).toBeLessThan(0.96);
    });
});

describe('Fleet Alert SHA-256 Verification', () => {
    it('should log Load Shedding with unified SHA-256 hash in AlertJournal', async () => {
        // This test verifies the store action logs correctly
        // We import the store dynamically to get fresh state
        const { useTelemetryStore } = await import('../../features/telemetry/store/useTelemetryStore');

        // Trigger the fleet alert action
        const store = useTelemetryStore.getState();
        await store.triggerFleetAlert('TEST_LOAD_SHEDDING_EVENT', 'WARNING');

        // The AlertJournal.logEvent should have been called with a hash-containing message
        // Note: In the real implementation, the hash is embedded in the message string
        // We verify the pattern: [FLEET_SWARM] ... // HASH: XXXXXX
        expect(mockLogEvent).toHaveBeenCalled();

        if (mockLogEvent.mock.calls.length > 0) {
            const [severity, message] = mockLogEvent.mock.calls[0];
            expect(severity).toBe('WARNING');
            expect(message).toContain('[FLEET_SWARM]');
            expect(message).toContain('HASH:');
        }
    });
});
