import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCerebro } from '../contexts/ProjectContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { KnowledgeNode, ContextTrigger } from '../models/knowledge/ContextTypes';
import { KNOWLEDGE_BASE } from '../data/knowledge/KnowledgeBase';
import { getComponentIdFromRoute } from '../data/knowledge/ComponentTaxonomy';
// import { supabase } from '../services/supabaseClient'; // Removed: Using MaintenanceContext instead
import { evaluateDiagnostics } from '../utils/DiagnosticEngine';

export interface DiagnosticInsight {
    id: string;
    type: 'safe' | 'warning' | 'critical';
    messageKey: string;
    param?: string;
    value?: string | number;
}

/**
 * Context Engine Hook
 * "The Gravity that pulls knowledge to the user"
 */
export const useContextEngine = () => {
    const location = useLocation();
    const { state: techState } = useCerebro();
    const { workOrders } = useMaintenance();

    const [activeNodes, setActiveNodes] = useState<KnowledgeNode[]>([]);
    const [activeLogs, setActiveLogs] = useState<any[]>([]);
    const [activeWorkOrders, setActiveWorkOrders] = useState<any[]>([]);
    const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
    const [metricHistory, setMetricHistory] = useState<Record<string, number[]>>({});

    // Helper: Evaluation Logic for Knowledge Graph
    const evaluateTrigger = (trigger: ContextTrigger, currentRoute: string, sensors: any): boolean => {
        // 1. Route Matcher
        if (trigger.routeMatcher) {
            if (currentRoute.includes(trigger.routeMatcher)) return true;
        }

        // 2. Sensor Data Matcher (if applicable, though typically handled via techState)
        // ... (simplified for now as data source is techState)

        return false;
    };


    // 1. KNOWLEDGE GRAPH RESOLUTION & COMPONENT ID
    useEffect(() => {
        const engineCurrentRoute = location.pathname;
        const currentSensors = techState.francis?.sensors || {};

        // Resolve Component ID
        const resolvedId = getComponentIdFromRoute(engineCurrentRoute);
        // Debug
        console.log('[ContextEngine] Route:', engineCurrentRoute, 'ID:', resolvedId);
        setActiveComponentId(resolvedId);

        // Filter Knowledge Nodes
        const relevantNodes = KNOWLEDGE_BASE.filter(node => {
            return node.triggers.some(trigger => evaluateTrigger(trigger, engineCurrentRoute, currentSensors));
        });

        setActiveNodes(relevantNodes);
    }, [location.pathname, techState.francis?.sensors]);


    // 2. LOGS & WORK ORDERS (Unified Loading)
    const { logs, tasks, isLoading: maintenanceLoading } = useMaintenance();

    useEffect(() => {
        if (!activeComponentId) {
            setActiveLogs([]);
            return;
        }

        const keyword = activeComponentId.split('.').pop()?.toLowerCase();
        if (!keyword) return;

        // Filter Tasks related to this component
        const relevantTaskIds = new Set(
            tasks
                .filter(t =>
                    t.componentId.toLowerCase().includes(keyword) ||
                    t.title.toLowerCase().includes(keyword)
                )
                .map(t => t.id)
        );

        // Filter Logs (LIMIT 3)
        // Matches either a relevant task ID OR the task ID string itself contains the keyword (legacy/fallback)
        const relevantLogs = logs
            .filter(l => relevantTaskIds.has(l.taskId) || l.taskId.toLowerCase().includes(keyword))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3);

        setActiveLogs(relevantLogs);

    }, [activeComponentId, logs, tasks]);

    // 3. WORK ORDER FILTERING (From Context)
    useEffect(() => {
        if (!activeComponentId) {
            setActiveWorkOrders([]);
            return;
        }
        const keyword = activeComponentId.split('.').pop()?.toLowerCase();
        if (!keyword) return;

        const relevantWOs = workOrders.filter(wo =>
            wo.assetName?.toLowerCase().includes(keyword) ||
            wo.description?.toLowerCase().includes(keyword) ||
            wo.component?.toLowerCase().includes(keyword)
        );
        setActiveWorkOrders(relevantWOs);

    }, [activeComponentId, workOrders]);


    // 4. METRIC HISTORY SIMULATION (Sparklines)
    useEffect(() => {
        if (!activeComponentId) return;

        const interval = setInterval(() => {
            setMetricHistory(prev => {
                const next = { ...prev };
                const sensors = techState.francis?.sensors || {};

                // Helper to update history
                const updateHist = (key: string, val: number, variance: number) => {
                    const noise = (Math.random() - 0.5) * variance;
                    const currentHist = prev[key] || Array(20).fill(val); // Initialize with 20 points
                    // Keep last 20
                    next[key] = [...currentHist.slice(1), val + noise];
                };

                if (activeComponentId.includes('penstock')) {
                    updateHist('hoop', sensors.hoopStressMPa || 142.5, 5);
                    updateHist('flow', sensors.flowRate || 42.1, 1);
                }
                if (activeComponentId.includes('transformer')) {
                    updateHist('oilTemp', sensors.transformerOilTemp || 62.1, 0.5);
                    updateHist('load', 85, 2); // Mock load
                }
                if (activeComponentId.includes('generator')) {
                    updateHist('power', sensors.activePowerMW || 142.5, 3);
                    updateHist('voltage', sensors.voltageKV || 16.2, 0.1);
                }

                return next;
            });
        }, 1500); // Update every 1.5s

        return () => clearInterval(interval);
    }, [activeComponentId, techState.francis?.sensors]);


    // 5. LIVE METRICS FORMATION
    const liveMetrics = useMemo(() => {
        if (!activeComponentId || !techState.francis?.sensors) return [];
        const sensors = techState.francis.sensors;
        const metrics: any[] = [];

        // Helper: Determine Sparkline Color based on Trend
        const getTrendColor = (hist: number[], type: 'rising_bad' | 'falling_bad' | 'neutral') => {
            if (!hist || hist.length < 2) return '#22d3ee'; // Cyan default
            const start = hist[0];
            const end = hist[hist.length - 1];
            const change = (end - start) / start;

            // If rising is bad (e.g. Temp, Pressure)
            if (type === 'rising_bad' && change > 0.05) return '#ef4444'; // Red (Dangerous Rise)
            if (type === 'falling_bad' && change < -0.05) return '#ef4444'; // Red (Dangerous Drop)

            return '#22d3ee'; // Stable/Safe Cyan
        };

        if (activeComponentId.includes('penstock')) {
            metrics.push({
                label: 'Hoop Stress',
                value: sensors.hoopStressMPa || 0,
                unit: 'MPa',
                status: (sensors.hoopStressMPa || 0) > 160 ? 'critical' : 'safe',
                history: metricHistory['hoop'],
                color: getTrendColor(metricHistory['hoop'], 'rising_bad')
            });
            metrics.push({
                label: 'Flow Rate',
                value: sensors.flowRate || 0,
                unit: 'm³/s',
                status: 'safe',
                history: metricHistory['flow'],
                color: getTrendColor(metricHistory['flow'], 'neutral')
            });
        }
        else if (activeComponentId.includes('transformer')) {
            metrics.push({
                label: 'Oil Temp',
                value: sensors.transformerOilTemp || 0,
                unit: '°C',
                status: (sensors.transformerOilTemp || 0) > 85 ? 'warning' : 'safe',
                history: metricHistory['oilTemp'],
                color: getTrendColor(metricHistory['oilTemp'], 'rising_bad')
            });
            metrics.push({
                label: 'Load',
                value: 85,
                unit: '%',
                status: 'safe',
                history: metricHistory['load'],
                color: '#22d3ee' // Neutral
            });
        }
        else if (activeComponentId.includes('generator')) {
            metrics.push({
                label: 'Active Power',
                value: sensors.activePowerMW || 0,
                unit: 'MW',
                status: 'safe',
                history: metricHistory['power'],
                color: '#22d3ee'
            });
            metrics.push({
                label: 'Voltage',
                value: sensors.voltageKV || 0,
                unit: 'kV',
                status: (sensors.voltageKV || 0) < 10 ? 'warning' : 'safe',
                history: metricHistory['voltage'],
                color: getTrendColor(metricHistory['voltage'], 'falling_bad')
            });
        }

        return metrics;

    }, [activeComponentId, techState.francis?.sensors, metricHistory]);

    // 6. DIAGNOSTIC WHISPERER (Heuristics)
    const diagnostics = useMemo((): DiagnosticInsight[] => {
        // Mock inputs that aren't in sensor state yet
        const mockInputs = {
            closureTime: 1.8, // Seconds (Simulated for Water Hammer rule)
            load: 95 // % (Simulated for Transformer rule)
        };

        // Import dynamically or use helper if imported at top
        // Since we are inside the hook, we call the utility
        return evaluateDiagnostics(activeComponentId || '', techState.francis?.sensors || {}, mockInputs);

    }, [activeComponentId, techState.francis?.sensors]);


    return {
        activeContext: activeNodes,
        activeComponentId,
        activeLogs,
        activeWorkOrders,
        liveMetrics,
        diagnostics,
        totalInsights: activeNodes.reduce((acc, node) => acc + node.insights.length, 0),
        hasCriticalRisks: (diagnostics.some(d => d.type === 'critical') || activeWorkOrders.some(w => w.priority === 'HIGH')),
        isLoading: maintenanceLoading
    };
};

