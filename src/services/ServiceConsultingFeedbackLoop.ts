// Service-Consulting Feedback Loop
// Tracks ROI prediction accuracy to improve future consulting recommendations

export interface OptimizationTrackingEntry {
    id: string;
    reportId: string;
    assetId: string;
    assetName: string;

    // Predictions (from ConsultingEngine)
    predictedEfficiencyGain: number; // %
    predictedROI: number; // %
    predictedPaybackMonths: number;
    investmentCost: number; // $

    // Work performed
    workCompleted: boolean;
    workCompletionDate?: number;
    actualInvestmentCost?: number; // Sometimes differs from estimate

    // Actual results (measured 3-6 months after work)
    actualEfficiencyGain?: number; // %
    actualROI?: number; // %
    actualPaybackMonths?: number;
    measurementDate?: number;

    // Accuracy metrics
    deltaEfficiency?: number; // Predicted - Actual
    deltaROI?: number;
    accuracyScore?: number; // 0-100, how accurate was prediction

    // Learning
    lessonsLearned: string[];
    correctionFactors: Record<string, number>; // For ML training

    createdAt: number;
    updatedAt: number;
}

export interface AccuracyReport {
    overallAccuracy: number; // 0-100
    totalPredictions: number;
    measuredOutcomes: number;

    averageDeltaEfficiency: number;
    averageDeltaROI: number;

    bestPredictions: OptimizationTrackingEntry[];
    worstPredictions: OptimizationTrackingEntry[];

    learnings: string[];
}

export class ServiceConsultingFeedbackLoop {
    private static trackingDatabase: Map<string, OptimizationTrackingEntry> = new Map();

