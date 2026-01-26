/**
 * GLOBAL HEALTH DASHBOARD
 * The Leaderboard of Trouble
 * 
 * Provides station-wide health assessment with intelligent priority scoring
 * and tie-breaker logic to determine which system needs attention first.
 */

import type { AssetLifecycle } from '../models/GlobalSiteHierarchy';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export interface SystemHealth {
    systemId: string;
    systemName: string;
    systemType: 'TURBINE' | 'GENERATOR' | 'TRANSFORMER' | 'CIVIL' | 'CONTROL' | 'HYDRAULIC';

    // Health Metrics
    healthStatus: 'HEALTHY' | 'WARNING' | 'ALARM' | 'CRITICAL';
    healthScore: number; // 0-100 (100 = perfect)

    // Issues
    activeIssues: SystemIssue[];

    // Priority Calculation
    priorityScore: number; // 0-100 (higher = more urgent)
    priorityBreakdown: {
        safetyRisk: number; // 0-50 points
        productionImpact: number; // 0-30 points
        assetHealth: number; // 0-20 points
    };

    // Lifecycle
    lifecycle?: AssetLifecycle;

    // Recommendations
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendedAction: string;
    estimatedDowntime?: number; // hours
}

export interface SystemIssue {
    issueId: string;
    description: string;
    severity: 'INFO' | 'WARNING' | 'ALARM' | 'CRITICAL';

    // Impact Factors
    safetyImpact: number; // 0-10
    productionImpact: number; // 0-10
    assetImpact: number; // 0-10

    // Context
    measurementValue?: number;
    measurementUnit?: string;
    threshold?: number;

    // Timing
    detectedAt: Date;
    timeSinceDetection: number; // hours
}

export interface GlobalHealthMap {
    timestamp: Date;
    stationName: string;

    // Overall Status
    overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    totalSystems: number;
    healthySystems: number;
    degradedSystems: number;
    criticalSystems: number;

    // All Systems (sorted by priority)
    systems: SystemHealth[];

    // Most Urgent System (after tie-breaker)
    mostUrgent: SystemHealth;

    // Summary
    totalIssues: number;
    criticalIssues: number;
    recommendations: string[];
}

// ============================================================================
// TIE-BREAKER RULES
// ============================================================================

export enum TieBreakerRule {
    // Rule 1: Safety first - electrical faults beat everything
    ELECTRICAL_SAFETY = 'ELECTRICAL_SAFETY',

    // Rule 2: Revenue protection - production loss matters
    PRODUCTION_IMPACT = 'PRODUCTION_IMPACT',

    // Rule 3: Time sensitivity - faster degradation = higher priority
    DEGRADATION_RATE = 'DEGRADATION_RATE',

    // Rule 4: Accessibility - easier fixes first
    ACCESSIBILITY = 'ACCESSIBILITY',

    // Rule 5: Safety chain - structural before mechanical
    SAFETY_CHAIN = 'SAFETY_CHAIN'
}

export interface TieBreakerResult {
    winner: SystemHealth;
    loser: SystemHealth;
    rule: TieBreakerRule;
    explanation: string;
}

// ============================================================================
// GLOBAL HEALTH DASHBOARD SERVICE
// ============================================================================

export class GlobalHealthDashboard {

    /**
     * THE LEADERBOARD OF TROUBLE
     * Calculates priority scores for all systems and ranks them
     */
    assessStationHealth(systems: SystemHealth[]): GlobalHealthMap {
        const timestamp = new Date();

        // Calculate priority scores for all systems
        const scoredSystems = systems.map(system => ({
            ...system,
            priorityScore: this.calculatePriorityScore(system),
            priorityBreakdown: this.calculatePriorityBreakdown(system)
        }));

        // Sort by priority (highest first)
        const sortedSystems = scoredSystems.sort((a, b) => {
            // If scores are equal, apply tie-breaker
            if (Math.abs(a.priorityScore - b.priorityScore) < 0.1) {
                const tieBreaker = this.applyTieBreaker(a, b);
                return tieBreaker.winner === a ? -1 : 1;
            }
            return b.priorityScore - a.priorityScore;
        });

        // Count systems by status
        const healthySystems = sortedSystems.filter(s => s.healthStatus === 'HEALTHY').length;
        const degradedSystems = sortedSystems.filter(s => s.healthStatus === 'WARNING' || s.healthStatus === 'ALARM').length;
        const criticalSystems = sortedSystems.filter(s => s.healthStatus === 'CRITICAL').length;

        // Determine overall health
        const overallHealth = criticalSystems > 0 ? 'CRITICAL' :
            degradedSystems > 0 ? 'DEGRADED' : 'HEALTHY';

        // Count issues
        const totalIssues = sortedSystems.reduce((sum, s) => sum + s.activeIssues.length, 0);
        const criticalIssues = sortedSystems.reduce((sum, s) =>
            sum + s.activeIssues.filter(i => i.severity === 'CRITICAL').length, 0);

        // Generate recommendations
        const recommendations = this.generateRecommendations(sortedSystems);

        return {
            timestamp,
            stationName: 'Hydropower Station',
            overallHealth,
            totalSystems: sortedSystems.length,
            healthySystems,
            degradedSystems,
            criticalSystems,
            systems: sortedSystems,
            mostUrgent: sortedSystems[0],
            totalIssues,
            criticalIssues,
            recommendations
        };
    }

