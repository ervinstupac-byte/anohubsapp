/**
 * AlarmStormFilter.ts
 * 
 * Intelligent Alarm Suppression
 * Implements "Parent-Child" hierarchy to reduce alarm flooding.
 * If Parent is active, Children are suppressed (or logged as "Consequential").
 */

export interface AlarmDefinition {
    id: string;
    description: string;
    parentId?: string; // ID of the cause alarm
    active: boolean;
    suppressed: boolean;
    timestamp: number;
}

export class AlarmStormFilter {
    private static activeAlarms: Map<string, AlarmDefinition> = new Map();
    private static dependencyGraph: Map<string, string> = new Map(); // Child -> Parent

    /**
     * REGISTER ALARM DEPENDENCY
     * e.g. registerDependency('LOW_PRESSURE', 'PUMP_TRIP')
     */
    public static registerDependency(childId: string, parentId: string): void {
        this.dependencyGraph.set(childId, parentId);
    }

    /**
     * UPDATE ALARM STATE
     * Returns true if alarm is NEW and VISIBLE (not suppressed).
     */
    public static updateAlarm(
        id: string,
        active: boolean,
        explicitParentId?: string
    ): boolean {
        const now = Date.now();
        const existing = this.activeAlarms.get(id);

        // If inactive, clear
        if (!active) {
            if (existing && existing.active) {
                this.activeAlarms.delete(id);
            }
            return false;
        }

        // Check suppression (Graph or Explicit)
        let suppressed = false;
        let parentId = explicitParentId || this.dependencyGraph.get(id);

        if (parentId) {
            const parent = this.activeAlarms.get(parentId);
            if (parent && parent.active) {
                suppressed = true; // Parent is active, suppress this child
            }
        }

        const alarm: AlarmDefinition = {
            id,
            description: id,
            parentId,
            active: true,
            suppressed,
            timestamp: existing ? existing.timestamp : now
        };

        this.activeAlarms.set(id, alarm);

        // Return true only if it's active and NOT suppressed
        // (And maybe only on rising edge, effectively)
        return active && !suppressed;
    }

    /**
     * GET VISIBLE ALARMS
     * Helper to show what the operator sees
     */
    public static getVisibleAlarms(): AlarmDefinition[] {
        return Array.from(this.activeAlarms.values())
            .filter(a => a.active && !a.suppressed);
    }

    /**
     * GET SUPPRESSED COUNT
     */
    public static getSuppressedCount(): number {
        return Array.from(this.activeAlarms.values())
            .filter(a => a.active && a.suppressed).length;
    }
}
