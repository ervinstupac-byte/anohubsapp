import React, { useState } from 'react';
import { ManualInjectionSource } from '../../services/telemetry/ManualInjectionSource';
import { PlayCircle, Save, Trash2, Edit } from 'lucide-react';

interface ScenarioStep {
    durationMs: number;
    telemetry: any;
    description: string;
}

interface Scenario {
    id: string;
    name: string;
    description: string;
    steps: ScenarioStep[];
}

const PRESETS: Scenario[] = [
    {
        id: 'cavitation-onset',
        name: 'Cavitation Onset',
        description: 'Simulates gradual drop in efficiency and increase in vibration/noise',
        steps: [
            { durationMs: 2000, telemetry: { flowRate: 45, netHead: 150, vibration: 0.05 }, description: 'Nominal Operation' },
            { durationMs: 2000, telemetry: { flowRate: 48, netHead: 148, vibration: 0.08 }, description: 'Flow Increasing' },
            { durationMs: 2000, telemetry: { flowRate: 52, netHead: 145, vibration: 0.15 }, description: 'Cavitation Inception' },
            { durationMs: 2000, telemetry: { flowRate: 55, netHead: 142, vibration: 0.45 }, description: 'Severe Cavitation' },
            { durationMs: 2000, telemetry: { flowRate: 45, netHead: 150, vibration: 0.05 }, description: 'Recovery' },
        ]
    },
    {
        id: 'load-rejection',
        name: 'Load Rejection',
        description: 'Sudden loss of grid load causing overspeed',
        steps: [
            { durationMs: 2000, telemetry: { activePower: 42, rpm: 428, vibration: 0.05 }, description: 'Full Load' },
            { durationMs: 500, telemetry: { activePower: 0, rpm: 450, vibration: 0.2 }, description: 'Breaker Open' },
            { durationMs: 1000, telemetry: { activePower: 0, rpm: 580, vibration: 0.8 }, description: 'Overspeed Peak' },
            { durationMs: 3000, telemetry: { activePower: 0, rpm: 428, vibration: 0.1 }, description: 'Governor Response' },
        ]
    }
];

export const ScenarioBuilder: React.FC = () => {
    const [scenarios, setScenarios] = useState<Scenario[]>(PRESETS);
    const [activeScenario, setActiveScenario] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

    const runScenario = async (scenarioId: string) => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        setActiveScenario(scenarioId);
        setCurrentStepIndex(0);

        for (let i = 0; i < scenario.steps.length; i++) {
            const step = scenario.steps[i];
            setCurrentStepIndex(i);
            
            // Map step telemetry to full payload (simplified)
            const payload = {
                timestamp: Date.now(),
                hydraulic: {
                    flowCMS: step.telemetry.flowRate || 45,
                    headM: step.telemetry.netHead || 150,
                    powerKW: (step.telemetry.activePower || 40) * 1000,
                    efficiency: 0.9,
                    flow: step.telemetry.flowRate || 45,
                    head: step.telemetry.netHead || 150,
                },
                mechanical: {
                    rpm: step.telemetry.rpm || 428,
                    vibration: step.telemetry.vibration || 0.05,
                    bearingTemp: 55,
                    alignment: 0,
                    vibrationX: step.telemetry.vibration || 0.05,
                    vibrationY: (step.telemetry.vibration || 0.05) * 0.9,
                },
                physics: {
                    surgePressureBar: step.telemetry.surgePressureBar || 0,
                    efficiency: 0.9,
                    // Add other physics metrics if needed
                }
            };

            // Inject
            ManualInjectionSource.getInstance().inject(payload as any);

            // Wait
            await new Promise(r => setTimeout(r, step.durationMs));
        }

        setActiveScenario(null);
        setCurrentStepIndex(-1);
    };

    return (
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <PlayCircle className="w-6 h-6" /> Scenario Builder (Educational Mode)
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
                {scenarios.map(s => (
                    <div key={s.id} className="p-4 bg-slate-800 rounded border border-slate-600 hover:border-cyan-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-white">{s.name}</h4>
                                <p className="text-sm text-slate-400">{s.description}</p>
                            </div>
                            <button 
                                onClick={() => runScenario(s.id)}
                                disabled={!!activeScenario}
                                className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeScenario === s.id ? 'bg-cyan-600 text-white animate-pulse' : 'bg-slate-700 text-cyan-400 hover:bg-slate-600'}`}
                            >
                                <PlayCircle className="w-4 h-4" />
                                {activeScenario === s.id ? `Running Step ${currentStepIndex + 1}/${s.steps.length}` : 'Run Demo'}
                            </button>
                        </div>
                        
                        {/* Progress Bar */}
                        {activeScenario === s.id && (
                            <div className="w-full bg-slate-900 h-2 rounded mt-2 overflow-hidden">
                                <div 
                                    className="bg-cyan-500 h-full transition-all duration-300"
                                    style={{ width: `${((currentStepIndex + 1) / s.steps.length) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded text-yellow-200 text-sm">
                <p>⚠️ <strong>Educational Mode Active:</strong> Scenarios inject synthetic data patterns to demonstrate system response. Real telemetry is overridden.</p>
            </div>
        </div>
    );
};