    /**
     * PRIORITY SCORE CALCULATION
     * Score = (Safety Risk × 50) + (Production Impact × 30) + (Asset Health × 20)
     */
    calculatePriorityScore(system: SystemHealth): number {
        const breakdown = this.calculatePriorityBreakdown(system);
        return breakdown.safetyRisk + breakdown.productionImpact + breakdown.assetHealth;
    }

    /**
     * Calculate priority breakdown
     */
    calculatePriorityBreakdown(system: SystemHealth): SystemHealth['priorityBreakdown'] {
        // Aggregate impact scores from all issues
        const totalSafetyImpact = system.activeIssues.reduce((sum, issue) => sum + issue.safetyImpact, 0);
        const totalProductionImpact = system.activeIssues.reduce((sum, issue) => sum + issue.productionImpact, 0);
        const totalAssetImpact = system.activeIssues.reduce((sum, issue) => sum + issue.assetImpact, 0);

        // Normalize to 0-10 scale (max 3 critical issues per category)
        const maxImpact = 30; // 3 issues × 10 points each
        const normalizedSafety = Math.min(totalSafetyImpact / maxImpact, 1);
        const normalizedProduction = Math.min(totalProductionImpact / maxImpact, 1);
        const normalizedAsset = Math.min(totalAssetImpact / maxImpact, 1);

        // Apply weights
        const safetyRisk = normalizedSafety * 50; // max 50 points
        const productionImpact = normalizedProduction * 30; // max 30 points
        const assetHealth = normalizedAsset * 20; // max 20 points

        return {
            safetyRisk: Math.round(safetyRisk * 10) / 10,
            productionImpact: Math.round(productionImpact * 10) / 10,
            assetHealth: Math.round(assetHealth * 10) / 10
        };
    }

