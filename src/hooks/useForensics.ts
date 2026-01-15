import { useState, useCallback, useEffect, useRef } from 'react';
import { Decimal } from 'decimal.js';
import { useAudit } from '../contexts/AuditContext'; // For Sentinel Kernel logging

export type ForensicsState = 'IDLE' | 'ATTACK_IN_PROGRESS' | 'THREAT_CONTAINED';

interface PacketData {
    timestamp: number;
    inbound: number; // Mbps
    outbound: number; // Mbps
    latency: number; // ms
}

export const useForensics = () => {
    const { logAction } = useAudit();
    const [status, setStatus] = useState<ForensicsState>('IDLE');
    const [trafficHistory, setTrafficHistory] = useState<PacketData[]>([]);
    const [securityEvents, setSecurityEvents] = useState<string[]>([]);

    // Attack Simulation Constants
    const NORMAL_LATENCY = 45;
    const ATTACK_LATENCY = 2400; // Simulated lag
    const ATTACK_THRESHOLD = new Decimal('850.00'); // Mbps outbound trigger

    // Simulation Loop Ref
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const generateTraffic = useCallback(() => {
        setTrafficHistory(prev => {
            const now = Date.now();
            let inbound = Math.random() * 50 + 10;
            let outbound = Math.random() * 20 + 5;
            let latency = NORMAL_LATENCY + (Math.random() * 20);

            if (status === 'ATTACK_IN_PROGRESS') {
                outbound = 900 + (Math.random() * 300); // Massive spike
                latency = ATTACK_LATENCY + (Math.random() * 500);
            } else if (status === 'THREAT_CONTAINED') {
                outbound = 0; // Cut off
                latency = NORMAL_LATENCY;
            }

            const newData = { timestamp: now, inbound, outbound, latency };
            return [...prev.slice(-50), newData]; // Keep last 50 points
        });
    }, [status]);

    // Attack Trigger
    const triggerSimulatedAttack = useCallback(() => {
        if (status === 'IDLE') {
            setStatus('ATTACK_IN_PROGRESS');
            setSecurityEvents(prev => [
                `[${new Date().toLocaleTimeString()}] ⚠️ ANOMALY DETECTED: Outbound Traffic Spike`,
                ...prev
            ]);
            logAction('SECURITY_ALERT', 'Simulated Data Exfiltration Triggered', 'FAILURE');
        }
    }, [status, logAction]);

    // Kill Switch
    const executeKillSwitch = useCallback(() => {
        if (status === 'ATTACK_IN_PROGRESS') {
            setStatus('THREAT_CONTAINED');
            setSecurityEvents(prev => [
                `[${new Date().toLocaleTimeString()}] ✅ PROTOCOL 9 EXECUTED: Network Isolation Active`,
                ...prev
            ]);
            logAction('SECURITY_PROTOCOL', 'Kill Switch Engaged: Network Isolated', 'SUCCESS');
        }
    }, [status, logAction]);

    // Simulation Effect
    useEffect(() => {
        intervalRef.current = setInterval(generateTraffic, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [generateTraffic]);

    return {
        status,
        trafficHistory,
        securityEvents,
        triggerSimulatedAttack,
        executeKillSwitch,
        currentLatency: trafficHistory[trafficHistory.length - 1]?.latency || NORMAL_LATENCY
    };
};
