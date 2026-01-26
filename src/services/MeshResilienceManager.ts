/**
 * MeshResilienceManager.ts
 * 
 * P2P Heartbeat & Hive Mind Resilience
 * Maintains connectivity between units.
 * Activates "Autonomous Hive Mode" if Central Server (Cloud/SCADA Master) is lost.
 */

export interface PeerStatus {
    unitId: string;
    reachable: boolean;
    lastHeartbeat: number;
    role: 'FOLLOWER' | 'LEADER_CANDIDATE';
}

export class MeshResilienceManager {
    private static peers: Map<string, PeerStatus> = new Map();
    private static centralServerHealthy = true;
    private static autonomousMode = false;

    /**
     * HEARTBEAT CHECK
     */
    public static beat(unitId: string): void {
        this.peers.set(unitId, {
            unitId,
            reachable: true,
            lastHeartbeat: Date.now(),
            role: 'FOLLOWER'
        });
    }

    /**
     * CHECK MESH HEALTH
     * Determines if we need to switch to Autonomous Hive Mode.
     */
    public static checkMeshHealth(
        centralServerConnected: boolean
    ): { mode: 'CENTRAL' | 'AUTONOMOUS_HIVE'; activePeers: number; leader: string } {

        this.centralServerHealthy = centralServerConnected;

        // Prune old peers
        const now = Date.now();
        let activeCount = 0;
        this.peers.forEach((p, k) => {
            if (now - p.lastHeartbeat > 5000) {
                p.reachable = false;
            } else {
                activeCount++;
            }
        });

        if (!this.centralServerHealthy) {
            if (!this.autonomousMode) {
                console.warn('[MeshResilience] 🚨 CENTRAL SERVER LOST. Entering AUTONOMOUS HIVE MODE.');
                this.autonomousMode = true;
            }

            // Election Logic (Simplified: Lowest ID is Leader)
            // In real Raft/Paxos: voting happens here
            const sortedPeers = Array.from(this.peers.values())
                .filter(p => p.reachable)
                .sort((a, b) => a.unitId.localeCompare(b.unitId));

            const leader = sortedPeers.length > 0 ? sortedPeers[0].unitId : 'SELF';

            return {
                mode: 'AUTONOMOUS_HIVE',
                activePeers: activeCount,
                leader
            };
        }

        if (this.autonomousMode && this.centralServerHealthy) {
            console.log('[MeshResilience] Central Server Restored. Exiting Hive Mode.');
            this.autonomousMode = false;
        }

        return {
            mode: 'CENTRAL',
            activePeers: activeCount,
            leader: 'SCADA_MASTER'
        };
    }
}
