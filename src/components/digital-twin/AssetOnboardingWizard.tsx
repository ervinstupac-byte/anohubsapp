/**
 * AssetOnboardingWizard
 * Multi-step wizard for complete Asset DNA configuration
 * Auto-unlocks modules based on turbine type and configuration
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle, Settings, Cpu, Gauge, Droplets, Mountain } from 'lucide-react';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { useAssetContext } from '../../contexts/AssetContext';
import { AssetIdentity, TurbineType, Orientation, TransmissionType, PenstockMaterial } from '../../types/assetIdentity';
import { AssetIdentityService } from '../../services/AssetIdentityService';
import { useNavigate } from 'react-router-dom';

type WizardStep = 'physical' | 'sensors' | 'francis' | 'hydraulics' | 'environmental' | 'review';

export const AssetOnboardingWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { dispatch } = useProjectEngine();
    const { addAsset } = useAssetContext();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<WizardStep>('physical');
    const [assetData, setAssetData] = useState<Partial<AssetIdentity>>({});

    // Physical Architecture State
    const [turbineType, setTurbineType] = useState<TurbineType>('FRANCIS');
    const [orientation, setOrientation] = useState<Orientation>('VERTICAL');
    const [transmission, setTransmission] = useState<TransmissionType>('DIRECT');
    const [penstockType, setPenstockType] = useState<PenstockMaterial>('STEEL');

    // Sensor Inventory State
    const [hasGeneratorVibSensor, setHasGeneratorVibSensor] = useState(false);
    const [hasTurbineVibSensor, setHasTurbineVibSensor] = useState(false);
    const [hasGearboxVibSensor, setHasGearboxVibSensor] = useState(false);
    const [hasHPUSensors, setHasHPUSensors] = useState(false);

    // Francis Specific State
    const [frontClearance, setFrontClearance] = useState(0.40);
    const [backClearance, setBackClearance] = useState(0.40);
    const [upperLabyrinth, setUpperLabyrinth] = useState(0.40);
    const [lowerLabyrinth, setLowerLabyrinth] = useState(0.40);

    // Hydraulics State
    const [jackingPressure, setJackingPressure] = useState(40);
    const [jackingFlow, setJackingFlow] = useState(25);
    const [oilPressure, setOilPressure] = useState(2.5);

    // Environmental State
    const [hasSludgeCleaner, setHasSludgeCleaner] = useState(false);
    const [noiseDB, setNoiseDB] = useState(75);

    // Conditional Module Checks
    const showJackingModule = orientation === 'VERTICAL';
    const showFrancisModule = turbineType === 'FRANCIS';
    const showGearboxSensors = transmission === 'GEARBOX';
    const manualInspectionRequired = !hasGeneratorVibSensor && !hasTurbineVibSensor;

    const handleNext = () => {
        const steps: WizardStep[] = ['physical', 'sensors'];
        if (showFrancisModule) steps.push('francis');
        steps.push('hydraulics', 'environmental', 'review');

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handlePrevious = () => {
        const steps: WizardStep[] = ['physical', 'sensors'];
        if (showFrancisModule) steps.push('francis');
        steps.push('hydraulics', 'environmental', 'review');

        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const handleComplete = () => {
        // Build complete AssetIdentity
        const identity = AssetIdentityService.createDefaultIdentity(
            Date.now(),
            'New HPP Asset',
            turbineType,
            'System Admin'
        );

        // Apply configurations
        identity.machineConfig.orientation = orientation;
        identity.machineConfig.transmissionType = transmission;
        identity.environmentalBaseline.penstockType = penstockType;
        identity.environmentalBaseline.sludgeRemoval.hasSludgeCleaner = hasSludgeCleaner;
        identity.environmentalBaseline.sludgeRemoval.erosionRiskScore =
            AssetIdentityService.calculateErosionRisk(identity.environmentalBaseline);
        identity.environmentalBaseline.noiseLevel.operatingDB = noiseDB;

        // Shaft Jacking (if vertical)
        if (showJackingModule) {
            identity.shaftJacking = {
                enabled: true,
                systemPressureBar: jackingPressure,
                systemFlowLPM: jackingFlow,
                liftingDistance001MM: 50,
                jackingDurationSeconds: 120,
                minimumJackingPressureBar: jackingPressure * 0.8,
                pressureSensorInstalled: hasHPUSensors,
                flowSensorInstalled: hasHPUSensors,
                positionSensorInstalled: false
            };
        }

        // Francis Advanced (if Francis)
        if (showFrancisModule) {
            identity.specializedAdvanced = {
                frontRunnerClearanceMM: frontClearance,
                backRunnerClearanceMM: backClearance,
                spiralClearanceMM: 0.5,
                labyrinthGaps: {
                    upperLabyrinthMM: upperLabyrinth,
                    lowerLabyrinthMM: lowerLabyrinth,
                    sealType: 'METALLIC'
                },
                draftTubePressure: {
                    nominalBar: -0.3,
                    minBar: -0.6,
                    maxBar: 0.0,
                    sensorInstalled: hasHPUSensors
                },
                backRunnerPressure: {
                    nominalBar: -0.1,
                    minBar: -0.4,
                    maxBar: 0.2,
                    sensorInstalled: hasHPUSensors
                },
                axialThrustBalanced: false,
                pressureDifferenceBar: 0
            };

            const balance = AssetIdentityService.calculateAxialThrustBalance(identity.specializedAdvanced);
            identity.specializedAdvanced.axialThrustBalanced = balance.balanced;
            identity.specializedAdvanced.pressureDifferenceBar = balance.pressureDifference;
        }

        // Sensor Matrix
        if (hasGeneratorVibSensor) {
            identity.sensorMatrix.vibrationSensors.generator.push({
                id: 'gen_vib_1',
                location: 'Generator DE Bearing',
                sensorType: 'ACCELEROMETER',
                installed: true,
                mountingType: 'PERMANENT',
                measurementAxis: '3-AXIS'
            });
        }

        if (hasTurbineVibSensor) {
            identity.sensorMatrix.vibrationSensors.turbine.push({
                id: 'turb_vib_1',
                location: 'Turbine Upper Guide Bearing',
                sensorType: 'VELOCITY',
                installed: true,
                mountingType: 'PERMANENT',
                measurementAxis: 'RADIAL'
            });
        }

        if (showGearboxSensors && hasGearboxVibSensor) {
            identity.sensorMatrix.vibrationSensors.gearbox = [{
                id: 'gb_vib_1',
                location: 'Gearbox Input Shaft',
                sensorType: 'ACCELEROMETER',
                installed: true,
                mountingType: 'PERMANENT',
                measurementAxis: '3-AXIS'
            }];
        }

        // Generate upgrade recommendations
        identity.sensorMatrix.upgradeRecommendations = AssetIdentityService.generateUpgradeRecommendations(
            identity.sensorMatrix,
            identity.machineConfig
        );

        // Calculate HPU Health
        identity.fluidIntelligence.healthScore = AssetIdentityService.calculateHPUHealth(identity.fluidIntelligence);

        // Convert turbineType to proper case for TechnicalSchema compatibility
        const typeMap: Record<string, 'Pelton' | 'Kaplan' | 'Francis'> = {
            'PELTON': 'Pelton',
            'KAPLAN': 'Kaplan',
            'FRANCIS': 'Francis'
        };
        const properCaseType = typeMap[turbineType] || 'Francis';

        // 1. Dispatch to Project Context (Current Session)
        dispatch({ type: 'SET_ASSET', payload: { id: identity.assetId, name: identity.assetName, location: 'New Asset', type: properCaseType } });

        // 2. Persist to Global Asset Store (Permanent)
        addAsset({
            name: identity.assetName,
            type: 'HPP', // Always HPP for this wizard
            location: 'New Asset Location', // TODO: Add location step
            coordinates: [44.0, 18.0], // Default coordinates
            capacity: 0, // TODO: Add capacity step
            status: 'Operational',
            turbine_type: turbineType,
            specs: {
                identity: identity, // Store full identity
                turbineProfile: {
                    type: properCaseType.toLowerCase() as any,
                    configuration: orientation.toLowerCase() as any,
                    rpmNominal: 500, // Default
                    specificParams: {}
                }
            }
        }).then(() => {
            onComplete();
            navigate('/fleet'); // Redirect to fleet view
        }).catch(err => {
            console.error("Failed to persist asset:", err);
            // Still complete locally
            onComplete();
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <StepIndicator active={currentStep === 'physical'} complete={currentStep !== 'physical'} icon={<Settings />} label="Physical" />
                    <div className="flex-1 h-1 bg-slate-800 mx-2" />
                    <StepIndicator active={currentStep === 'sensors'} complete={currentStep !== 'sensors' && currentStep !== 'physical'} icon={<Cpu />} label="Sensors" />
                    {showFrancisModule && (
                        <>
                            <div className="flex-1 h-1 bg-slate-800 mx-2" />
                            <StepIndicator active={currentStep === 'francis'} icon={<Gauge />} label="Francis" />
                        </>
                    )}
                    <div className="flex-1 h-1 bg-slate-800 mx-2" />
                    <StepIndicator active={currentStep === 'hydraulics'} icon={<Droplets />} label="Hydraulics" />
                    <div className="flex-1 h-1 bg-slate-800 mx-2" />
                    <StepIndicator active={currentStep === 'environmental'} icon={<Mountain />} label="Environment" />
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {currentStep === 'physical' && (
                    <motion.div
                        key="physical"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2 text-[#2dd4bf]">Physical Architecture</h2>
                        <p className="text-slate-400 mb-8">Define mechanical DNA of your turbine</p>

                        <div className="space-y-6">
                            {/* Turbine Type */}
                            <div>
                                <label className="block text-sm font-bold mb-3">Turbine Type</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['PELTON', 'KAPLAN', 'FRANCIS'] as TurbineType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setTurbineType(type)}
                                            className={`py-3 rounded font-bold transition-all ${turbineType === type
                                                ? 'bg-[#2dd4bf] text-black'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orientation */}
                            <div>
                                <label className="block text-sm font-bold mb-3">Orientation</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['VERTICAL', 'HORIZONTAL'] as Orientation[]).map(orient => (
                                        <button
                                            key={orient}
                                            onClick={() => setOrientation(orient)}
                                            className={`py-3 rounded font-bold transition-all ${orientation === orient
                                                ? 'bg-[#2dd4bf] text-black'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {orient}
                                        </button>
                                    ))}
                                </div>
                                {orientation === 'VERTICAL' && (
                                    <div className="mt-2 p-3 bg-blue-950/20 border border-blue-500/30 rounded text-sm text-blue-200">
                                        ✓ Shaft Jacking Module will be activated
                                    </div>
                                )}
                            </div>

                            {/* Transmission */}
                            <div>
                                <label className="block text-sm font-bold mb-3">Transmission Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['DIRECT', 'GEARBOX'] as TransmissionType[]).map(trans => (
                                        <button
                                            key={trans}
                                            onClick={() => setTransmission(trans)}
                                            className={`py-3 rounded font-bold transition-all ${transmission === trans
                                                ? 'bg-[#2dd4bf] text-black'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {trans}
                                        </button>
                                    ))}
                                </div>
                                {transmission === 'GEARBOX' && (
                                    <div className="mt-2 p-3 bg-blue-950/20 border border-blue-500/30 rounded text-sm text-blue-200">
                                        ✓ Gearbox sensors and oil tracking will be enabled
                                    </div>
                                )}
                            </div>

                            {/* Penstock Type */}
                            <div>
                                <label className="block text-sm font-bold mb-3">Penstock Material (affects water hammer)</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {(['CONCRETE', 'STEEL', 'PLASTIC', 'FRP'] as PenstockMaterial[]).map(mat => (
                                        <button
                                            key={mat}
                                            onClick={() => setPenstockType(mat)}
                                            className={`py-2 px-3 rounded text-sm font-bold transition-all ${penstockType === mat
                                                ? 'bg-[#2dd4bf] text-black'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {mat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'sensors' && (
                    <motion.div
                        key="sensors"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2 text-[#2dd4bf]">Sensor Inventory</h2>
                        <p className="text-slate-400 mb-8">Map your existing condition monitoring sensors</p>

                        {manualInspectionRequired && (
                            <div className="mb-6 p-4 bg-amber-950/30 border border-amber-500/50 rounded">
                                <div className="flex items-center gap-2 text-amber-300">
                                    <AlertCircle className="w-5 h-5" />
                                    <strong>Manual Inspection Required</strong>
                                </div>
                                <p className="text-sm text-amber-200 mt-2">
                                    No vibration sensors detected. Asset will be marked for manual inspection during service checklists.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <SensorCheckbox
                                label="Generator Vibration Sensor"
                                sublabel="Bearing health monitoring"
                                checked={hasGeneratorVibSensor}
                                onChange={setHasGeneratorVibSensor}
                            />
                            <SensorCheckbox
                                label="Turbine Vibration Sensor"
                                sublabel="Cavitation & misalignment detection"
                                checked={hasTurbineVibSensor}
                                onChange={setHasTurbineVibSensor}
                            />
                            {showGearboxSensors && (
                                <SensorCheckbox
                                    label="Gearbox Vibration Sensor"
                                    sublabel="Tooth damage early warning"
                                    checked={hasGearboxVibSensor}
                                    onChange={setHasGearboxVibSensor}
                                />
                            )}
                            <SensorCheckbox
                                label="HPU Pressure & Temperature Sensors"
                                sublabel="Oil system health tracking"
                                checked={hasHPUSensors}
                                onChange={setHasHPUSensors}
                            />
                        </div>
                    </motion.div>
                )}

                {currentStep === 'francis' && showFrancisModule && (
                    <motion.div
                        key="francis"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2 text-[#2dd4bf]">Francis Specific Parameters</h2>
                        <p className="text-slate-400 mb-8">Baseline clearances and pressure zones</p>

                        <div className="space-y-6">
                            <MeasurementInput
                                label="Front Runner Clearance"
                                value={frontClearance}
                                onChange={setFrontClearance}
                                unit="mm"
                                min={0.30}
                                max={0.60}
                            />
                            <MeasurementInput
                                label="Back Runner Clearance"
                                value={backClearance}
                                onChange={setBackClearance}
                                unit="mm"
                                min={0.30}
                                max={0.60}
                            />
                            <MeasurementInput
                                label="Upper Labyrinth Gap"
                                value={upperLabyrinth}
                                onChange={setUpperLabyrinth}
                                unit="mm"
                                min={0.20}
                                max={0.80}
                            />
                            <MeasurementInput
                                label="Lower Labyrinth Gap"
                                value={lowerLabyrinth}
                                onChange={setLowerLabyrinth}
                                unit="mm"
                                min={0.20}
                                max={0.80}
                            />
                        </div>
                    </motion.div>
                )}

                {currentStep === 'hydraulics' && (
                    <motion.div
                        key="hydraulics"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2 text-[#2dd4bf]">Hydraulics & Lubrication</h2>
                        <p className="text-slate-400 mb-8">HPU and jacking system parameters</p>

                        <div className="space-y-6">
                            {showJackingModule && (
                                <>
                                    <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded mb-4">
                                        <strong className="text-blue-200">🔧 Shaft Jacking System Active</strong>
                                        <p className="text-sm text-blue-300 mt-1">Vertical orientation detected - jacking parameters required</p>
                                    </div>
                                    <MeasurementInput
                                        label="Jacking Pressure"
                                        value={jackingPressure}
                                        onChange={setJackingPressure}
                                        unit="bar"
                                        min={20}
                                        max={60}
                                    />
                                    <MeasurementInput
                                        label="Jacking Flow"
                                        value={jackingFlow}
                                        onChange={setJackingFlow}
                                        unit="l/min"
                                        min={10}
                                        max={50}
                                    />
                                </>
                            )}
                            <MeasurementInput
                                label="HPU Operating Pressure"
                                value={oilPressure}
                                onChange={setOilPressure}
                                unit="bar"
                                min={1.0}
                                max={5.0}
                            />
                        </div>
                    </motion.div>
                )}

                {currentStep === 'environmental' && (
                    <motion.div
                        key="environmental"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2 text-[#2dd4bf]">Environmental Baseline</h2>
                        <p className="text-slate-400 mb-8">Site conditions and risk factors</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-3">Sludge Cleaner Installed</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: true, label: 'YES - Has Cleaner' },
                                        { value: false, label: 'NO - Manual Cleaning' }
                                    ].map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setHasSludgeCleaner(opt.value)}
                                            className={`py-3 rounded font-bold transition-all ${hasSludgeCleaner === opt.value
                                                ? 'bg-[#2dd4bf] text-black'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {!hasSludgeCleaner && (
                                    <div className="mt-2 p-3 bg-red-950/20 border border-red-500/30 rounded text-sm text-red-200">
                                        ⚠️ Erosion Risk Score +5 (No automatic sludge removal)
                                    </div>
                                )}
                            </div>

                            <MeasurementInput
                                label="Operating Noise Level (dB Baseline)"
                                value={noiseDB}
                                onChange={setNoiseDB}
                                unit="dB"
                                min={50}
                                max={100}
                            />
                        </div>
                    </motion.div>
                )}

                {currentStep === 'review' && (
                    <motion.div
                        key="review"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-2 text-[#2dd4bf]">Review Configuration</h2>
                        <p className="text-slate-400 mb-8">Asset DNA Summary</p>

                        <div className="space-y-4 bg-slate-900 border border-slate-800 rounded p-6">
                            <ReviewItem label="Turbine Type" value={turbineType} />
                            <ReviewItem label="Orientation" value={orientation} />
                            <ReviewItem label="Transmission" value={transmission} />
                            <ReviewItem label="Penstock" value={penstockType} />
                            <ReviewItem label="Generator Vib Sensor" value={hasGeneratorVibSensor ? 'Installed' : 'Not Installed'} />
                            <ReviewItem label="Turbine Vib Sensor" value={hasTurbineVibSensor ? 'Installed' : 'Not Installed'} />
                            {showJackingModule && (
                                <>
                                    <ReviewItem label="Jacking Pressure" value={`${jackingPressure} bar`} />
                                    <ReviewItem label="Jacking Flow" value={`${jackingFlow} l/min`} />
                                </>
                            )}
                            {showFrancisModule && (
                                <>
                                    <ReviewItem label="Front Clearance" value={`${frontClearance} mm`} />
                                    <ReviewItem label="Upper Labyrinth" value={`${upperLabyrinth} mm`} />
                                </>
                            )}
                            <ReviewItem label="Sludge Cleaner" value={hasSludgeCleaner ? 'YES' : 'NO (Erosion +5)'} />
                            <ReviewItem label="Noise Baseline" value={`${noiseDB} dB`} />
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full mt-6 py-4 bg-[#2dd4bf] hover:bg-emerald-400 text-black rounded font-bold flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Complete Asset Onboarding
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep !== 'review' && (
                <div className="flex gap-4 max-w-2xl mx-auto mt-8">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 'physical'}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 bg-[#2dd4bf] hover:bg-emerald-400 text-black rounded flex items-center justify-center gap-2 font-bold"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper Components
const StepIndicator: React.FC<{ active: boolean; complete?: boolean; icon: React.ReactNode; label: string }> = ({ active, complete, icon, label }) => (
    <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#2dd4bf] text-black' : complete ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
            {complete ? <Check className="w-6 h-6" /> : icon}
        </div>
        <span className={`text-xs mt-2 ${active ? 'text-[#2dd4bf]' : 'text-slate-500'}`}>{label}</span>
    </div>
);

const SensorCheckbox: React.FC<{ label: string; sublabel: string; checked: boolean; onChange: (val: boolean) => void }> = ({ label, sublabel, checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`p-4 rounded cursor-pointer transition-all ${checked ? 'bg-emerald-950/30 border-2 border-emerald-500' : 'bg-slate-900 border-2 border-slate-700'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${checked ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600'
                }`}>
                {checked && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
                <div className="font-bold">{label}</div>
                <div className="text-sm text-slate-400">{sublabel}</div>
            </div>
        </div>
    </div>
);

const MeasurementInput: React.FC<{ label: string; value: number; onChange: (val: number) => void; unit: string; min: number; max: number }> = ({ label, value, onChange, unit, min, max }) => (
    <div>
        <label className="block text-sm font-bold mb-2">{label}</label>
        <div className="flex items-center gap-4">
            <input
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="flex-1"
            />
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-4 py-2 min-w-[120px]">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="bg-transparent text-white text-right font-mono flex-1 outline-none"
                    step={0.01}
                />
                <span className="text-slate-400 text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

const ReviewItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-800 last:border-0">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);
