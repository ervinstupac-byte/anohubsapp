import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Microscope, BookOpen, Activity, Wrench, ShieldAlert, HelpCircle } from 'lucide-react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useTranslation } from 'react-i18next';

export interface SmartCommand {
    id: string;
    label: string;
    type: 'suggestion' | 'action';
    icon: React.ReactNode;
    action: () => void;
    subtitle?: string;
    priority: 'high' | 'medium' | 'low';
}

export const useSmartSuggestions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    
    // Access telemetry state
    const diagnosis = useTelemetryStore(state => state.diagnosis);
    const erosion = useTelemetryStore(state => state.erosion);
    const resonance = useTelemetryStore(state => state.resonanceState);
    const educationMode = useTelemetryStore(state => state.educationMode);
    const toggleEducation = useTelemetryStore(state => state.toggleEducationMode);

    const suggestions = useMemo(() => {
        const list: SmartCommand[] = [];

        // 0. CONTEXTUAL HELP (The "Helpful" Guide)
        // Checks current route and offers specific guidance
        const path = location.pathname;
        if (path === '/' || path === '/hub') {
             list.push({
                id: 'ctx-hub',
                label: 'Tour: The Digital Twin Hub',
                type: 'suggestion',
                icon: <HelpCircle className="text-emerald-400" />,
                action: () => window.open('https://docs.anohub.com/hub', '_blank'), // Placeholder for internal modal
                subtitle: 'Learn how to navigate the 3D facility map',
                priority: 'medium'
            });
        } else if (path.includes('/forensic')) {
             list.push({
                id: 'ctx-forensic',
                label: 'Guide: Root Cause Analysis',
                type: 'suggestion',
                icon: <HelpCircle className="text-emerald-400" />,
                action: () => toggleEducation(), // Re-using education toggle as a "Help" feature here
                subtitle: 'Understand how to read the polar plots',
                priority: 'medium'
            });
        }

        // 1. CRITICAL DIAGNOSTICS
        if (diagnosis && (diagnosis.severity === 'CRITICAL' || diagnosis.severity === 'WARNING')) {
            const title = diagnosis.messages?.[0]?.en || 'Unknown Issue';
            list.push({
                id: 'sugg-diag-critical',
                label: `Resolve: ${title}`,
                type: 'suggestion',
                icon: <AlertTriangle className="text-red-500" />,
                action: () => navigate('/forensic-hub'),
                subtitle: 'Critical anomaly detected. Open Forensic Hub.',
                priority: 'high'
            });
        }

        // 2. RESONANCE ALERT
        if (resonance.isResonant) {
            list.push({
                id: 'sugg-resonance',
                label: 'Resonance Mitigation',
                type: 'suggestion',
                icon: <Activity className="text-amber-500" />,
                action: () => navigate('/vibration-analysis'), // Assuming route exists
                subtitle: `High vibration detected at ${resonance.frequency}Hz`,
                priority: 'high'
            });
        }

        // 3. EROSION MAINTENANCE
        if (erosion.severity === 'HIGH' || erosion.severity === 'EXTREME') {
            const rateMm = (erosion.bucketThinningRate || 0) / 1000;
            list.push({
                id: 'sugg-erosion',
                label: 'Schedule Runner Coating',
                type: 'suggestion',
                icon: <ShieldAlert className="text-orange-500" />,
                action: () => navigate('/maintenance/hydraulic'),
                subtitle: `Erosion rate critical (${rateMm.toFixed(1)} mm/yr)`,
                priority: 'medium'
            });
        }

        // 4. EDUCATION MODE (The "Helpful" Toggle)
        if (!educationMode) {
            list.push({
                id: 'sugg-edu',
                label: 'Enable Education Mode',
                type: 'action',
                icon: <BookOpen className="text-cyan-400" />,
                action: () => toggleEducation(),
                subtitle: 'Show detailed explanations and physics context',
                priority: 'low'
            });
        }

        // 5. GENERAL PREVENTIVE
        list.push({
            id: 'sugg-logbook',
            label: 'Review Shift Log',
            type: 'suggestion',
            icon: <Wrench className="text-slate-400" />,
            action: () => navigate('/logbook'),
            subtitle: 'Check recent operator notes',
            priority: 'low'
        });

        return list.sort((a, b) => {
            const priorityScore = { high: 3, medium: 2, low: 1 };
            return priorityScore[b.priority] - priorityScore[a.priority];
        });
    }, [diagnosis, erosion, resonance, educationMode, navigate, toggleEducation, location.pathname]);

    return suggestions;
};
