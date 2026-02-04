/**
 * Protocol NC-27: Autonomous Grid Handshake
 * 
 * IEC 61850-compliant grid negotiation service.
 * Implements handshake protocol between Fleet and external Grid Controller.
 * Enforces Sovereign Tier 1 limit of 15 MW per unit.
 */

import { FleetOptimizer, FleetAsset } from './FleetOptimizer';
import { AlertJournal } from './AlertJournal';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SOVEREIGN_LIMIT_MW = 15.0; // Tier 1 absolute maximum per unit
const SWEET_SPOT_LOAD = 0.85;    // 85% optimal load for wear reduction
const PROTOCOL_VERSION = 'IEC61850-NC27-v1.0';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OperatingRange {
    minMW: number;
    maxMW: number;
    sweetSpotMW: number;     // Optimal load for wear/revenue balance
    sustainabilityScore: number; // 0-100, higher = less wear
}

export interface GridRequest {
    requestId: string;
    requestedMW: number;
    duration: 'SPOT' | 'HOUR' | 'DAY' | 'WEEK';
    priority: 'NORMAL' | 'HIGH' | 'EMERGENCY';
    timestamp: number;
}

export type NegotiationStatus =
    | 'ACCEPTED'
    | 'DECLINED'
    | 'COUNTER_OFFER'
    | 'PENDING';

export interface NegotiationResult {
    status: NegotiationStatus;
    approvedMW: number;
    reason?: string;
    counterOfferMW?: number;
    sustainabilityScore: number;
    protocolVersion: string;
    signature: string; // SHA-256 hash of negotiation
}

export interface GridController {
    id: string;
    name: string;
    region: string;
}

// ═══════════════════════════════════════════════════════════════
// GRID NEGOTIATOR SERVICE
// ═══════════════════════════════════════════════════════════════

class GridNegotiatorService {
    private activeController: GridController | null = null;
    private negotiationHistory: NegotiationResult[] = [];

    /**
     * Establishes connection with a Grid Controller (IEC 61850 handshake)
     */
    async connect(controller: GridController): Promise<boolean> {
        this.activeController = controller;

        await AlertJournal.logEvent('INFO',
            `[NC-27] Grid handshake initiated with ${controller.name} (${controller.region}) // PROTOCOL: ${PROTOCOL_VERSION}`
        );

        return true;
    }

    /**
     * Disconnects from the current Grid Controller
     */
    async disconnect(): Promise<void> {
        if (this.activeController) {
            await AlertJournal.logEvent('INFO',
                `[NC-27] Grid handshake terminated with ${this.activeController.name}`
            );
            this.activeController = null;
        }
    }

    /**
     * Gets the available operating range from the fleet
     */
    getAvailableOperatingRange(fleet: FleetAsset[]): OperatingRange {
        // Calculate total fleet capacity
        let totalMaxMW = 0;
        let totalMinMW = 0;

        for (const asset of fleet) {
            const effectiveMax = Math.min(asset.maxCapacityMW, SOVEREIGN_LIMIT_MW);
            totalMaxMW += effectiveMax;
            totalMinMW += 2.0; // Minimum operating load per unit (avoid rough zone)
        }

        const sweetSpotMW = totalMaxMW * SWEET_SPOT_LOAD;
        const sustainabilityScore = this.calculateSustainabilityScore(SWEET_SPOT_LOAD);

        return {
            minMW: totalMinMW,
            maxMW: totalMaxMW,
            sweetSpotMW,
            sustainabilityScore
        };
    }