    /**
     * THE TIE-BREAKER LOGIC
     * When two systems have equal priority, which one gets attention first?
     */
    applyTieBreaker(systemA: SystemHealth, systemB: SystemHealth): TieBreakerResult {
        // Rule 1: ELECTRICAL_SAFETY - Electrical faults beat everything
        if (systemA.systemType === 'TRANSFORMER' || systemA.systemType === 'GENERATOR') {
            const hasElectricalFault = systemA.activeIssues.some(i =>
                i.description.includes('overcurrent') ||
                i.description.includes('ground fault') ||
                i.description.includes('field resistance')
            );
            if (hasElectricalFault) {
                return {
                    winner: systemA,
                    loser: systemB,
                    rule: TieBreakerRule.ELECTRICAL_SAFETY,
                    explanation: `⚡ ELECTRICAL SAFETY: ${systemA.systemName} has electrical fault. This can cause fire/explosion. Address before ${systemB.systemName}.`
                };
            }
        }

        if (systemB.systemType === 'TRANSFORMER' || systemB.systemType === 'GENERATOR') {
            const hasElectricalFault = systemB.activeIssues.some(i =>
                i.description.includes('overcurrent') ||
                i.description.includes('ground fault') ||
                i.description.includes('field resistance')
            );
            if (hasElectricalFault) {
                return {
                    winner: systemB,
                    loser: systemA,
                    rule: TieBreakerRule.ELECTRICAL_SAFETY,
                    explanation: `⚡ ELECTRICAL SAFETY: ${systemB.systemName} has electrical fault. This can cause fire/explosion. Address before ${systemA.systemName}.`
                };
            }
        }

        // Rule 2: PRODUCTION_IMPACT - Higher kW loss wins
        if (systemA.priorityBreakdown.productionImpact !== systemB.priorityBreakdown.productionImpact) {
            const winner = systemA.priorityBreakdown.productionImpact > systemB.priorityBreakdown.productionImpact ? systemA : systemB;
            const loser = winner === systemA ? systemB : systemA;
            return {
                winner,
                loser,
                rule: TieBreakerRule.PRODUCTION_IMPACT,
                explanation: `💰 PRODUCTION IMPACT: ${winner.systemName} has higher power loss (€/hour). Fix this first to stop the Money Leak!`
            };
        }

        // Rule 3: DEGRADATION_RATE - Faster degradation = higher priority
        const degradationRateA = this.calculateDegradationRate(systemA);
        const degradationRateB = this.calculateDegradationRate(systemB);
        if (degradationRateA !== degradationRateB) {
            const winner = degradationRateA > degradationRateB ? systemA : systemB;
            const loser = winner === systemA ? systemB : systemA;
            return {
                winner,
                loser,
                rule: TieBreakerRule.DEGRADATION_RATE,
                explanation: `⏱️ DEGRADATION RATE: ${winner.systemName} is deteriorating faster. If we wait, it will become critical!`
            };
        }

        // Rule 4: SAFETY_CHAIN - Structural before mechanical
        // (Foundation settlement can CAUSE turbine vibration)
        if (systemA.systemType === 'CIVIL' && systemB.systemType === 'TURBINE') {
            return {
                winner: systemA,
                loser: systemB,
                rule: TieBreakerRule.SAFETY_CHAIN,
                explanation: `🏗️ SAFETY CHAIN: ${systemA.systemName} settlement can CAUSE ${systemB.systemName} vibration. Fix foundation first!`
            };
        }

        if (systemB.systemType === 'CIVIL' && systemA.systemType === 'TURBINE') {
            return {
                winner: systemB,
                loser: systemA,
                rule: TieBreakerRule.SAFETY_CHAIN,
                explanation: `🏗️ SAFETY CHAIN: ${systemB.systemName} settlement can CAUSE ${systemA.systemName} vibration. Fix foundation first!`
            };
        }

        // Rule 5: ACCESSIBILITY - Easier fixes first (if no other factors)
        // This is a simplified rule - in real systems you'd have maintenance complexity data
        const winner = systemA; // Default to first system
        const loser = systemB;

        return {
            winner,
            loser,
            rule: TieBreakerRule.ACCESSIBILITY,
            explanation: `🔧 ACCESSIBILITY: Both systems are equally urgent. ${winner.systemName} is more accessible - fix it first for quick win.`
        };
    }

    /**
     * Calculate degradation rate (issues per hour)
     */
    private calculateDegradationRate(system: SystemHealth): number {
        if (system.activeIssues.length === 0) return 0;

        // Average time since detection
        const avgTime = system.activeIssues.reduce((sum, i) => sum + i.timeSinceDetection, 0) / system.activeIssues.length;

        // Issues per hour
        return avgTime > 0 ? system.activeIssues.length / avgTime : 0;
    }

    /**
     * Generate recommendations based on health map
     */
    private generateRecommendations(systems: SystemHealth[]): string[] {
        const recommendations: string[] = [];

        // Top 3 most urgent systems
        const top3 = systems.slice(0, 3);

        top3.forEach((system, index) => {
            if (system.healthStatus !== 'HEALTHY') {
                recommendations.push(
                    `${index + 1}. ${system.systemName}: ${system.recommendedAction} (Priority: ${system.priorityScore.toFixed(1)})`
                );
            }
        });

        return recommendations;
    }

    /**
     * Create a system health object from raw data
     */
    createSystemHealth(
        systemId: string,
        systemName: string,
        systemType: SystemHealth['systemType'],
        issues: SystemIssue[],
        healthScore: number = 100
    ): SystemHealth {
        // Determine health status based on issues
        const hasCritical = issues.some(i => i.severity === 'CRITICAL');
        const hasAlarm = issues.some(i => i.severity === 'ALARM');
        const hasWarning = issues.some(i => i.severity === 'WARNING');

        const healthStatus = hasCritical ? 'CRITICAL' :
            hasAlarm ? 'ALARM' :
                hasWarning ? 'WARNING' : 'HEALTHY';

        // Determine urgency
        const urgency = hasCritical ? 'CRITICAL' :
            hasAlarm ? 'HIGH' :
                hasWarning ? 'MEDIUM' : 'LOW';

        // Generate recommended action
        const recommendedAction = issues.length > 0
            ? `Address ${issues[0].description}`
            : 'Continue normal operation';

        return {
            systemId,
            systemName,
            systemType,
            healthStatus,
            healthScore,
            activeIssues: issues,
            priorityScore: 0, // Will be calculated by assessStationHealth
            priorityBreakdown: {
                safetyRisk: 0,
                productionImpact: 0,
                assetHealth: 0
            },
            urgency,
            recommendedAction
        };
    }
}
