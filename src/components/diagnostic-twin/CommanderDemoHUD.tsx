import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCerebro } from '../../contexts/ProjectContext';
import { DemoScenario, DEFAULT_TECHNICAL_STATE } from '../../core/TechnicalSchema';
import {
    Activity,
    Droplets,
    Thermometer,
    Zap,
    TrendingDown,
    Play,
    Square,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// TACTICAL SCENARIOS CONFIGURATION
const SCENARIOS = [
    {
        id: 'NORMAL' as DemoScenario,
        icon: Activity,
        color: 'cyan',
        label: 'Normal Operations',
        description: 'Stabilized nominal flow & 92% efficiency'
    },
    {
        id: 'WATER_HAMMER' as DemoScenario,
        icon: Droplets,
        color: 'red',
        label: 'Water Hammer',
        description: 'Joukowsky Spike (150% Nominal Pressure)'
    },
    {
        id: 'BEARING_FAILURE' as DemoScenario,
        icon: Thermometer,
        color: 'orange',
        label: 'Bearing Failure',
        description: 'Vibration creep & Orbit deformation'
    },
    {
        id: 'CAVITATION' as DemoScenario,
        icon: Zap,
        color: 'purple',
        label: 'Cavitation Event',
        description: 'Acoustic Floor Shift & Erosion risk'
    },
    {
        id: 'GRID_LOSS' as DemoScenario,
        icon: TrendingDown,
        color: 'yellow',
        label: 'Grid Loss',
        description: 'Load rejection & speed spike'
    },
];

export const CommanderDemoHUD: React.FC = () => {
    const { t } = useTranslation();
    const { state, dispatch } = useCerebro();
    const [isExpanded, setIsExpanded] = useState(false);

    // SMOTTH INTERPOLATION LOGIC
    const triggerScenario = (scenario: DemoScenario) => {
        // First, set the demo state
        dispatch({
            type: 'SET_DEMO_MODE',
            payload: { active: true, scenario }
        });

        // The actual numerical transitions happen here in the HUD component 
        // acting as a virtual PLC/Governor for the demo.
        let targetValues: any = {};

        switch (scenario) {
            case 'NORMAL':
                targetValues = {
                    hydraulic: { flow: 42.5, head: 152.0, efficiency: 0.92 },
                    mechanical: { vibrationX: 0.012, vibrationY: 0.008, bearingTemp: 42 }
                };
                break;
            case 'WATER_HAMMER':
                targetValues = {
                    hydraulic: { flow: 3.8, head: 675 }, // 150% Surge
                    mechanical: { vibrationX: 0.045, vibrationY: 0.042 }
                };
                break;
            case 'BEARING_FAILURE':
                targetValues = {
                    mechanical: {
                        vibrationX: 0.12, // Banana shape 
                        vibrationY: 0.04,
                        bearingTemp: 78
                    }
                };
                break;
            case 'CAVITATION':
                targetValues = {
                    hydraulic: { efficiency: 0.84 },
                };
                // Separate dispatch for acoustic floor since it is a different case in reducer
                dispatch({
                    type: 'UPDATE_ACOUSTIC_DATA',
                    payload: { cavitationIntensity: 8.5, bearingGrindIndex: 4.2 }
                });
                break;
            case 'GRID_LOSS':
                targetValues = {
                    mechanical: { rpm: 625 }
                };
                break;
        }

        // Apply with a slight delay or just immediate - for DEMO we want impact
        if (targetValues.hydraulic) dispatch({ type: 'UPDATE_HYDRAULIC', payload: targetValues.hydraulic });
        if (targetValues.mechanical) dispatch({ type: 'UPDATE_MECHANICAL', payload: targetValues.mechanical });
    };

    const stopDemo = () => {
        dispatch({
            type: 'SET_DEMO_MODE',
            payload: { active: false, scenario: null }
        });
        // Reset to nominal values
        dispatch({ type: 'UPDATE_HYDRAULIC', payload: DEFAULT_TECHNICAL_STATE.hydraulic });
        dispatch({ type: 'UPDATE_MECHANICAL', payload: DEFAULT_TECHNICAL_STATE.mechanical });
        dispatch({ type: 'UPDATE_ACOUSTIC_DATA', payload: { cavitationIntensity: 0.5, bearingGrindIndex: 0.2 } });
    };

    // User requested removal of the live telemetry HUD overlay.
    // Render nothing to remove the floating telemetry/demo UI.
    return null;
};
