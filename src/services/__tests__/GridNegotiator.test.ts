import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FleetAsset } from '../FleetOptimizer';

// Unmock GridNegotiator to test the real implementation
vi.unmock('../GridNegotiator');

// Mock only AlertJournal (dependency)
vi.mock('../AlertJournal', () => ({
    AlertJournal: {
        logEvent: vi.fn()
    }
}));

// Mock FleetOptimizer (dependency)
vi.mock('../FleetOptimizer', () => ({
    FleetOptimizer: {
        calculateOptimalDistribution: vi.fn((requestedMW: number) => ({
            totalAllocatedMW: requestedMW,
            allocations: []
        }))
    },
    FleetAsset: {}
}));

// Import after mocks are set up
import { GridNegotiator, GridRequest } from '../GridNegotiator';
import { AlertJournal } from '../AlertJournal';

describe('GridNegotiator Service - NC-27', () => {
    beforeEach(() => {
        vi.mocked(AlertJournal.logEvent).mockClear();
    });

    const fleet: FleetAsset[] = [
        { id: 'HPP-101', efficiency: 0.95, currentPowerMW: 10, maxCapacityMW: 15 },
        { id: 'HPP-102', efficiency: 0.90, currentPowerMW: 10, maxCapacityMW: 12 },
        { id: 'HPP-103', efficiency: 0.85, currentPowerMW: 8, maxCapacityMW: 10 }
    ];

    describe('Sovereign Limit & Grid Handshake', () => {
        it('should enforce 15 MW sovereign limit per unit and ACCEPT valid requests', async () => {
            const request: GridRequest = {
                requestId: 'GR-001',
                requestedMW: 30, // 30 MW / 3 units = 10 MW per unit (under 15 MW limit)
                duration: 'HOUR',
                priority: 'NORMAL',
                timestamp: Date.now()
            };

            const result = await GridNegotiator.negotiate(request, fleet);

            // Should accept since per-unit load (10 MW) is under 15 MW limit
            expect(result.status).toBe('ACCEPTED');
            expect(result.approvedMW).toBeGreaterThan(0);
            expect(result.signature).toBeDefined();
            expect(result.signature.length).toBe(64); // SHA-256 hex = 64 chars
            expect(result.protocolVersion).toContain('IEC61850');
        });

        it('should log all negotiation events to AlertJournal', async () => {
            const request: GridRequest = {
                requestId: 'GR-003',
                requestedMW: 25,
                duration: 'DAY',
                priority: 'NORMAL',
                timestamp: Date.now()
            };

            await GridNegotiator.negotiate(request, fleet);

            expect(AlertJournal.logEvent).toHaveBeenCalled();
        });

        it('should calculate correct operating range from fleet', () => {
            const range = GridNegotiator.getAvailableOperatingRange(fleet);

            // Total max: min(15,15) + min(12,15) + min(10,15) = 15 + 12 + 10 = 37 MW
            expect(range.maxMW).toBe(37);
            // Min: 3 units * 2 MW = 6 MW
            expect(range.minMW).toBe(6);
            // Sweet spot: 37 * 0.85 = 31.45 MW
            expect(range.sweetSpotMW).toBeCloseTo(31.45, 1);
        });
    });
});