    /**
     * Negotiates a power request from the Grid Controller.
     * Enforces the 15 MW Sovereign Tier 1 limit per unit.
     */
    async negotiate(request: GridRequest, fleet: FleetAsset[]): Promise<NegotiationResult> {
        const timestamp = Date.now();
        const operatingRange = this.getAvailableOperatingRange(fleet);

        // ═══════════════════════════════════════════════════════════
        // SOVEREIGN LIMIT ENFORCEMENT (Per-Unit Check)
        // ═══════════════════════════════════════════════════════════

        // Check if any single unit would exceed 15 MW
        const requestPerUnit = request.requestedMW / Math.max(fleet.length, 1);

        if (requestPerUnit > SOVEREIGN_LIMIT_MW) {
            const result = await this.createDeclinedResult(
                request,
                'SOVEREIGN_TIER_1_VIOLATION',
                operatingRange.sweetSpotMW
            );

            await AlertJournal.logEvent('CRITICAL',
                `[NC-27] DECLINED: Request ${request.requestId} exceeds 15 MW sovereign limit (${requestPerUnit.toFixed(2)} MW/unit) // HASH: ${result.signature.substring(0, 16)}`
            );

            return result;
        }

        // ═══════════════════════════════════════════════════════════
        // CAPACITY CHECK
        // ═══════════════════════════════════════════════════════════

        if (request.requestedMW > operatingRange.maxMW) {
            // Can't fulfill - offer max available
            const result = await this.createCounterOfferResult(
                request,
                operatingRange.maxMW,
                'INSUFFICIENT_CAPACITY'
            );

            await AlertJournal.logEvent('WARNING',
                `[NC-27] COUNTER_OFFER: Request ${request.requestId} reduced to ${operatingRange.maxMW.toFixed(2)} MW (fleet limit)`
            );

            return result;
        }

        // ═══════════════════════════════════════════════════════════
        // SWEET SPOT OPTIMIZATION
        // ═══════════════════════════════════════════════════════════

        // If request is within sweet spot, accept with high sustainability
        const loadRatio = request.requestedMW / operatingRange.maxMW;
        const sustainabilityScore = this.calculateSustainabilityScore(loadRatio);

        // Use FleetOptimizer to validate distribution
        const distribution = FleetOptimizer.calculateOptimalDistribution(request.requestedMW, fleet);

        // Create acceptance result
        const result = await this.createAcceptedResult(
            request,
            distribution.totalAllocatedMW,
            sustainabilityScore
        );

        await AlertJournal.logEvent('INFO',
            `[NC-27] ACCEPTED: Request ${request.requestId} for ${distribution.totalAllocatedMW.toFixed(2)} MW // Sustainability: ${sustainabilityScore}/100 // HASH: ${result.signature.substring(0, 16)}`
        );

        this.negotiationHistory.push(result);
        return result;
    }

    /**
     * Calculates sustainability score (0-100) based on load ratio
     * Higher = less wear, more sustainable operation
     */
    calculateSustainabilityScore(loadRatio: number): number {
        // Sweet spot (70-90%) gets highest score
        if (loadRatio >= 0.70 && loadRatio <= 0.90) {
            // Peak at 85%
            const deviation = Math.abs(loadRatio - 0.85);
            return Math.round(95 - (deviation * 100));
        }

        // Below sweet spot (50-70%)
        if (loadRatio >= 0.50 && loadRatio < 0.70) {
            return Math.round(60 + (loadRatio - 0.50) * 100);
        }

        // Above sweet spot (90-100%)
        if (loadRatio > 0.90 && loadRatio <= 1.0) {
            return Math.round(80 - (loadRatio - 0.90) * 300);
        }

        // Rough zone (<50%) or overload (>100%)
        return Math.max(0, Math.round(loadRatio * 50));
    }

    /**
     * Gets negotiation history
     */
    getHistory(): NegotiationResult[] {
        return [...this.negotiationHistory];
    }

    // ═══════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════

    private async generateSignature(data: object): Promise<string> {
        const payload = JSON.stringify(data);
        const msgBuffer = new TextEncoder().encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private async createAcceptedResult(
        request: GridRequest,
        approvedMW: number,
        sustainabilityScore: number
    ): Promise<NegotiationResult> {
        const data = { request, approvedMW, status: 'ACCEPTED', timestamp: Date.now() };
        const signature = await this.generateSignature(data);

        return {
            status: 'ACCEPTED',
            approvedMW,
            sustainabilityScore,
            protocolVersion: PROTOCOL_VERSION,
            signature
        };
    }

    private async createDeclinedResult(
        request: GridRequest,
        reason: string,
        counterOfferMW: number
    ): Promise<NegotiationResult> {
        const data = { request, reason, status: 'DECLINED', timestamp: Date.now() };
        const signature = await this.generateSignature(data);

        return {
            status: 'DECLINED',
            approvedMW: 0,
            reason,
            counterOfferMW,
            sustainabilityScore: 0,
            protocolVersion: PROTOCOL_VERSION,
            signature
        };
    }

    private async createCounterOfferResult(
        request: GridRequest,
        counterOfferMW: number,
        reason: string
    ): Promise<NegotiationResult> {
        const sustainabilityScore = this.calculateSustainabilityScore(
            counterOfferMW / (counterOfferMW / 0.85)
        );
        const data = { request, counterOfferMW, reason, status: 'COUNTER_OFFER', timestamp: Date.now() };
        const signature = await this.generateSignature(data);

        return {
            status: 'COUNTER_OFFER',
            approvedMW: 0,
            reason,
            counterOfferMW,
            sustainabilityScore,
            protocolVersion: PROTOCOL_VERSION,
            signature
        };
    }
}

// Singleton export
export const GridNegotiator = new GridNegotiatorService();
