/**
 * RoboticSwarmCoordinator.ts
 * 
 * Autonomous Mission Scheduler & Fleet Manager
 * Coordinates ROVs, Crawlers, and Drones for inspection.
 * Triggers missions based on Time (Schedule) or Condition (Head Loss, RUL).
 */

export type RobotType = 'ROV_UNDERWATER' | 'CRAWLER_MAGNETIC' | 'DRONE_AERIAL';

export interface RobotStatus {
    id: string;
    type: RobotType;
    batteryPct: number;
    location: string;
    status: 'IDLE' | 'MISSION_PREP' | 'IN_MISSION' | 'CHARGING' | 'MAINTENANCE';
    currentMissionId?: string;
}

export interface MissionProfile {
    missionId: string;
    targetZone: string; // e.g., "Penstock_01", "Runner_Unit_3"
    triggerReason: string;
    priority: 'ROUTINE' | 'CONDITION_BASED' | 'EMERGENCY';
    estimatedDurationMin: number;
}

export class RoboticSwarmCoordinator {
    private static fleet: RobotStatus[] = [
        { id: 'ROV-01', type: 'ROV_UNDERWATER', batteryPct: 100, location: 'Dock_Tailrace', status: 'IDLE' },
        { id: 'CRAWLER-01', type: 'CRAWLER_MAGNETIC', batteryPct: 95, location: 'Dock_Penstock', status: 'IDLE' },
        { id: 'DRONE-01', type: 'DRONE_AERIAL', batteryPct: 80, location: 'Dock_Hall', status: 'IDLE' }
    ];

    private static activeMissions: MissionProfile[] = [];

    /**
     * EVALUATE TRIGGERS
     * Checks if a new mission should be launched.
     */
    public static checkTriggers(
        headLossPct: number, // Delta from baseline
        operatingHours: number,
        rulHours: number
    ): MissionProfile | null {

        // 1. Hydraulic Trigger (ROV)
        if (headLossPct > 5.0) {
            return this.createMission(
                'ROV_UNDERWATER',
                'Intake_TrashRack',
                `High Head Loss (+${headLossPct.toFixed(1)}%) detected. Possible blockage.`,
                'CONDITION_BASED'
            );
        }

        // 2. RUL Trigger (Crawler)
        // If RUL is low, we need visual confirmation of wear
        if (rulHours < 1000) {
            // Check if already inspected recently (simulated check)
            return this.createMission(
                'CRAWLER_MAGNETIC',
                'Penstock_Liner',
                `Low RUL (${rulHours}h). Structural thickness verification required.`,
                'ROUTINE'
            );
        }

        return null;
    }

    private static createMission(
        requiredType: RobotType,
        target: string,
        reason: string,
        priority: MissionProfile['priority']
    ): MissionProfile {
        const missionId = `MSN-${Date.now().toString().slice(-6)}`;

        // Find available robot
        const robot = this.fleet.find(r => r.type === requiredType && r.status === 'IDLE');

        if (robot) {
            robot.status = 'MISSION_PREP';
            robot.currentMissionId = missionId;
            console.log(`[Swarm] 🤖 Dispatching ${robot.id} to ${target}. Reason: ${reason}`);
        } else {
            console.warn(`[Swarm] ⚠️ No ${requiredType} available for ${target}! Queuing.`);
        }

        const mission: MissionProfile = {
            missionId,
            targetZone: target,
            triggerReason: reason,
            priority,
            estimatedDurationMin: 60
        };

        this.activeMissions.push(mission);
        return mission;
    }

    public static getFleetStatus(): RobotStatus[] {
        return this.fleet;
    }

    public static getActiveMissions(): MissionProfile[] {
        return this.activeMissions;
    }
}
