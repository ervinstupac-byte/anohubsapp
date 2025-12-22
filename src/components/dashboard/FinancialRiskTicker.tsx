/**
 * FinancialRiskTicker Component
 * Revenue at risk calculation with breakdown
 */

import React from 'react';
import { motion } from 'framer-motion';

interface FinancialRisk {
    totalRevenueAtRisk: number;  // EUR
    breakdown: {
        downtime: number;
        efficiency: number;
        emergency: number;
    };
    criticalFindings: number;
    daysToAction: number;
}

interface FinancialRiskTickerProps {
    risk: FinancialRisk;
}

export const FinancialRiskTicker: React.FC<FinancialRiskTickerProps> = ({ risk }) => {
    return (
        <div className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">💰</span>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-300">Revenue at Risk</h3>
                    <p className="text-sm text-red-200/70">Next {risk.daysToAction} days if issues not addressed</p>
                </div>
            </div>

            <motion.div
                className="text-5xl font-bold text-red-400 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
            >
                €{risk.totalRevenueAtRisk.toLocaleString()}
            </motion.div>

            <div className="grid grid-cols-3 gap-4 text-sm">
                <motion.div
                    className="bg-red-950/50 rounded p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="text-red-300/70 mb-1">Downtime Risk</div>
                    <div className="text-red-200 font-bold text-lg">
                        €{risk.breakdown.downtime.toLocaleString()}
                    </div>
                </motion.div>

                <motion.div
                    className="bg-red-950/50 rounded p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="text-red-300/70 mb-1">Efficiency Loss</div>
                    <div className="text-red-200 font-bold text-lg">
                        €{risk.breakdown.efficiency.toLocaleString()}
                    </div>
                </motion.div>

                <motion.div
                    className="bg-red-950/50 rounded p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="text-red-300/70 mb-1">Emergency Repair</div>
                    <div className="text-red-200 font-bold text-lg">
                        €{risk.breakdown.emergency.toLocaleString()}
                    </div>
                </motion.div>
            </div>

            {risk.criticalFindings > 0 && (
                <motion.div
                    className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-sm text-red-200 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <span className="text-lg">🚨</span>
                    <span>
                        {risk.criticalFindings} CRITICAL AI finding{risk.criticalFindings > 1 ? 's' : ''} require immediate attention
                    </span>
                </motion.div>
            )}
        </div>
    );
};

/**
 * Calculate financial risk from health score and findings
 */
export function calculateFinancialRisk(
    healthScore: number,
    criticalFindingsCount: number,
    electricityPriceEURperMWh: number,
    ratedPowerMW: number
): FinancialRisk {
    let downtimeRisk = 0;
    let efficiencyRisk = 0;
    let emergencyRisk = 0;

    // Health score impact on downtime
    if (healthScore < 70) {
        // RED zone: 7 days downtime risk
        downtimeRisk = 7 * 20 * ratedPowerMW * electricityPriceEURperMWh;
        emergencyRisk = 25000;  // Base emergency repair cost
    } else if (healthScore < 90) {
        // YELLOW zone: 2 days downtime risk
        downtimeRisk = 2 * 20 * ratedPowerMW * electricityPriceEURperMWh;
    }

    // Efficiency loss (1% per 10 points below 100)
    const efficiencyLossFactor = (100 - healthScore) / 1000;
    efficiencyRisk = 30 * 20 * ratedPowerMW * electricityPriceEURperMWh * efficiencyLossFactor;

    // Critical AI findings impact
    if (criticalFindingsCount > 0) {
        emergencyRisk += criticalFindingsCount * 10000;
    }

    const totalRisk = downtimeRisk + efficiencyRisk + emergencyRisk;
    const daysToAction = healthScore < 70 ? 7 : healthScore < 90 ? 30 : 90;

    return {
        totalRevenueAtRisk: Math.round(totalRisk),
        breakdown: {
            downtime: Math.round(downtimeRisk),
            efficiency: Math.round(efficiencyRisk),
            emergency: Math.round(emergencyRisk)
        },
        criticalFindings: criticalFindingsCount,
        daysToAction
    };
}
