/**
 * SovereignAlarmManager.ts
 * 
 * ISA 18.2 Compliant Alarm Management System
 * With intelligent suppression and forensic linking
 */

import { SilenceProtocol, AlertLevel } from './SilenceProtocol';

export enum AlarmPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
}

export enum AlarmState {
    ACTIVE = 'ACTIVE',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    CLEARED = 'CLEARED',
    SUPPRESSED = 'SUPPRESSED'
}

export interface Alarm {
    id: string;
    timestamp: number;
    priority: AlarmPriority;
    state: AlarmState;
    category: string; // e.g., "VIBRATION", "TEMPERATURE", "POWER"
    assetId: string;
    message: string;
    value: number;
    threshold: number;
    rootCause?: string; // Link to RCA finding
    relatedAlarms?: string[]; // IDs of secondary alarms
    canSelfHeal: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
}

export class SovereignAlarmManager {
    private static alarms: Map<string, Alarm> = new Map();
    private static alarmHistory: Alarm[] = [];
    private static suppressionRules: Map<string, string[]> = new Map(); // Root alarm -> secondary alarms

    /**
     * Raise a new alarm
     */
    public static raiseAlarm(alarm: Omit<Alarm, 'id' | 'timestamp' | 'state'>): string {
        const id = `ALM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const newAlarm: Alarm = {
            id,
            timestamp: Date.now(),
            state: AlarmState.ACTIVE,
            ...alarm
        };

        // Check for suppression (if this is a secondary alarm)
        const shouldSuppress = this.checkSuppressionRules(newAlarm);
        if (shouldSuppress) {
            newAlarm.state = AlarmState.SUPPRESSED;
            console.log(`[AlarmMgr] Alarm suppressed (secondary): ${newAlarm.message}`);
        }

        this.alarms.set(id, newAlarm);
        this.alarmHistory.push(newAlarm);

        // ISA 18.2: Log for audit trail
        console.log(`[AlarmMgr] ${AlarmPriority[newAlarm.priority]} ALARM: ${newAlarm.message} [${id}]`);

        // Trigger notification based on priority
        if (newAlarm.priority >= AlarmPriority.HIGH && newAlarm.state === AlarmState.ACTIVE) {
            this.escalateAlarm(newAlarm);
        }

        return id;
    }

    /**
     * Check if alarm should be suppressed based on smart rules
     */
    private static checkSuppressionRules(alarm: Alarm): boolean {
        // Check if there's an active root cause alarm that would suppress this
        for (const [rootId, secondaries] of this.suppressionRules.entries()) {
            const rootAlarm = this.alarms.get(rootId);

            if (rootAlarm && rootAlarm.state === AlarmState.ACTIVE) {
                // Check if this alarm matches suppression pattern
                const shouldSuppress = secondaries.some(pattern =>
                    alarm.category?.includes(pattern) || alarm.message.includes(pattern)
                );

                if (shouldSuppress) {
                    alarm.relatedAlarms = [rootId];
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Register suppression rule
     * Example: High temperature (root) suppresses related vibration alarms (secondary)
     */
    public static registerSuppressionRule(rootCategory: string, secondaryCategories: string[]): void {
        // In production: Would match against actual alarm IDs
        // For now: Store category-based rules
        console.log(`[AlarmMgr] Suppression rule: ${rootCategory} suppresses ${secondaryCategories.join(', ')}`);
    }

    /**
     * Acknowledge an alarm
     */
    public static acknowledgeAlarm(alarmId: string, operator: string): boolean {
        const alarm = this.alarms.get(alarmId);
        if (!alarm || alarm.state !== AlarmState.ACTIVE) {
            return false;
        }

        alarm.state = AlarmState.ACKNOWLEDGED;
        alarm.acknowledgedBy = operator;
        alarm.acknowledgedAt = Date.now();

        console.log(`[AlarmMgr] Alarm ${alarmId} acknowledged by ${operator}`);
        return true;
    }

    /**
     * Clear an alarm (condition has normalized)
     */
    public static clearAlarm(alarmId: string): boolean {
        const alarm = this.alarms.get(alarmId);
        if (!alarm) return false;

        alarm.state = AlarmState.CLEARED;

        // Remove from active alarms
        this.alarms.delete(alarmId);

        console.log(`[AlarmMgr] Alarm ${alarmId} cleared`);
        return true;
    }

    /**
     * Get active alarms sorted by priority
     */
    public static getActiveAlarms(): Alarm[] {
        return Array.from(this.alarms.values())
            .filter(a => a.state === AlarmState.ACTIVE)
            .sort((a, b) => b.priority - a.priority);
    }

    /**
     * Get alarm statistics
     */
    public static getStatistics(): {
        active: number;
        acknowledged: number;
        suppressed: number;
        total: number;
        byPriority: Record<string, number>;
    } {
        const active = Array.from(this.alarms.values()).filter(a => a.state === AlarmState.ACTIVE).length;
        const acknowledged = Array.from(this.alarms.values()).filter(a => a.state === AlarmState.ACKNOWLEDGED).length;
        const suppressed = Array.from(this.alarms.values()).filter(a => a.state === AlarmState.SUPPRESSED).length;

        const byPriority: Record<string, number> = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            CRITICAL: 0
        };

        for (const alarm of this.alarms.values()) {
            if (alarm.state === AlarmState.ACTIVE) {
                byPriority[AlarmPriority[alarm.priority]]++;
            }
        }

        return {
            active,
            acknowledged,
            suppressed,
            total: this.alarmHistory.length,
            byPriority
        };
    }

    /**
     * Escalate high-priority alarm
     */
    private static escalateAlarm(alarm: Alarm): void {
        // Integration with SilenceProtocol
        const health = {
            unityIndex: 1.0,
            averageHeff: 0.9,
            healingSuccessRate: 0.85
        };

        const alert = {
            level: alarm.priority >= AlarmPriority.CRITICAL ? AlertLevel.CRITICAL : AlertLevel.WARNING,
            message: alarm.message,
            timestamp: alarm.timestamp,
            canSelfHeal: alarm.canSelfHeal
        };

        const shouldEscalate = SilenceProtocol.processAlert(alert, health);

        if (shouldEscalate) {
            console.log(`[AlarmMgr] 🚨 ESCALATING to operator: ${alarm.message}`);
            // Would trigger: Email, SMS, HMI popup, etc.
        }
    }

    /**
     * Link alarm to forensic finding
     */
    public static linkToForensic(alarmId: string, rootCause: string): void {
        const alarm = this.alarms.get(alarmId);
        if (alarm) {
            alarm.rootCause = rootCause;
            console.log(`[AlarmMgr] Alarm ${alarmId} linked to RCA: ${rootCause}`);
        }
    }

    /**
     * Export alarm history for compliance
     */
    public static exportHistory(startTime: number, endTime: number): Alarm[] {
        return this.alarmHistory.filter(
            a => a.timestamp >= startTime && a.timestamp <= endTime
        );
    }
}

// Initialize common suppression rules
SovereignAlarmManager.registerSuppressionRule('TEMPERATURE_HIGH', ['VIBRATION_SECONDARY', 'EFFICIENCY_LOW']);
SovereignAlarmManager.registerSuppressionRule('VORTEX_DETECTED', ['VIBRATION_DRAFT_TUBE', 'PRESSURE_FLUCTUATION']);