    /**
     * Create tracking entry when optimization report is generated
     */
    static async createTrackingEntry(
        reportId: string,
        assetId: string,
        assetName: string,
        predictions: {
            efficiencyGain: number;
            roi: number;
            paybackMonths: number;
            investmentCost: number;
        }
    ): Promise<OptimizationTrackingEntry> {
        const entry: OptimizationTrackingEntry = {
            id: `TRACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            reportId,
            assetId,
            assetName,
            predictedEfficiencyGain: predictions.efficiencyGain,
            predictedROI: predictions.roi,
            predictedPaybackMonths: predictions.paybackMonths,
            investmentCost: predictions.investmentCost,
            workCompleted: false,
            lessonsLearned: [],
            correctionFactors: {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.trackingDatabase.set(entry.id, entry);

        console.log(`📊 Tracking entry created for ${assetName}`);
        console.log(`   Predicted efficiency gain: ${predictions.efficiencyGain}%`);
        console.log(`   Predicted ROI: ${predictions.roi}%`);

        return entry;
    }

    /**
     * Mark work as completed
     */
    static async markWorkCompleted(
        trackingId: string,
        actualCost: number
    ): Promise<void> {
        const entry = this.trackingDatabase.get(trackingId);
        if (!entry) throw new Error('Tracking entry not found');

        entry.workCompleted = true;
        entry.workCompletionDate = Date.now();
        entry.actualInvestmentCost = actualCost;
        entry.updatedAt = Date.now();

        console.log(`✅ Work completed for ${entry.assetName}`);
        console.log(`   Estimated cost: $${entry.investmentCost.toLocaleString()}`);
        console.log(`   Actual cost: $${actualCost.toLocaleString()}`);
        console.log(`   Delta: ${((actualCost - entry.investmentCost) / entry.investmentCost * 100).toFixed(1)}%`);
    }

    /**
     * Record actual measured results (3-6 months post-work)
     */
    static async recordActualResults(
        trackingId: string,
        results: {
            efficiencyGain: number;
            roi: number;
            paybackMonths: number;
        }
    ): Promise<void> {
        const entry = this.trackingDatabase.get(trackingId);
        if (!entry) throw new Error('Tracking entry not found');

        entry.actualEfficiencyGain = results.efficiencyGain;
        entry.actualROI = results.roi;
        entry.actualPaybackMonths = results.paybackMonths;
        entry.measurementDate = Date.now();

        // Calculate deltas
        entry.deltaEfficiency = entry.predictedEfficiencyGain - results.efficiencyGain;
        entry.deltaROI = entry.predictedROI - results.roi;

        // Accuracy score (inverse of % error, weighted)
        const efficiencyError = Math.abs(entry.deltaEfficiency) / entry.predictedEfficiencyGain;
        const roiError = Math.abs(entry.deltaROI) / entry.predictedROI;
        entry.accuracyScore = Math.max(0, 100 - ((efficiencyError + roiError) / 2 * 100));

        entry.updatedAt = Date.now();

        console.log(`📈 Actual results recorded for ${entry.assetName}`);
        console.log(`   Predicted efficiency: ${entry.predictedEfficiencyGain}%`);
        console.log(`   Actual efficiency: ${results.efficiencyGain}%`);
        console.log(`   Accuracy: ${entry.accuracyScore.toFixed(1)}/100`);

        // Auto-generate learnings
        this.generateLearnings(entry);
    }

    /**
     * Auto-generate learnings from prediction errors
     */
    private static generateLearnings(entry: OptimizationTrackingEntry): void {
        if (!entry.deltaEfficiency || !entry.deltaROI) return;

        const lessons: string[] = [];

        // Efficiency over-prediction
        if (entry.deltaEfficiency > 1) {
            lessons.push(`Over-predicted efficiency gain by ${entry.deltaEfficiency.toFixed(1)}%. Consider more conservative estimates for similar turbine types.`);
            entry.correctionFactors.efficiency_multiplier = entry.actualEfficiencyGain! / entry.predictedEfficiencyGain;
        }

        // Efficiency under-prediction
        if (entry.deltaEfficiency < -1) {
            lessons.push(`Under-predicted efficiency gain by ${Math.abs(entry.deltaEfficiency).toFixed(1)}%. Our intervention was more effective than expected.`);
            entry.correctionFactors.efficiency_multiplier = entry.actualEfficiencyGain! / entry.predictedEfficiencyGain;
        }

        // Cost overrun
        if (entry.actualInvestmentCost && entry.actualInvestmentCost > entry.investmentCost * 1.1) {
            const overrun = ((entry.actualInvestmentCost - entry.investmentCost) / entry.investmentCost * 100).toFixed(1);
            lessons.push(`Cost overrun of ${overrun}%. Factor in more contingency for ${entry.assetName} turbine family.`);
            entry.correctionFactors.cost_multiplier = entry.actualInvestmentCost / entry.investmentCost;
        }

        // High accuracy (celebrate!)
        if (entry.accuracyScore && entry.accuracyScore > 90) {
            lessons.push(`🎯 Excellent prediction accuracy (${entry.accuracyScore.toFixed(0)}/100). Our model is well-calibrated for this scenario.`);
        }

        entry.lessonsLearned = lessons;
    }

    /**
     * Generate accuracy report across all tracked optimizations
     */
    static async generateAccuracyReport(): Promise<AccuracyReport> {
        const allEntries = Array.from(this.trackingDatabase.values());
        const measuredEntries = allEntries.filter(e => e.actualEfficiencyGain !== undefined);

        if (measuredEntries.length === 0) {
            return {
                overallAccuracy: 0,
                totalPredictions: allEntries.length,
                measuredOutcomes: 0,
                averageDeltaEfficiency: 0,
                averageDeltaROI: 0,
                bestPredictions: [],
                worstPredictions: [],
                learnings: ['Insufficient data - no outcomes measured yet']
            };
        }

        // Calculate averages
        const avgDeltaEff = measuredEntries.reduce((sum, e) => sum + (e.deltaEfficiency || 0), 0) / measuredEntries.length;
        const avgDeltaROI = measuredEntries.reduce((sum, e) => sum + (e.deltaROI || 0), 0) / measuredEntries.length;
        const avgAccuracy = measuredEntries.reduce((sum, e) => sum + (e.accuracyScore || 0), 0) / measuredEntries.length;

        // Best and worst
        const sorted = [...measuredEntries].sort((a, b) => (b.accuracyScore || 0) - (a.accuracyScore || 0));
        const best = sorted.slice(0, 3);
        const worst = sorted.slice(-3).reverse();

        // Meta-learnings
        const learnings: string[] = [];

        if (avgAccuracy > 85) {
            learnings.push('Overall prediction quality is EXCELLENT (>85% accuracy)');
        } else if (avgAccuracy > 70) {
            learnings.push('Prediction quality is GOOD (>70% accuracy). Continue refinement.');
        } else {
            learnings.push('⚠️ Prediction quality needs improvement (<70% accuracy). Review model assumptions.');
        }

        if (Math.abs(avgDeltaEff) > 0.5) {
            const direction = avgDeltaEff > 0 ? 'over-predicting' : 'under-predicting';
            learnings.push(`Systematic bias detected: ${direction} efficiency gains by ${Math.abs(avgDeltaEff).toFixed(1)}%`);
        }

        // Extract common learnings
        const allLessons = measuredEntries.flatMap(e => e.lessonsLearned);
        const costOverruns = allLessons.filter(l => l.includes('overrun')).length;
        if (costOverruns > measuredEntries.length * 0.3) {
            learnings.push(`High frequency of cost overruns (${costOverruns}/${measuredEntries.length}). Increase contingency budgets.`);
        }

        return {
            overallAccuracy: avgAccuracy,
            totalPredictions: allEntries.length,
            measuredOutcomes: measuredEntries.length,
            averageDeltaEfficiency: avgDeltaEff,
            averageDeltaROI: avgDeltaROI,
            bestPredictions: best,
            worstPredictions: worst,
            learnings
        };
    }

    /**
     * Get correction factors for ML training
     * These improve future predictions
     */
    static async getCorrectionFactors(turbineFamily: string): Promise<{
        efficiency_multiplier: number;
        cost_multiplier: number;
        payback_multiplier: number;
    }> {
        const familyEntries = Array.from(this.trackingDatabase.values())
            .filter(e => e.correctionFactors && Object.keys(e.correctionFactors).length > 0);

        if (familyEntries.length === 0) {
            return {
                efficiency_multiplier: 1.0,
                cost_multiplier: 1.0,
                payback_multiplier: 1.0
            };
        }

        // Average correction factors
        const avgEffMult = familyEntries
            .map(e => e.correctionFactors.efficiency_multiplier || 1.0)
            .reduce((sum, val) => sum + val, 0) / familyEntries.length;

        const avgCostMult = familyEntries
            .map(e => e.correctionFactors.cost_multiplier || 1.0)
            .reduce((sum, val) => sum + val, 0) / familyEntries.length;

        return {
            efficiency_multiplier: avgEffMult,
            cost_multiplier: avgCostMult,
            payback_multiplier: 1.0 // TBD
        };
    }

    /**
     * Apply learned corrections to new predictions
     */
    static async applyCorrectionFactors(
        prediction: { efficiencyGain: number; cost: number },
        turbineFamily: string
    ): Promise<{ efficiencyGain: number; cost: number }> {
        const factors = await this.getCorrectionFactors(turbineFamily);

        return {
            efficiencyGain: prediction.efficiencyGain * factors.efficiency_multiplier,
            cost: prediction.cost * factors.cost_multiplier
        };
    }
}

// ===== USAGE EXAMPLE =====

/*
// Consultant generates optimization report
const reportId = 'REPORT-123';
const tracking = await ServiceConsultingFeedbackLoop.createTrackingEntry(
    reportId,
    'KAPLAN-001',
    'Kaplan Turbine Unit 1',
    {
        efficiencyGain: 3.5, // %
        roi: 285, // %
        paybackMonths: 14,
        investmentCost: 75000
    }
);

// Work is performed
await ServiceConsultingFeedbackLoop.markWorkCompleted(tracking.id, 82000); // Cost overrun

// 3 months later, measure actual results
await ServiceConsultingFeedbackLoop.recordActualResults(tracking.id, {
    efficiencyGain: 3.2, // % (slightly lower than predicted)
    roi: 265, // % (slightly lower)
    paybackMonths: 15 // (slightly longer)
});

// Generate accuracy report
const report = await ServiceConsultingFeedbackLoop.generateAccuracyReport();
console.log(`Overall accuracy: ${report.overallAccuracy}/100`);
console.log(`Learnings:`, report.learnings);

// Use learnings for next prediction
const nextPrediction = { efficiencyGain: 3.0, cost: 70000 };
const corrected = await ServiceConsultingFeedbackLoop.applyCorrectionFactors(
    nextPrediction,
    'kaplan'
);
console.log(`Corrected prediction: ${corrected.efficiencyGain}% efficiency, $${corrected.cost}`);
*/
