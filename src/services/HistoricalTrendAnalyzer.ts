/**
 * HistoricalTrendAnalyzer
 * Linear regression and predictive trend analysis for maintenance parameters
 */

import { MeasurementHistory, HistoricalMeasurement, TrendProjection } from '../types/trends';

export class HistoricalTrendAnalyzer {

    /**
     * Calculate linear regression for measurement history
     * Returns slope, intercept, and R-squared goodness of fit
     */
    static calculateLinearRegression(
        measurements: HistoricalMeasurement[]
    ): { slope: number; intercept: number; rSquared: number } {
        if (measurements.length < 2) {
            return { slope: 0, intercept: 0, rSquared: 0 };
        }

        // Convert timestamps to days since first measurement
        const firstDate = new Date(measurements[0].timestamp).getTime();
        const points = measurements.map(m => ({
            x: (new Date(m.timestamp).getTime() - firstDate) / (1000 * 60 * 60 * 24),
            y: m.value
        }));

        const n = points.length;
        const sumX = points.reduce((sum, p) => sum + p.x, 0);
        const sumY = points.reduce((sum, p) => sum + p.y, 0);
        const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
        const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
        const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0);

        // Linear regression: y = mx + b
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // R-squared (coefficient of determination)
        const yMean = sumY / n;
        const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
        const ssResidual = points.reduce((sum, p) => {
            const predicted = slope * p.x + intercept;
            return sum + Math.pow(p.y - predicted, 2);
        }, 0);
        const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

        return {
            slope: isNaN(slope) ? 0 : slope,
            intercept: isNaN(intercept) ? 0 : intercept,
            rSquared: isNaN(rSquared) ? 0 : Math.max(0, Math.min(1, rSquared))
        };
    }

    /**
     * Project when parameter will exceed critical threshold
     */
    static projectCriticalDate(
        regression: { slope: number; intercept: number },
        criticalThreshold: number,
        firstMeasurementDate: string
    ): { date: string; daysUntilCritical: number } | null {
        if (regression.slope <= 0) {
            // Parameter is improving or stable
            return null;
        }

        // Solve for x when y = criticalThreshold
        // criticalThreshold = slope * x + intercept
        // x = (criticalThreshold - intercept) / slope
        const daysUntilCritical = (criticalThreshold - regression.intercept) / regression.slope;

        if (daysUntilCritical < 0) {
            // Already exceeded threshold
            return null;
        }

        const projectedDate = new Date(firstMeasurementDate);
        projectedDate.setDate(projectedDate.getDate() + daysUntilCritical);

        return {
            date: projectedDate.toISOString(),
            daysUntilCritical: Math.floor(daysUntilCritical)
        };
    }

    /**
     * Analyze measurement history and generate trend projection
     */
    static analyzeTrend(
        history: MeasurementHistory,
        criticalThreshold: number
    ): TrendProjection {
        const regression = this.calculateLinearRegression(history.measurements);

        const projection: TrendProjection = {
            slope: regression.slope,
            intercept: regression.intercept,
            rSquared: regression.rSquared,
            criticalThreshold
        };

        if (history.measurements.length > 0) {
            const criticalDate = this.projectCriticalDate(
                regression,
                criticalThreshold,
                history.measurements[0].timestamp
            );

            if (criticalDate) {
                projection.projectedCriticalDate = criticalDate.date;
                projection.daysUntilCritical = criticalDate.daysUntilCritical;
            }
        }

        return projection;
    }

    /**
     * Add new measurement and update trend
     */
    static addMeasurement(
        history: MeasurementHistory,
        newMeasurement: HistoricalMeasurement,
        criticalThreshold: number
    ): MeasurementHistory {
        const updatedMeasurements = [...history.measurements, newMeasurement].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const trend = this.analyzeTrend(
            { ...history, measurements: updatedMeasurements },
            criticalThreshold
        );

        return {
            ...history,
            measurements: updatedMeasurements,
            trend
        };
    }

    /**
     * Get predicted value for a future date
     */
    static predictValueAtDate(
        regression: { slope: number; intercept: number },
        targetDate: string,
        firstMeasurementDate: string
    ): number {
        const firstDate = new Date(firstMeasurementDate).getTime();
        const targetTime = new Date(targetDate).getTime();
        const daysFromFirst = (targetTime - firstDate) / (1000 * 60 * 60 * 24);

        return regression.slope * daysFromFirst + regression.intercept;
    }

    /**
     * Determine trend direction and severity
     */
    static getTrendStatus(
        trend: TrendProjection
    ): {
        direction: 'IMPROVING' | 'STABLE' | 'DEGRADING';
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    } {
        let direction: 'IMPROVING' | 'STABLE' | 'DEGRADING';
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

        // Determine direction
        if (trend.slope < -0.001) {
            direction = 'IMPROVING';
        } else if (trend.slope > 0.001) {
            direction = 'DEGRADING';
        } else {
            direction = 'STABLE';
        }

        // Determine severity based on days until critical
        if (direction === 'IMPROVING' || direction === 'STABLE') {
            severity = 'LOW';
        } else if (trend.daysUntilCritical !== undefined) {
            if (trend.daysUntilCritical < 30) {
                severity = 'CRITICAL';
            } else if (trend.daysUntilCritical < 90) {
                severity = 'HIGH';
            } else if (trend.daysUntilCritical < 180) {
                severity = 'MEDIUM';
            } else {
                severity = 'LOW';
            }
        } else {
            severity = 'LOW';
        }

        return { direction, severity };
    }

    /**
     * Generate trend chart data for visualization
     */
    static generateChartData(
        history: MeasurementHistory,
        projectionDays: number = 90
    ): Array<{
        day: number;
        date: string;
        actual?: number;
        projected?: number;
    }> {
        if (history.measurements.length === 0) return [];

        const firstDate = new Date(history.measurements[0].timestamp);
        const data: Array<{ day: number; date: string; actual?: number; projected?: number }> = [];

        // Add actual measurements
        history.measurements.forEach((m, idx) => {
            const measurementDate = new Date(m.timestamp);
            const daysSinceFirst = Math.floor(
                (measurementDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            data.push({
                day: daysSinceFirst,
                date: m.timestamp,
                actual: m.value
            });
        });

        // Add projected values
        if (history.trend) {
            const lastMeasurementDay = data[data.length - 1].day;
            const projectionEnd = lastMeasurementDay + projectionDays;

            for (let day = 0; day <= projectionEnd; day += 7) {  // Weekly intervals
                const projected = history.trend.slope * day + history.trend.intercept;
                const projectionDate = new Date(firstDate);
                projectionDate.setDate(projectionDate.getDate() + day);

                const existingPoint = data.find(d => d.day === day);
                if (existingPoint) {
                    existingPoint.projected = projected;
                } else {
                    data.push({
                        day,
                        date: projectionDate.toISOString(),
                        projected
                    });
                }
            }
        }

        return data.sort((a, b) => a.day - b.day);
    }
}
