/**
 * SilenceProtocol.ts
 * 
 * The Silent Sentinel
 * When the system achieves Unity and operates optimally,
 * only critical failures that cannot be self-healed should interrupt the Architect.
 */

export enum AlertLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    CRITICAL = 3,
    CATASTROPHIC = 4
}

export interface SystemHealth {
    unityIndex: number; // 0-1
    averageHeff: number; // 0-1
    healingSuccessRate: number; // 0-1
}

export interface Alert {
    level: AlertLevel;
    message: string;
    timestamp: number;
    canSelfHeal: boolean;
}

export class SilenceProtocol {
    private static silenceThresholds = {
        unityIndex: 1.0,
        minHeff: 0.9,
        minHealingSuccessRate: 0.85
    };

    private static suppressedAlerts: Alert[] = [];
    private static readonly REPORT_HOUR = 8; // 08:00 daily reports

    /**
     * Check if current time is scheduled report time (08:00)
     */
    private static isScheduledReportTime(): boolean {
        const now = new Date();
        return now.getHours() === this.REPORT_HOUR && now.getMinutes() < 30;
    }

    /**
     * Check if system should be in Silent Sentinel mode
     */
    public static isSilentMode(health: SystemHealth): boolean {
        // Never silent during scheduled reporting window
        if (this.isScheduledReportTime()) {
            return false;
        }

        return (
            health.unityIndex >= this.silenceThresholds.unityIndex &&
            health.averageHeff >= this.silenceThresholds.minHeff &&
            health.healingSuccessRate >= this.silenceThresholds.minHealingSuccessRate
        );
    }

    /**
     * Process an alert through the hardened silence filter
     * Returns true if alert should be shown, false if suppressed
     */
    public static processAlert(alert: Alert, health: SystemHealth): boolean {
        // CRITICAL and CATASTROPHIC always go through
        if (alert.level >= AlertLevel.CRITICAL) {
            // But only if it CANNOT be self-healed
            if (!alert.canSelfHeal) {
                console.log(`[SilenceProtocol] 🚨 ESCALATING: ${alert.message}`);
                return true;
            } else {
                console.log(`[SilenceProtocol] 🔧 Self-healing: ${alert.message}`);
                this.suppressedAlerts.push(alert);
                return false;
            }
        }

        // In silent mode, suppress INFO and WARNING
        if (this.isSilentMode(health) && alert.level < AlertLevel.CRITICAL) {
            this.suppressedAlerts.push(alert);
            return false;
        }

        // Not in silent mode - show everything
        return true;
    }

    /**
     * Create alert from healing failure
     */
    public static createHealingFailureAlert(
        symptom: string,
        healingAttempted: boolean,
        healingSucceeded: boolean
    ): Alert {
        if (!healingAttempted) {
            return {
                level: AlertLevel.CRITICAL,
                message: `No healing protocol available for: ${symptom}`,
                timestamp: Date.now(),
                canSelfHeal: false
            };
        }

        if (!healingSucceeded) {
            return {
                level: AlertLevel.CRITICAL,
                message: `Self-healing failed for: ${symptom}`,
                timestamp: Date.now(),
                canSelfHeal: false
            };
        }

        // Success - low priority
        return {
            level: AlertLevel.INFO,
            message: `Self-healed: ${symptom}`,
            timestamp: Date.now(),
            canSelfHeal: true
        };
    }

    /**
     * Get silence status summary
     */
    public static getStatus(health: SystemHealth): {
        silentMode: boolean;
        suppressedCount: number;
        lastSuppressed: Alert | null;
    } {
        return {
            silentMode: this.isSilentMode(health),
            suppressedCount: this.suppressedAlerts.length,
            lastSuppressed: this.suppressedAlerts[this.suppressedAlerts.length - 1] || null
        };
    }

    /**
     * Get suppressed alerts (for audit)
     */
    public static getSuppressedAlerts(): Alert[] {
        return [...this.suppressedAlerts];
    }

    /**
     * Clear suppressed alerts history
     */
    public static clearSuppressed(): void {
        console.log(`[SilenceProtocol] 🧹 Cleared ${this.suppressedAlerts.length} suppressed alerts`);
        this.suppressedAlerts = [];
    }
}
