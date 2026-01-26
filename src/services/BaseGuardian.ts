/**
 * BaseGuardian - Foundation class for all Guardian subsystems
 * 
 * Provides common functionality for confidence scoring and correlation analysis
 * across all Guardian implementations (ShaftSeal, GovernorHPU, StatorInsulation, TransformerOil)
 */

export default abstract class BaseGuardian {
    /**
     * Get confidence score (0-100) based on sample count and data quality
     * Subclasses must implement to provide domain-specific confidence calculation
     */
    public abstract getConfidenceScore(...args: any[]): number;

    /**
     * Safe Pearson correlation calculation with bounds checking
     * Returns correlation coefficient between -1 and 1, or 0 if insufficient data
     */
    protected safeCorrelation(a: number[] = [], b: number[] = []): number {
        if (!a || !b || a.length === 0 || b.length === 0) return NaN;
        const n = Math.min(a.length, b.length);
        if (n < 2) return NaN;
        
        const xa = a.slice(-n);
        const yb = b.slice(-n);
        const meanA = xa.reduce((s, v) => s + v, 0) / n;
        const meanB = yb.reduce((s, v) => s + v, 0) / n;
        let num = 0, denA = 0, denB = 0;
        
        for (let i = 0; i < n; i++) {
            const xi = xa[i];
            const yi = yb[i];
            if (typeof xi !== 'number' || typeof yi !== 'number' || !isFinite(xi) || !isFinite(yi)) {
                continue; // Skip invalid values
            }
            const da = xi - meanA;
            const db = yi - meanB;
            num += da * db;
            denA += da * da;
            denB += db * db;
        }
        
        // Numerical safety: if either series has (near) zero variance, return NaN to indicate insufficient signal
        const EPS = 1e-12;
        if (denA < EPS || denB < EPS) return NaN;
        const den = Math.sqrt(denA * denB);
        if (!isFinite(den) || den === 0) return 0;
        
        let corr = num / den;
        if (!isFinite(corr) || Number.isNaN(corr)) return NaN;
        
        // Clamp to [-1,1] to avoid tiny numerical drift
        return Math.max(-1, Math.min(1, corr));
    }

    /**
     * Calculate standard deviation safely
     */
    protected safeStdDev(values: number[]): number {
        if (!values || values.length === 0) return 0;
        const valid = values.filter(v => typeof v === 'number' && isFinite(v));
        if (valid.length < 2) return 0;

        const n = valid.length;
        const mean = valid.reduce((s, v) => s + v, 0) / n;
        const variance = valid.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        return isFinite(stdDev) ? stdDev : 0;
    }
    /**
     * Calculate mean safely
     */
    protected safeMean(values: number[]): number {
        if (!values || values.length === 0) return 0;
        const valid = values.filter(v => typeof v === 'number' && isFinite(v));
        if (valid.length === 0) return 0;
        const sum = valid.reduce((s, v) => s + v, 0);
        return isFinite(sum) ? sum / valid.length : 0;
    }

    /**
     * Convenience: normalize correlation (-1..1) to 0..100 confidence
     */
    protected corrToScore(corr: number): number {
        if (isNaN(corr) || !isFinite(corr)) return 50;
        const s = Math.round(((corr + 1) / 2) * 100);
        return Math.max(0, Math.min(100, s));
    }

    // (safeStdDev defined above)
}
