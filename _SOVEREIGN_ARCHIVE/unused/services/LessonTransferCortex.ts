/**
 * LESSON TRANSFER CORTEX
 * The Global Wisdom Sharer 📡📚
 * Broadcasts verified solutions from one site to the entire fleet.
 */

export interface IncidentSolution {
    incidentType: string;
    solution: string;
    originSite: string;
    timestamp: Date;
}

export class LessonTransferCortex {
    private subscribers: string[] = ['Site_B', 'Site_C']; // Hardcoded for demo

    /**
     * BROADCAST LESSON
     * Sends wisdom to other sites.
     */
    broadcastLesson(incident: IncidentSolution): string[] {
        const alerts: string[] = [];

        this.subscribers.forEach(siteId => {
            const msg = `[TO: ${siteId}] 💡 NEW FLEET WISDOM: ${incident.originSite} solved '${incident.incidentType}' using: "${incident.solution}". Update your procedures!`;
            alerts.push(msg);
        });

        return alerts;
    }
}
