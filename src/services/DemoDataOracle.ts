/**
 * DemoDataOracle.ts
 * 
 * This service provides simulated data and simulated responses for the demo/prototype version 
 * of the application. It encapsulates all "simulated" data generation to keep production 
 * components clean and audit-compliant.
 * 
 * In a production environment, this service would be replaced or disabled.
 */

import { MaintenanceTask } from '../contexts/MaintenanceContext';

// --- BaselineFingerprintWizard Simulations ---

export const getSimulatedAcousticSpectrum = () => {
    return Array.from({ length: 100 }, () => Math.random() * 10);
};

export const getSimulatedEfficiency = (loadLevel: number) => {
    return 90 + loadLevel / 20;
};

// --- ComponentTree Simulations ---

export const getSimulatedAIAnalysis = (nodeId: string) => {
    let caption = "Standardinspektion.";
    let tags = ['General'];

    if (nodeId === 'TURBINE') {
        caption = "KI-ANALYSE: Materialabtrag an der Eintrittskante. Diagnose: Kavitationsfraß (mittel). Empfehlung: Schleifen.";
        tags = ['Kavitation', 'Materialabtrag'];
    }

    return { caption, tags };
};

// --- useSmartActions Simulations ---

export const SIMULATION_THRESHOLDS = {
    MAX_BEARING_TEMP: 65,
    MAX_VIBRATION: 2.0
};

// --- MaintenanceContext Simulations ---

export const SIMULATED_INITIAL_TASKS: MaintenanceTask[] = [
    {
        id: 'T-101',
        componentId: 'BOLTS',
        title: 'Bolt Replacement',
        description: 'Replace Grade 4.6 with Grade 8.8',
        recommendedSpec: 8.8, // Grade
        unit: 'Grade',
        status: 'PENDING',
        priority: 'HIGH'
    },
    {
        id: 'T-102',
        componentId: 'TURBINE',
        title: 'Radial Clearance Check',
        description: 'Verify radial clearance is within 0.05 - 0.10 mm',
        recommendedSpec: 0.10, // Max limit
        unit: 'mm',
        status: 'PENDING',
        priority: 'MEDIUM'
    }
];

export const SIMULATED_TRANSLATIONS: Record<string, string> = {
    "Zategnuto na 450 Nm": "Auf 450 Nm angezogen",
    "Provjera zazora": "Spielprüfung",
    "Zamjena vijaka": "Schraubenaustausch"
};

export const getSimulatedTranslation = (text: string) => {
    return SIMULATED_TRANSLATIONS[text] || "Wartung durchgeführt.";
};

// --- useMaintenancePrediction Simulations ---

export const SIMULATED_COMPONENTS = [
    {
        id: 'thrust-bearing-01',
        name: 'Thrust Bearing Pads',
        designLifeHours: 50000,
        accumulatedRunHours: 35000 // Simulated Base
    },
    {
        id: 'runner-01',
        name: 'Runner Cavitation Check',
        designLifeHours: 8000, // Frequent inspection
        accumulatedRunHours: 4000
    }
];
