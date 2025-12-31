import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCerebro } from '../contexts/ProjectContext';
import { KnowledgeNode, ContextTrigger } from '../models/knowledge/ContextTypes';
import { KNOWLEDGE_BASE } from '../data/knowledge/KnowledgeBase';
import { getComponentIdFromRoute } from '../data/knowledge/ComponentTaxonomy';
import { supabase } from '../services/supabaseClient';

/**
 * Context Engine Hook
 * "The Gravity that pulls knowledge to the user"
 */
export const useContextEngine = () => {
    const location = useLocation();
    const { state: techState } = useCerebro();
    const [activeNodes, setActiveNodes] = useState<KnowledgeNode[]>([]);
    const [activeLogs, setActiveLogs] = useState<any[]>([]);
    const [activeWorkOrders, setActiveWorkOrders] = useState<any[]>([]);
    const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

    // 1. KNOWLEDGE GRAPH RESOLUTION
    useEffect(() => {
        const engineCurrentRoute = location.pathname;
        const currentSensors = techState.francis?.sensors || {};

        // Resolve Component ID
        const resolvedId = getComponentIdFromRoute(engineCurrentRoute);
        setActiveComponentId(resolvedId);

        // Filter Knowledge Nodes
        const relevantNodes = KNOWLEDGE_BASE.filter(node => {
            return node.triggers.some(trigger => evaluateTrigger(trigger, engineCurrentRoute, currentSensors));
        });

        setActiveNodes(relevantNodes);

    }, [location.pathname, techState.francis?.sensors, techState.lastRecalculation]);

    // 2. SUPABASE "NEURAL CONNECTION" (Fetch Logs/WO)
    useEffect(() => {
        if (!activeComponentId) {
            setActiveLogs([]);
            setActiveWorkOrders([]);
            return;
        }

        const fetchContextData = async () => {
            // Extract a keyword from the ID (e.g. 'francis.civil.penstock' -> 'penstock')
            // This allows fuzzy matching against legacy data
            const keyword = activeComponentId.split('.').pop();

            if (!keyword) return;

            // Fetch Work Orders
            const { data: woData } = await supabase
                .from('work_orders')
                .select('*')
                .ilike('component', `%${keyword}%`)
                .neq('status', 'COMPLETED') // Only active
                .limit(5);

            if (woData) setActiveWorkOrders(woData);

            // Fetch Maintenance Logs (Recent)
            const { data: logData } = await supabase
                .from('maintenance_logs')
                .select('*')
                .ilike('task_id', `%${keyword}%`)
                .order('timestamp', { ascending: false })
                .limit(3);

            if (logData) setActiveLogs(logData);
        };

        fetchContextData();
    }, [activeComponentId]);

    // 3. LIVE METRICS EXTRACTION
    // Map active component to relevant sensors from the core physics engine
    const [liveMetrics, setLiveMetrics] = useState<any[]>([]);

    useEffect(() => {
        if (!techState.francis?.sensors || !activeComponentId) return;

        // Simple mapping based on component ID keywords
        // In a real scenario, this would be a more robust lookup map
        const sensors = techState.francis.sensors as Record<string, number>;
        const metrics = [];

        if (activeComponentId.includes('penstock') || activeComponentId.includes('water_hammer')) {
            metrics.push({ label: 'Hoop Stress', value: (sensors.hoopStressMPa || 0).toFixed(1), unit: 'MPa', status: (sensors.hoopStressMPa || 0) > 150 ? 'warning' : 'safe' });
            metrics.push({ label: 'Flow Rate', value: (sensors.flowRate || 0).toFixed(1), unit: 'm³/s', status: 'normal' });
        } else if (activeComponentId.includes('bearing')) {
            metrics.push({ label: 'Oil Temp', value: (sensors.bearingTemp || 0).toFixed(1), unit: '°C', status: (sensors.bearingTemp || 0) > 60 ? 'warning' : 'safe' });
            metrics.push({ label: 'Vibration', value: (sensors.vibration || 0).toFixed(2), unit: 'mm/s', status: (sensors.vibration || 0) > 2.5 ? 'critical' : 'safe' });
        } else if (activeComponentId.includes('generator') || activeComponentId.includes('excitation')) {
            metrics.push({ label: 'Power', value: (sensors.activePowerMW || 0).toFixed(1), unit: 'MW', status: 'normal' });
            metrics.push({ label: 'Voltage', value: (sensors.voltageKV || 0).toFixed(1), unit: 'kV', status: (sensors.voltageKV || 0) < 10 ? 'warning' : 'safe' });
        } else if (activeComponentId.includes('transformer')) {
            metrics.push({ label: 'Oil Temp', value: (sensors.transformerOilTemp || 55).toFixed(1), unit: '°C', status: 'normal' });
            metrics.push({ label: 'Load', value: '85', unit: '%', status: 'normal' });
        }

        setLiveMetrics(metrics);
    }, [activeComponentId, techState.francis?.sensors]);

    return {
        activeContext: activeNodes,
        activeComponentId,
        activeLogs,
        activeWorkOrders,
        liveMetrics, // <--- EXPOSED
        totalInsights: activeNodes.reduce((acc, node) => acc + node.insights.length, 0),
        hasCriticalRisks: activeNodes.some(n => n.tags.includes('critical')) || activeWorkOrders.some(w => w.priority === 'HIGH')
    };
};

// ==========================================
// EVALUATION LOGIC
// ==========================================

const evaluateTrigger = (trigger: ContextTrigger, currentRoute: string, sensors: any): boolean => {
    // 1. Route Matcher
    if (trigger.routeMatcher) {
        if (currentRoute.includes(trigger.routeMatcher)) return true;
    }

    // 2. Sensor Data Matcher
    if (trigger.sensorId && trigger.threshold) {
        const key = trigger.sensorId.split('.').pop();
        const value = sensors[key as string];

        if (value !== undefined) {
            const { min, max, condition } = trigger.threshold;

            if (condition === 'GT' && min !== undefined && value > min) return true;
            if (condition === 'LT' && max !== undefined && value < max) return true;
            if (condition === 'EQ' && value === min) return true;
            // Fallbacks
            if (min !== undefined && value > min) return true;
            if (max !== undefined && value < max) return true;
        }
    }

    return false;
};
