import React, { useState, useEffect } from 'react';
import { ScenarioBuilder } from './education/ScenarioBuilder';
import { KernelMonitor } from './education/KernelMonitor';
import { TaskManager } from './education/TaskManager';
import { TerminalConsole } from './education/TerminalConsole';
import { Settings, Save, RefreshCw, Database, Archive, AlertTriangle, Info, Zap, TrendingUp, Camera, Image as ImageIcon, ShieldAlert, Activity, PlayCircle, Sliders, Cpu, Server, Terminal } from 'lucide-react';
import Decimal from 'decimal.js';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { ManualInjectionSource } from '../services/telemetry/ManualInjectionSource';
import { LiveStreamConnector } from '../services/LiveStreamConnector';
import { calculateOperatingZone, calculateCavitationRisk } from '../features/physics-core/PhysicsCalculations.logic';
import { ErrorHandlerService, CavitationStatus, ErosionStatus } from '../services/ErrorHandlerService';
import { FrancisHorizontalEngine } from '../lib/engines/FrancisHorizontalEngine';
import { VibrationForensics } from '../services/core/VibrationForensics';
import { VibrationExpert } from '../services/VibrationExpert';
import { ForensicDiagnosticService } from '../services/ForensicDiagnosticService';
import { generateSignature } from '../services/ForensicSignatureService';
import { OilAnalysisService } from '../services/OilAnalysisService';
import { AIPredictionService } from '../services/AIPredictionService';
import { DrTurbineAI, ActionCard } from '../services/DrTurbineAI';
import { ResonanceHarvesterManager } from '../services/ResonanceHarvesterManager';
import { LifeExtensionEngine } from '../services/LifeExtensionEngine';
import { StructuralIntegrityService } from '../services/StructuralIntegrityService';
import { CavitationErosionService } from '../services/CavitationErosionService';
import { HydraulicTransientSafety } from '../services/HydraulicTransientSafety';
import { AcousticFingerprintingService } from '../services/AcousticFingerprintingService';
import { CrossCorrelationService } from '../services/CrossCorrelationService';
import { GalvanicCorrosionService } from '../services/GalvanicCorrosionService';
import ThermalManagementCore from '../services/ThermalManagementCore';
import { WicketGateKinematics } from '../services/WicketGateKinematics';
import GeneratorAirGapSentinel from '../services/GeneratorAirGapSentinel';
import { TransformerOilAnalyst } from '../services/TransformerOilAnalyst';
import { StatorInsulationGuardian } from '../services/StatorInsulationGuardian';
import { ShaftSealGuardian } from '../services/ShaftSealGuardian';
import { GovernorHPUGuardian } from '../services/GovernorHPUGuardian';
import { DamStabilityAnalyser } from '../services/DamStabilityAnalyser';
import { TrashRackRobot } from '../services/TrashRackRobot';
import { TimeSpoofingDetector, TimeSourceStatus } from '../services/TimeSpoofingDetector';
import { ThrustBearingMaster } from '../services/ThrustBearingMaster';
import { SpecialistNotebook, DamageReport } from '../services/SpecialistNotebook';
import { ComputerVisionService, DetectionResult } from '../services/ComputerVisionService'; 
import { ParticleAnalysisService } from '../services/ParticleAnalysisService';
import { VideoForensicsService } from '../services/VideoForensicsService';
import CoolingSystemGuardian from '../services/CoolingSystemGuardian';
import MechanicalBrakeGuardian from '../services/MechanicalBrakeGuardian';
import GridStabilityGuardian from '../services/GridStabilityGuardian';
import LogisticsSentinel from '../services/LogisticsSentinel';
import { DewateringSovereign } from '../services/DewateringSovereign';
import { FireSuppressionSystem } from '../services/FireSuppressionSystem';
import { PneumaticSystemManager } from '../services/PneumaticSystemManager';
import { OilRegenerationLogic } from '../services/OilRegenerationLogic';
import { SurgeProtector } from '../services/SurgeProtector';
import { SeismicResponseMonitor } from '../services/SeismicResponseMonitor';

export const ManualDataEntry: React.FC = () => {
    const updateTelemetry = useTelemetryStore(state => state.updateTelemetry);
    const addSnapshot = useTelemetryStore(state => state.addSnapshot);
    const feedPattern = useTelemetryStore(state => state.feedPattern);
    const hydraulic = useTelemetryStore(state => state.hydraulic);
    const mechanical = useTelemetryStore(state => state.mechanical);

    const [activeTab, setActiveTab] = useState<'manual' | 'scenario' | 'kernel' | 'processes' | 'console'>('manual');

    // Activates Manual Injection Mode in LiveStreamConnector
    useEffect(() => {
        LiveStreamConnector.connect({ manualMode: true });
        return () => {
            LiveStreamConnector.disconnect();
        };
    }, []);

    // Push changes to ManualInjectionSource whenever form updates
    const broadcastTelemetry = (newData: any) => {
        const payload = {
            timestamp: Date.now(),
            hydraulic: {
                flowCMS: newData.flowRate,
                headM: newData.netHead,
                efficiency: 0.92, // Placeholder or calculated
                powerKW: newData.activePower * 1000,
                // Add required properties for HydraulicStream
                flow: newData.flowRate,
                head: newData.netHead,
                waterHead: new Decimal(newData.netHead),
                flowRate: new Decimal(newData.flowRate),
                cavitationThreshold: new Decimal(0.1)
            },
            mechanical: {
                rpm: newData.rpm,
                vibration: newData.vibration,
                tempC: newData.temperature,
                // Add required properties for MechanicalStream
                alignment: 0,
                vibrationX: newData.vibration,
                vibrationY: newData.vibration,
                bearingTemp: newData.temperature,
                radialClearance: 0,
                boltSpecs: { grade: '8.8', count: 12, torque: 500 }
            },
            physics: {
                surgePressureBar: newData.hpuPressure, // Example mapping
                waterHammerPressureBar: 0,
                efficiency: 0.92,
                netHead: newData.netHead,
            }
        };
        ManualInjectionSource.getInstance().inject(payload);
    };

    const [formState, setFormState] = useState({
        flowRate: (hydraulic as any).flowRate || 45.0,
        netHead: (hydraulic as any).netHead || 150.0,
        activePower: (mechanical as any).activePower || 42.0,
        vibration: (mechanical as any).vibration?.x || 0.05,
        temperature: (mechanical as any).bearingTemp?.thrust || 55.0,
        rpm: mechanical.rpm || 428,
        frequency: 120, // Default diagnostic frequency
        // New Advanced Inputs
        tailwaterEl: 85.0,
        runnerEl: 82.0,
        waterTemp: 15.0,
        // Oil Analysis Inputs
        oilTan: 0.1,
        oilWater: 50,
        oilParticles4um: 1000,
        oilParticles6um: 200,
        oilParticles14um: 20,
        // Structural
        penstockDia: 2.5,
        wallThickness: 0.02,
        yieldStrength: 355,
        // Erosion
        pitDepth: 0.2,
        pitCount: 50,
        // Hydraulic
        pipeDiaOld: 12,
        pipeDiaNew: 12,
        // Acoustic
        acousticSim: 'NORMAL', // NORMAL, CAVITATION, LOOSENESS
        // Galvanic
        anodeVoltage: -900, // mV
        anodeLife: 12, // months
        // Thermal
        oilInletTemp: 45,
        oilOutletTemp: 52,
        oilFlowRate: 150,
        // Wicket Gate
        servoCommand: 50,
        gateActual: 50,
        regulatingForce: 12000,
        // Air Gap
        gapSensor1: 12.0,
        gapSensor2: 11.8,
        gapSensor3: 12.1,
        gapSensor4: 11.9,
        excitationCurrent: 800,
        // Transformer
        h2: 10, ch4: 5, c2h6: 2, c2h4: 8, c2h2: 0,
        // Stator
        q_pC: 45, pps: 100,
        // Shaft Seal
        sealFlow: 120, sealPressure: 5, sealTemp: 30, pitLevel: 50,
        // Governor
        hpuPressure: 160, pumpRunTime: 45, filterDeltaP: 0.1, emergencyTime: 8.5,
        // Dam
        reservoirLevel: 350, upliftPressure: 20, seepageFlow: 5,
        // Trash Rack
        trashRackDP: 0.1,
        // Cyber
        gnssOffset: 0.001, // ms
        // Thrust
        axialLoad: 2500000, padTemp: 65, padDev: 2,
        // Specialist Notebook
        damageType: 'NONE' as string,
        damageDescription: '',
        // Dr Turbine & Monsters
        sedimentPPM: 50,
        gridFreq: 50.0,
        // New Guardians
        pumpCurrent: 45,
        pumpVibration: 2.5,
        pumpPressure: 4.5,
        brakePadWear: 40,
        brakeHydraulicPressure: 120,
        gridVoltage: 100, // %
        // New Services Phase 2
        sumpLevel: 45,
        fireZone: 'NONE', // NONE, GEN, CONTROL, XFMR
        airPressure: 7.5,
        seismicPga: 0.02,
        seismicFreq: 4.5,
    });

    const [damageReport, setDamageReport] = useState<DamageReport | null>(null);
    const [visionResult, setVisionResult] = useState<DetectionResult | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [particleResult, setParticleResult] = useState<any>(null);
    const [videoResult, setVideoResult] = useState<any>(null);
    const [drTurbineResult, setDrTurbineResult] = useState<{ cards: ActionCard[]; healthScore: number; voiceMessage: string } | null>(null);
    const [monsterResult, setMonsterResult] = useState<{ 
        cavitation: CavitationStatus; 
        erosion: ErosionStatus;
        overallRisk: string;
        recommendations: string[];
    } | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedImage(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const [analysis, setAnalysis] = useState<{
        zone: { zone: string; message: string; efficiencyDetails?: string };
        cavitation: { risk: string; details: string };
        vibration: { pattern: string; severity: string; recommendations: string[] };
        rootCause?: { rootMetric: string; description: string; confidence: number };
        oilAnalysis?: { healthScore: number; overallHealth: string; findings: any[] };
        aiPrediction?: { synergeticRisk: any };
        energyHarvest?: { powerW: number; annualEur: number; bearingLifeExtensionHours: number };
        lifeExtension?: { yearsAdded: number; currentStress: number; mitigationFactor: number };
        structural?: { mawp: number; margin: number; status: string };
        erosion?: { massLoss: number; rec: string };
        hydraulicSafety?: { approved: boolean; reason: string; stiffness: number };
        acoustic?: { pattern: string; confidence: number; severity: string };
        synergy?: { correlated: boolean; r: number };
        galvanic?: { protection: string; voltage: number; alerts: any[] };
        thermal?: { viscosity: number; valveRec: number; action: string };
        wicket?: { action: string; backlash: number };
        airGap?: { action: string; ecc: number; ump: number };
        transformer?: { fault: string; rec: string };
        stator?: { action: string; severity: string };
        seal?: { action: string; prob: number };
        governor?: { action: string; reason: string };
        dam?: { status: string; sliding: number; seepage: number };
        trash?: { clean: boolean; reason: string };
        cyber?: { spoof: boolean; offset: number; source: string };
        thrust?: { action: string; hMin: number; sigma: number };
        cooling?: { fouling: boolean; pFail: number; lmtd: number };
        brake?: { ready: boolean; steps: number };
        grid?: { excitation: number; kick: boolean };
        logistics?: { spares: number; recs: string[] };
        dewatering?: { level: number; inflow: number; status: string };
        fire?: { active: boolean; zone: string };
        pneumatic?: { pressure: number; brakeReady: boolean };
        oilRegen?: { needsRegen: boolean; reasons: string[] };
        surge?: { surgeHead: number; margin: number };
        seismic?: { stiffness: number; status: string };
    } | null>(null);

    useEffect(() => {
        // Initialize Resonance Manager once
        ResonanceHarvesterManager.initialize();
    }, []);

    // Broadcast updates when form state changes
    useEffect(() => {
        broadcastTelemetry(formState);
    }, [formState]);

    useEffect(() => {
        // Calculate estimated efficiency for Hill Chart
        // P (MW) = rho * g * H * Q * eta / 1e6
        // eta = (P * 1e6) / (rho * g * H * Q)
        const rho = 1000;
        const g = 9.81;
        const pWatts = formState.activePower * 1e6;
        const hydroPower = rho * g * formState.netHead * formState.flowRate;
        const estimatedEta = hydroPower > 0 ? (pWatts / hydroPower) * 100 : 0;

        const zone = calculateOperatingZone(
            formState.activePower, 
            100, // Rated MW 
            formState.netHead,
            formState.flowRate,
            estimatedEta
        ); 
        
        const cavitation = calculateCavitationRisk(
            formState.netHead, 
            formState.flowRate,
            formState.tailwaterEl,
            formState.runnerEl,
            formState.waterTemp
        );

        // 1. Pattern Matching (Historical)
        const vibService = new VibrationForensics();
        const vibResult = vibService.analyzeVibration(
            Date.now(), 
            formState.rpm, 
            formState.vibration, 
            formState.frequency
        );

        // 2. Spectral Analysis (Physics) - Unused Code Integration
        const expert = new VibrationExpert();
        const spectralDiagnosis = expert.checkFrequencyPeaks(
            [{ frequencyHz: formState.frequency, amplitudeMmS: formState.vibration }],
            formState.rpm,
            14 // Assuming 14 blades for Francis runner
        );

        const recommendations = [...vibResult.recommendations];
        if (spectralDiagnosis.danger) {
            recommendations.unshift(`FFT: ${spectralDiagnosis.cause}`);
            recommendations.push(`ACTION: ${spectralDiagnosis.recommendation}`);
        }

        // 3. Root Cause Analysis (Forensic Diagnostic Service)
        // Simulating a GlobalState for the service based on form input
        const simulatedGlobalState: any = {
            timestamp: Date.now(),
            physics: {
                vibration: formState.vibration,
                temperature: formState.temperature,
                pressure: formState.netHead / 10, // Rough bar estimation
                flow: formState.flowRate
            }
        };

        let rootCause = undefined;
        if (formState.vibration > 3.5 || formState.temperature > 65) {
            const diagnosis = ForensicDiagnosticService.diagnose('vibration', simulatedGlobalState);
            if (diagnosis.rootCause.metric !== 'vibration') {
                 rootCause = {
                     rootMetric: diagnosis.rootCause.metric,
                     description: diagnosis.description,
                     confidence: diagnosis.rootCause.contribution
                 };
            }
        }

        // 4. Oil Analysis (Unused Code Integration)
        const oilSample = {
            sampleId: `MANUAL-${Date.now()}`,
            timestamp: Date.now(),
            assetId: 1, // Simulated
            location: 'BEARING_LOWER' as const,
            viscosityIndex: 46, // default
            tan: formState.oilTan,
            dielectricConstant: 2.1,
            waterContent: formState.oilWater,
            particleCount: {
                size_4um: formState.oilParticles4um,
                size_6um: formState.oilParticles6um,
                size_14um: formState.oilParticles14um
            },
            metalContent: { iron: 0, copper: 0, lead: 0, tin: 0, aluminum: 0, chromium: 0 }
        };
        const oilResult = OilAnalysisService.analyzeOilSample(oilSample);

        // 5. AI Prediction (Synergetic Risk) - Unused Code Integration
        const aiService = new AIPredictionService();
        // Simulated TelemetryData for AI Service
        const simulatedTelemetry: any = {
            timestamp: Date.now(),
            common: {
                output_power: formState.activePower,
                efficiency: estimatedEta,
                vibration: formState.vibration,
                temperature: formState.temperature
            },
            specialized: {
                acoustic: {
                    classification: { label: vibResult.pattern, confidence: 0.9 },
                    harmonics: [{ frequency: formState.frequency, amplitude: formState.vibration }]
                }
            }
        };
        const risk = aiService.detectSynergeticRisk(1, simulatedTelemetry);
        
        // 6. Energy Harvesting (Unused Code Integration)
        const harvest = ResonanceHarvesterManager.harvestVibrationEnergy(formState.vibration, formState.activePower);

        // 7. Life Extension (Unused Code Integration)
        // Assume baseline life is 20 years, limit 235MPa, current stress ~ 150 + vibration*10
        const currentStress = 150 + (formState.vibration * 10);
        const mitigationFactor = formState.vibration < 1.0 ? 0.2 : 0; // "Good operation" is a mitigation
        const yearsAdded = LifeExtensionEngine.calculateLifeExtension(20, 235, currentStress, mitigationFactor);

        // 8. Structural Integrity
        // Calculate rough pressure from head (1m head ~ 0.1 bar) + 20% surge
        const pressureBar = (formState.netHead * 0.1) * 1.2;
        const mawp = StructuralIntegrityService.calculateMAWP(formState.yieldStrength, formState.wallThickness, formState.penstockDia);
        const structMargin = StructuralIntegrityService.calculateMargin(pressureBar, mawp);
        const structStatus = structMargin < 20 ? 'CRITICAL' : structMargin < 40 ? 'WARNING' : 'NORMAL';

        // 9. Erosion Simulation
        // Create simulated point cloud based on inputs
        const simulatedPoints = Array(formState.pitCount).fill(0).map(() => ({ x: 0, y: 0, z: -formState.pitDepth }));
        const erosionResult = CavitationErosionService.mapBladePitting(1, simulatedPoints, 5000);
        const erosionRec = erosionResult.massLoss > 10 ? 'WELD REPAIR' : 'MONITOR';

        // 10. Hydraulic Safety (What-If)
        const hydSim = HydraulicTransientSafety.simulateHardwareChange(
            { pipeDiameterMM: formState.pipeDiaOld, pipeLengthM: 10, oilViscosityCst: 46, systemPressureBar: 160, actuatorVolumeL: 50, accumulators: false },
            { pipeDiameterMM: formState.pipeDiaNew, pipeLengthM: 10, oilViscosityCst: 46, systemPressureBar: 160, actuatorVolumeL: 50, accumulators: false }
        );

        // 11. Acoustic Fingerprinting
        // Generate simulated spectrum based on selection
        const spectrum = new Array(1024).fill(0);
        if (formState.acousticSim === 'CAVITATION') {
            // Add noise in 2-10kHz
            for (let i = 200; i < 500; i++) spectrum[i] = Math.random() * 0.5;
        } else if (formState.acousticSim === 'LOOSENESS') {
            // Add low freq peaks
            spectrum[10] = 0.8; // 1x
            spectrum[20] = 0.6; // 2x
        }
        const acousticResult = AcousticFingerprintingService.classifyAcousticSignature({
            timestamp: Date.now(), assetId: 1, spectrum, rmsLevel: 0.5, peakFrequencies: [], noiseFloor: 0.01
        }, formState.rpm);

        // 12. Cross-Correlation Synergy
        // Create 2 signals. Correlate if vibration is high
        const sigA = Array.from({length: 100}, (_, i) => Math.sin(i/10) + Math.random()*0.1);
        const sigB = Array.from({length: 100}, (_, i) => 
            formState.vibration > 0.1 ? Math.sin(i/10) + Math.random()*0.1 : Math.cos(i/10) + Math.random()*0.1
        );
        const synergyResult = CrossCorrelationService.detectSynergy(sigA, sigB, 0.7);

        // 13. Galvanic Corrosion
        const galvanicAlerts = GalvanicCorrosionService.analyzeCathodicProtection({
            assetId: 1, turbineType: 'BULB', overallProtection: 'GOOD', averageVoltage: formState.anodeVoltage, generatorGroundingResistance: 0.5, strayCurrentDetected: false,
            anodes: [{ anodeId: 'ZN-1', location: 'Runner', timestamp: Date.now(), mass: 10, voltage: formState.anodeVoltage, current: 100, consumptionRate: 2, estimatedLifeRemaining: formState.anodeLife }]
        });

        // 14. Thermal Management
        const thermalResult = ThermalManagementCore.computeBearingCooling({
            oilInC: formState.oilInletTemp,
            oilOutC: formState.oilOutletTemp,
            waterInC: formState.waterTemp,
            valvePositionPct: 50,
            currentWaterFlow_m3h: formState.oilFlowRate * 0.06
        });

        // 15. Wicket Gate Kinematics
        const wicketKinematics = new WicketGateKinematics();
        const wicketAction = wicketKinematics.addMeasurement({
            timestamp: new Date().toISOString(),
            servoCommandPct: formState.servoCommand,
            gateActualPct: formState.gateActual,
            regulatingRingForceN: formState.regulatingForce
        });
        const wicketBacklash = 'backlashPct' in wicketAction ? wicketAction.backlashPct : 0;

        // 16. Generator Air Gap
        const airGapSentinel = new GeneratorAirGapSentinel();
        const airGapAction = airGapSentinel.addMeasurement({
            timestamp: new Date().toISOString(),
            airGapSensorsMm: [formState.gapSensor1, formState.gapSensor2, formState.gapSensor3, formState.gapSensor4],
            rotorSpeedRpm: formState.rpm,
            excitationCurrentA: formState.excitationCurrent,
            statorTempC: formState.temperature
        });
        const eccPct = 'eccentricityPct' in airGapAction ? airGapAction.eccentricityPct : 0;
        const umpN = 'umpN' in airGapAction ? airGapAction.umpN : 0;

        // 17. Transformer Oil Analysis
        const transformerResult = TransformerOilAnalyst.analyze(
            formState.h2, formState.ch4, formState.c2h6, formState.c2h4, formState.c2h2, 0
        );

        // 18. Stator Insulation
        const statorGuardian = new StatorInsulationGuardian();
        const statorAction = statorGuardian.addMeasurement({
            timestamp: new Date().toISOString(),
            q_pC: formState.q_pC,
            pps: formState.pps,
            voltage_kV: 13.8, // assumed
            windingTempC: formState.temperature
        });

        // 19. Shaft Seal
        const sealGuardian = new ShaftSealGuardian();
        const sealAction = sealGuardian.addMeasurement({
            timestamp: new Date().toISOString(),
            Q_seal: formState.sealFlow,
            P_seal: formState.sealPressure,
            T_seal: formState.sealTemp,
            leakagePitLevel: formState.pitLevel
        });

        // 20. Governor HPU
        const govGuardian = new GovernorHPUGuardian();
        const govAction = govGuardian.addMeasurement({
            timestamp: new Date().toISOString(),
            mainHeaderPressureBar: formState.hpuPressure,
            pumpRunTimeSec: formState.pumpRunTime,
            filterDeltaPBar: formState.filterDeltaP,
            emergencyCloseDurationSec: formState.emergencyTime,
            oilTempC: formState.oilOutletTemp // reuse thermal out
        });

        // 21. Dam Stability
        const damResult = DamStabilityAnalyser.analyze(
            formState.reservoirLevel,
            formState.tailwaterEl, 
            formState.seepageFlow,
            formState.upliftPressure
        );

        // 22. Trash Rack (Async handling)
        let trashResult = { shouldClean: false, reason: 'Calculated...' };
        // We'll skip async in this render cycle or handle it separately if needed, 
        // but for now let's assume a sync check or simple logic
        if (formState.trashRackDP > 0.15) {
            trashResult = { shouldClean: true, reason: 'High DP (Simulated)' };
        }

        // 23. Cyber Defense
        const cyberResult = TimeSpoofingDetector.validateCheck(
            Date.now() + (formState.gnssOffset || 0), // Simulate offset
            Date.now()
        );

        // 24. Thrust Bearing
        const thrustThickness = ThrustBearingMaster.calculateFilmThickness(
            formState.axialLoad,
            0.04, // viscosity
            formState.rpm,
            1.5, // pad area
            0.8 // radius
        );
        const thrustAction = thrustThickness < 20 ? 'TRIP' : thrustThickness < 30 ? 'ALARM' : 'NORMAL';

        // 25. Specialist Notebook (Damage Diagnosis)
        if (formState.damageType !== 'NONE') {
            const report = SpecialistNotebook.diagnoseDamage(
                formState.damageType as any,
                formState.damageDescription || 'Manual observation from field walkdown',
                {}
            );
            setDamageReport(report);
        } else {
            setDamageReport(null);
        }

        // 26. Dr Turbine AI & Invisible Monsters
        // Run Dr Turbine
        const drResult = DrTurbineAI.consult(
            { id: 1, name: 'Unit 1', type: 'FRANCIS' } as any,
            formState.flowRate,
            formState.netHead,
            formState.gridFreq
        );
        setDrTurbineResult(drResult);

        // Run Invisible Monsters (ErrorHandlerService)
        const monsterDetector = new ErrorHandlerService(new FrancisHorizontalEngine());
        const monsterReport = monsterDetector.getFullMonsterReport(
            { 
                hydraulic: { flow: formState.flowRate, head: formState.netHead }, 
                mechanical: { rpm: formState.rpm } 
            } as any,
            { sedimentPPM: formState.sedimentPPM, particleSize: 50 }
        );
        setMonsterResult(monsterReport);

        // 27. Cooling System
        const coolingGuardian = new CoolingSystemGuardian();
        const coolingAnalysis = coolingGuardian.analyze([{
            timestamp: Date.now(),
            waterFlowM3h: formState.oilFlowRate, // reuse
            oilInletC: formState.oilInletTemp,
            oilOutletC: formState.oilOutletTemp,
            waterInletC: formState.waterTemp,
            waterOutletC: formState.waterTemp + 5, // estimate
            pumpCurrentA: formState.pumpCurrent,
            pumpVibration: formState.pumpVibration,
            pumpPressureBar: formState.pumpPressure
        }]);

        // 28. Mechanical Brake
        const brakeGuardian = new MechanicalBrakeGuardian();
        const brakeReadiness = brakeGuardian.evaluateReadiness(formState.brakePadWear, formState.brakeHydraulicPressure);
        const brakeSeq = brakeGuardian.generateSafeStopSequence(100, 0);

        // 29. Grid Stability
        const gridGuardian = new GridStabilityGuardian();
        const vCurve = gridGuardian.computeVCurve(formState.gridVoltage);
        const inertia = gridGuardian.assessInertia({ timestamp: Date.now(), frequencyHz: formState.frequency });

        // 30. Logistics
        const logisticsSentinel = new LogisticsSentinel();
        const wearMap = {
            'thrust-bearing': formState.oilParticles4um > 1000 ? 85 : 20, // heuristic
            'runner-bucket': formState.pitCount > 100 ? 90 : 10,
            'transformer-winding': formState.temperature > 90 ? 80 : 10
        };
        const sparesRec = logisticsSentinel.mapWearToSpares(wearMap);

        // 31. Dewatering
        const sumpStatus = DewateringSovereign.monitorSump('SUMP-1', formState.sumpLevel, formState.sumpLevel > 60, false);

        // 32. Fire System
        if (formState.fireZone !== 'NONE') {
            FireSuppressionSystem.initializeFireZones();
            // Simulate fire if selected
            FireSuppressionSystem.detectFire('ZONE-GEN-1', 'DET-1', 'ALARM');
        }
        const fireEvents = FireSuppressionSystem.getActiveFireEvents();

        // 33. Pneumatic
        const airStatus = PneumaticSystemManager.monitorSystem(formState.airPressure, formState.airPressure < 7);

        // 34. Oil Regeneration
        const oilRegen = OilRegenerationLogic.monitorOilQuality('UNIT-1', {
            timestamp: Date.now(),
            viscosity: thermalResult.oilViscosity_cP || 46,
            acidNumber: formState.oilTan,
            waterContent: formState.oilWater,
            particleCount: formState.oilParticles4um > 1000 ? 19 : 14, // Rough map
            oxidation: 0.05,
            antioxidantDepletion: 10
        });

        // 35. Surge Protection
        const surge = SurgeProtector.estimateSurge(15, formState.flowRate, 1200); // 15%/s closing, 1200m/s wave

        // 36. Seismic
        const seismic = SeismicResponseMonitor.analyze(formState.seismicPga, formState.seismicFreq);

        setAnalysis({ 
            zone,  
            cavitation,
            vibration: {
                pattern: vibResult.pattern,
                severity: spectralDiagnosis.danger ? 'CRITICAL' : vibResult.severity,
                recommendations
            },
            rootCause,
            oilAnalysis: {
                healthScore: oilResult.healthScore,
                overallHealth: oilResult.overallHealth,
                findings: oilResult.findings
            },
            aiPrediction: {
                synergeticRisk: risk
            },
            energyHarvest: {
                powerW: harvest.totalPowerRecovered,
                annualEur: harvest.monetaryValue,
                bearingLifeExtensionHours: 0
            },
            lifeExtension: {
                yearsAdded,
                currentStress: 0,
                mitigationFactor: 0
            },
            structural: {
                mawp,
                margin: structMargin,
                status: structStatus
            },
            erosion: {
                massLoss: erosionResult.massLoss,
                rec: erosionRec
            },
            hydraulicSafety: {
                approved: hydSim.approved,
                reason: hydSim.reason,
                stiffness: hydSim.metrics.systemStiffnessRatio
            },
            acoustic: {
                pattern: acousticResult.primaryPattern,
                confidence: acousticResult.confidence,
                severity: acousticResult.severity
            },
            synergy: {
                correlated: synergyResult.correlated,
                r: synergyResult.r
            },
            galvanic: {
                protection: formState.anodeVoltage > -800 ? 'RISK' : 'GOOD',
                voltage: formState.anodeVoltage,
                alerts: galvanicAlerts
            },
            thermal: {
                viscosity: thermalResult.oilViscosity_cP,
                valveRec: thermalResult.recommendedValvePositionPct,
                action: thermalResult.controlAction
            },
            wicket: {
                action: wicketAction.action,
                backlash: wicketBacklash || 0
            },
            airGap: {
                action: airGapAction.action,
                ecc: eccPct || 0,
                ump: umpN || 0
            },
            transformer: {
                fault: transformerResult.faultType,
                rec: transformerResult.recommendation
            },
            stator: {
                action: statorAction.action,
                severity: 'severity' in statorAction ? statorAction.severity : 'NORMAL'
            },
            seal: {
                action: sealAction.action,
                prob: 'probability' in sealAction ? sealAction.probability : 0
            },
            governor: {
                action: govAction.action,
                reason: govAction.reason || 'Nominal'
            },
            dam: {
                status: damResult.status,
                sliding: damResult.slidingSafetyFactor,
                seepage: formState.seepageFlow
            },
            trash: {
                clean: trashResult.shouldClean,
                reason: trashResult.reason
            },
            cyber: {
                spoof: cyberResult.spoofingDetected,
                offset: cyberResult.offsetMs,
                source: cyberResult.activeSource
            },
            thrust: {
                action: thrustAction,
                hMin: thrustThickness,
                sigma: 0 // placeholder
            },
            cooling: {
                fouling: coolingAnalysis.foulingDetected,
                pFail: coolingAnalysis.p_fail,
                lmtd: coolingAnalysis.LMTD || 0
            },
            brake: {
                ready: brakeReadiness.ready,
                steps: brakeSeq.length
            },
            grid: {
                excitation: vCurve.excitationPct,
                kick: inertia.triggered
            },
            logistics: {
                spares: sparesRec.length,
                recs: sparesRec.map(r => r.recommendedSpare)
            },
            dewatering: {
                level: sumpStatus.levelPct,
                inflow: sumpStatus.inflowRateLps,
                status: sumpStatus.alarmStatus
            },
            fire: {
                active: fireEvents.length > 0,
                zone: fireEvents.length > 0 ? fireEvents[0].zoneId : 'SAFE'
            },
            pneumatic: {
                pressure: airStatus.systemPressureBar,
                brakeReady: airStatus.brakeReady
            },
            oilRegen: {
                needsRegen: oilRegen.needsRegeneration,
                reasons: oilRegen.reasons
            },
            surge: {
                surgeHead: surge.surgeHeadM,
                margin: surge.safetyMargin
            },
            seismic: {
                stiffness: seismic.stiffnessChangePct,
                status: seismic.status
            }
        });
    }, [formState.activePower, formState.netHead, formState.flowRate, formState.tailwaterEl, formState.runnerEl, formState.waterTemp, formState.vibration, formState.rpm, formState.frequency, formState.temperature, formState.oilTan, formState.oilWater, formState.oilParticles4um, formState.oilParticles6um, formState.oilParticles14um, formState.penstockDia, formState.wallThickness, formState.yieldStrength, formState.pitDepth, formState.pitCount, formState.pipeDiaOld, formState.pipeDiaNew, formState.acousticSim, formState.anodeVoltage, formState.anodeLife, formState.damageType, formState.damageDescription]);

    const handleChange = (key: string, value: string) => {
        setFormState(prev => ({
            ...prev,
            [key]: parseFloat(value) || value // Handle non-numeric inputs
        }));
    };

    const handleApply = () => {
        // Visual feedback
        const btn = document.getElementById('apply-btn');
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = 'INJECTED';
            setTimeout(() => btn.innerText = originalText, 1000);
        }
    };

    const handleArchive = async () => {
        // Run Computer Vision Check
        let visionFrame;
        let particleResult = undefined;
        let videoResult = undefined;

        if (uploadedImage) {
             const imageData = await new Promise<Uint8Array>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const buffer = e.target?.result as ArrayBuffer;
                    resolve(new Uint8Array(buffer));
                };
                reader.readAsArrayBuffer(uploadedImage);
            });
            visionFrame = { frameId: Date.now(), timestamp: Date.now(), source: 'MANUAL_UPLOAD', imageData: imageData, width: 1920, height: 1080 };
            
            // Also run Video Forensics
            const vResult = await VideoForensicsService.analyzeFrame(visionFrame);
            videoResult = vResult;
            setVideoResult(vResult);
            
            // Run Particle Analysis if oil data suggests issues
            if (formState.oilTan > 0.5 || formState.oilParticles4um > 1000) {
                 const pResult = ParticleAnalysisService.classifyParticle(
                    { imageData: 'simulated-base64', magnification: 400, timestamp: Date.now() },
                    { tin: 5, lead: 2, copper: 3, iron: formState.oilParticles4um > 2000 ? 60 : 10 }
                 );
                 particleResult = pResult;
                 setParticleResult(pResult);
            }

        } else {
            // Simulated empty frame
            visionFrame = { frameId: Date.now(), timestamp: Date.now(), source: 'MANUAL_UPLOAD', imageData: new Uint8Array(), width: 1920, height: 1080 };
        }
        
        const vision = ComputerVisionService.processFrame(visionFrame);
        setVisionResult(vision);

        // Feed PatternEater (Unused Code Integration)
        // Calculate efficiency for learning
        const rho = 1000;
        const g = 9.81;
        const pWatts = formState.activePower * 1e6;
        const hydroPower = rho * g * formState.netHead * formState.flowRate;
        const estimatedEta = hydroPower > 0 ? (pWatts / hydroPower) * 100 : 0;
        const gatePercent = Math.min(100, (formState.flowRate / 60) * 100); // Approx 60m3/s max
        
        feedPattern(gatePercent, estimatedEta);

        // Generate Forensic Signature (Unused Code Integration)
        const signature = await generateSignature(
            { 
                parameterId: 'MANUAL_ENTRY', 
                value: formState.vibration, 
                measuredAt: new Date().toISOString() 
            },
            'Manual Operator',
            'OP-LEVEL-1'
        );

        // Create a Forensic Snapshot
        addSnapshot({
            id: `MANUAL-${Date.now()}`,
            timestamp: Date.now(),
            triggerType: 'MANUAL',
            pathology: 'MANUAL_SCENARIO',
            telemetry: {
                rpm: formState.rpm,
                vibrationX: formState.vibration,
                vibrationY: formState.vibration * 0.9,
                bearingTemp: formState.temperature
            },
            kineticState: {
                eccentricity: formState.vibration * 0.1, // Simulated correlation
                phase: 45,
                rsquared: 0.98,
                offset: 0.02
            },
            oracleWisdom: {
                title: analysis?.zone.zone === 'OPTIMAL' ? 'User Knowledge Capture' : 'CRITICAL OBSERVATION',
                message: `Scenario: ${formState.activePower}MW (${analysis?.zone.zone}). ${analysis?.cavitation.details}. Vibration: ${analysis?.vibration.pattern} (${analysis?.vibration.severity}).`,
                action: 'ARCHIVED'
            },
            physicsAnalysis: analysis || undefined,
            signature, // NC-4.2
            rootCauseAnalysis: analysis?.rootCause, // NC-4.2
            damageReport: damageReport, // NC-Unused-Code: Specialist Notebook
            energyHarvest: analysis?.energyHarvest, // NC-Unused-Code
            lifeExtension: analysis?.lifeExtension, // NC-Unused-Code
            structuralIntegrity: analysis?.structural ? {
                mawpBar: analysis.structural.mawp,
                marginPct: analysis.structural.margin,
                status: analysis.structural.status as any
            } : undefined,
            erosionAnalysis: analysis?.erosion ? {
                massLossGrams: analysis.erosion.massLoss,
                recommendation: analysis.erosion.rec
            } : undefined,
            hydraulicSafety: analysis?.hydraulicSafety ? {
                approved: analysis.hydraulicSafety.approved,
                reason: analysis.hydraulicSafety.reason,
                stiffnessRatio: analysis.hydraulicSafety.stiffness
            } : undefined,
            acousticFingerprint: analysis?.acoustic ? {
                primaryPattern: analysis.acoustic.pattern,
                confidence: analysis.acoustic.confidence,
                severity: analysis.acoustic.severity
            } : undefined,
            crossCorrelation: analysis?.synergy ? {
                correlated: analysis.synergy.correlated,
                r: analysis.synergy.r,
                pair: 'Vibration-Load'
            } : undefined,
            galvanicCorrosion: analysis?.galvanic ? {
                protectionLevel: analysis.galvanic.protection,
                avgVoltage: analysis.galvanic.voltage,
                alerts: analysis.galvanic.alerts.map(a => a.message)
            } : undefined,
            computerVision: vision ? {
                detections: vision.detections.length,
                critical: vision.detections.filter(d => d.severity === 'CRITICAL').length
            } : undefined,
            particleAnalysis: particleResult ? {
                particleType: particleResult.particleType,
                confidence: particleResult.confidence,
                severity: particleResult.severity,
                source: particleResult.source
            } : undefined,
            videoForensics: videoResult ? {
                anomalies: videoResult.detectedAnomalies.map(a => ({ type: a.type, severity: a.severity })),
                audioPattern: videoResult.audioAnalysis.detectedPattern
            } : undefined,

            // Phase 4: Electro-Mechanical
            thermalAnalysis: analysis?.thermal ? {
                viscosity: analysis.thermal.viscosity,
                valveRec: analysis.thermal.valveRec,
                action: analysis.thermal.action
            } : undefined,
            wicketGateAnalysis: analysis?.wicket ? {
                action: analysis.wicket.action,
                backlashPct: analysis.wicket.backlash
            } : undefined,
            generatorAirGap: analysis?.airGap ? {
                action: analysis.airGap.action,
                eccentricityPct: analysis.airGap.ecc,
                umpN: analysis.airGap.ump
            } : undefined,

            // Phase 5: Electrical & Auxiliary
            transformerAnalysis: analysis?.transformer ? {
                faultType: analysis.transformer.fault,
                recommendation: analysis.transformer.rec,
                acetyleneTrend: 'Stable' // Placeholder
            } : undefined,
            statorAnalysis: analysis?.stator ? {
                action: analysis.stator.action,
                severity: analysis.stator.severity,
                qMaxIncrease: 0 // Placeholder
            } : undefined,
            shaftSealAnalysis: analysis?.seal ? {
                action: analysis.seal.action,
                probability: analysis.seal.prob,
                leakageRate: 0 // Placeholder
            } : undefined,
            governorAnalysis: analysis?.governor ? {
                action: analysis.governor.action,
                details: analysis.governor.reason
            } : undefined,

            // NC-Unused-Code Integration Phase 6
            damStability: analysis?.dam ? {
                status: analysis.dam.status,
                slidingFactor: analysis.dam.sliding,
                seepage: analysis.dam.seepage
            } : undefined,
            trashRack: analysis?.trash ? {
                shouldClean: analysis.trash.clean,
                reason: analysis.trash.reason
            } : undefined,
            cyberDefense: analysis?.cyber ? {
                spoofing: analysis.cyber.spoof,
                offsetMs: analysis.cyber.offset,
                source: analysis.cyber.source
            } : undefined,
            thrustBearing: analysis?.thrust ? {
                action: analysis.thrust.action,
                hMin: analysis.thrust.hMin,
                sigma: analysis.thrust.sigma
            } : undefined,
            // New Guardians Snapshot Integration
            coolingSystem: analysis?.cooling ? {
                fouling: analysis.cooling.fouling,
                pFail: analysis.cooling.pFail
            } : undefined,
            mechanicalBrake: analysis?.brake ? {
                ready: analysis.brake.ready,
                steps: analysis.brake.steps
            } : undefined,
            gridStability: analysis?.grid ? {
                excitation: analysis.grid.excitation,
                kineticKick: analysis.grid.kick
            } : undefined,
            logistics: analysis?.logistics ? {
                sparesNeeded: analysis.logistics.spares,
                recommendations: analysis.logistics.recs
            } : undefined,
            dewatering: analysis?.dewatering ? {
                levelPct: analysis.dewatering.level,
                status: analysis.dewatering.status
            } : undefined,
            fireSafety: analysis?.fire ? {
                active: analysis.fire.active,
                zone: analysis.fire.zone
            } : undefined,
            pneumatics: analysis?.pneumatic ? {
                pressureBar: analysis.pneumatic.pressure,
                brakeReady: analysis.pneumatic.brakeReady
            } : undefined,
            oilRegeneration: analysis?.oilRegen ? {
                required: analysis.oilRegen.needsRegen,
                reasons: analysis.oilRegen.reasons
            } : undefined,
            seismicHealth: analysis?.seismic ? {
                stiffnessChange: analysis.seismic.stiffness,
                status: analysis.seismic.status
            } : undefined
        });

        // Visual feedback
        const btn = document.getElementById('archive-btn');
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = 'SAVED';
            setTimeout(() => btn.innerText = originalText, 1000);
        }
    };



    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Data Injection</span>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setActiveTab('manual')}
                        className={`p-1 rounded ${activeTab === 'manual' ? 'bg-cyan-900 text-cyan-400' : 'text-slate-500 hover:text-white'}`}
                        title="Manual Entry"
                    >
                        <Sliders className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('scenario')}
                        className={`p-1 rounded ${activeTab === 'scenario' ? 'bg-purple-900 text-purple-400' : 'text-slate-500 hover:text-white'}`}
                        title="Scenario Builder"
                    >
                        <PlayCircle className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('kernel')}
                        className={`p-1 rounded ${activeTab === 'kernel' ? 'bg-emerald-900 text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                        title="Kernel Monitor"
                    >
                        <Cpu className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('processes')}
                        className={`p-1 rounded ${activeTab === 'processes' ? 'bg-blue-900 text-blue-400' : 'text-slate-500 hover:text-white'}`}
                        title="Task Manager"
                    >
                        <Server className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('console')}
                        className={`p-1 rounded ${activeTab === 'console' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        title="System Console"
                    >
                        <Terminal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {activeTab === 'scenario' ? (
                <ScenarioBuilder />
            ) : activeTab === 'kernel' ? (
                <KernelMonitor />
            ) : activeTab === 'processes' ? (
                <TaskManager />
            ) : activeTab === 'console' ? (
                <TerminalConsole />
            ) : (
                <div className="space-y-4">
                    {/* ... (existing manual form) ... */}
                {/* Hydraulic Section */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase">Hydraulic Parameters</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Flow Rate (m³/s)</span>
                            <input 
                                type="number" 
                                value={formState.flowRate}
                                onChange={(e) => handleChange('flowRate', e.target.value)}
                                className="w-full bg-transparent text-cyan-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Net Head (m)</span>
                            <input 
                                type="number" 
                                value={formState.netHead}
                                onChange={(e) => handleChange('netHead', e.target.value)}
                                className="w-full bg-transparent text-cyan-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Advanced Hydraulics */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Tailwater (m)</span>
                            <input 
                                type="number" 
                                value={formState.tailwaterEl}
                                onChange={(e) => handleChange('tailwaterEl', e.target.value)}
                                className="w-full bg-transparent text-blue-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Runner El (m)</span>
                            <input 
                                type="number" 
                                value={formState.runnerEl}
                                onChange={(e) => handleChange('runnerEl', e.target.value)}
                                className="w-full bg-transparent text-slate-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Temp (°C)</span>
                            <input 
                                type="number" 
                                value={formState.waterTemp}
                                onChange={(e) => handleChange('waterTemp', e.target.value)}
                                className="w-full bg-transparent text-cyan-200 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Mechanical Section */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase">Mechanical Parameters</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Active Power (MW)</span>
                            <input 
                                type="number" 
                                value={formState.activePower}
                                onChange={(e) => handleChange('activePower', e.target.value)}
                                className="w-full bg-transparent text-emerald-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Vibration (mm/s)</span>
                            <input 
                                type="number" 
                                value={formState.vibration}
                                step="0.01"
                                onChange={(e) => handleChange('vibration', e.target.value)}
                                className="w-full bg-transparent text-amber-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                         <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">RPM</span>
                            <input 
                                type="number" 
                                value={formState.rpm}
                                onChange={(e) => handleChange('rpm', e.target.value)}
                                className="w-full bg-transparent text-slate-300 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Freq (Hz)</span>
                            <input 
                                type="number" 
                                value={formState.frequency}
                                onChange={(e) => handleChange('frequency', e.target.value)}
                                className="w-full bg-transparent text-purple-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Temp (°C)</span>
                            <input 
                                type="number" 
                                value={formState.temperature}
                                onChange={(e) => handleChange('temperature', e.target.value)}
                                className="w-full bg-transparent text-red-400 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Oil Analysis Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-400 font-mono uppercase">Oil Health</label>
                        {particleResult && (
                            <span className="text-[9px] font-bold text-pink-400 bg-pink-950/30 px-2 rounded">
                                {particleResult.particleType}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">TAN</span>
                            <input 
                                type="number" 
                                value={formState.oilTan}
                                step="0.1"
                                onChange={(e) => handleChange('oilTan', e.target.value)}
                                className="w-full bg-transparent text-amber-200 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">H2O (ppm)</span>
                            <input 
                                type="number" 
                                value={formState.oilWater}
                                onChange={(e) => handleChange('oilWater', e.target.value)}
                                className="w-full bg-transparent text-blue-200 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">ISO 4μm</span>
                            <input 
                                type="number" 
                                value={formState.oilParticles4um}
                                onChange={(e) => handleChange('oilParticles4um', e.target.value)}
                                className="w-full bg-transparent text-slate-300 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Structural Section */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase">Structural Integrity</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Dia (m)</span>
                            <input 
                                type="number" 
                                value={formState.penstockDia}
                                step="0.1"
                                onChange={(e) => handleChange('penstockDia', e.target.value)}
                                className="w-full bg-transparent text-slate-300 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Wall (m)</span>
                            <input 
                                type="number" 
                                value={formState.wallThickness}
                                step="0.001"
                                onChange={(e) => handleChange('wallThickness', e.target.value)}
                                className="w-full bg-transparent text-slate-300 font-mono font-bold focus:outline-none"
                            />
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Yield (MPa)</span>
                            <input 
                                type="number" 
                                value={formState.yieldStrength}
                                onChange={(e) => handleChange('yieldStrength', e.target.value)}
                                className="w-full bg-transparent text-slate-300 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Erosion & Hydraulic Section */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-mono uppercase">Erosion (Sim)</label>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Max Pit Depth</span>
                            <input 
                                type="number" 
                                value={formState.pitDepth}
                                step="0.1"
                                onChange={(e) => handleChange('pitDepth', e.target.value)}
                                className="w-full bg-transparent text-orange-200 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs text-slate-400 font-mono uppercase">Hydraulic Mod</label>
                         <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">New Dia (mm)</span>
                            <input 
                                type="number" 
                                value={formState.pipeDiaNew}
                                onChange={(e) => handleChange('pipeDiaNew', e.target.value)}
                                className="w-full bg-transparent text-cyan-200 font-mono font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Acoustic & Galvanic Section */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-mono uppercase">Acoustic</label>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block mb-1">Simulated Pattern</span>
                            <select 
                                value={formState.acousticSim}
                                onChange={(e) => handleChange('acousticSim', e.target.value)}
                                className="w-full bg-transparent text-purple-200 font-mono font-bold focus:outline-none text-xs"
                            >
                                <option value="NORMAL">Normal Cavitation</option>
                                <option value="LOOSENESS">Mechanical Looseness</option>
                                <option value="CAVITATION">Severe Cavitation</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs text-slate-400 font-mono uppercase">Cathodic Prot.</label>
                         <div className="grid grid-cols-2 gap-1">
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Voltage (mV)</span>
                                <input 
                                    type="number" 
                                    value={formState.anodeVoltage}
                                    onChange={(e) => handleChange('anodeVoltage', e.target.value)}
                                    className="w-full bg-transparent text-emerald-200 font-mono font-bold focus:outline-none"
                                />
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Life (mo)</span>
                                <input 
                                    type="number" 
                                    value={formState.anodeLife}
                                    onChange={(e) => handleChange('anodeLife', e.target.value)}
                                    className="w-full bg-transparent text-slate-300 font-mono font-bold focus:outline-none"
                                />
                            </div>
                         </div>
                    </div>
                </div>

                {/* Thermal & Wicket Section */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-mono uppercase">Bearing Thermal</label>
                        <div className="grid grid-cols-2 gap-1">
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">In (°C)</span>
                                <input 
                                    type="number" 
                                    value={formState.oilInletTemp}
                                    onChange={(e) => handleChange('oilInletTemp', e.target.value)}
                                    className="w-full bg-transparent text-blue-200 font-mono font-bold focus:outline-none"
                                />
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Out (°C)</span>
                                <input 
                                    type="number" 
                                    value={formState.oilOutletTemp}
                                    onChange={(e) => handleChange('oilOutletTemp', e.target.value)}
                                    className="w-full bg-transparent text-red-200 font-mono font-bold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-mono uppercase">Wicket Gate</label>
                        <div className="grid grid-cols-2 gap-1">
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Cmd (%)</span>
                                <input 
                                    type="number" 
                                    value={formState.servoCommand}
                                    onChange={(e) => handleChange('servoCommand', e.target.value)}
                                    className="w-full bg-transparent text-slate-200 font-mono font-bold focus:outline-none"
                                />
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Act (%)</span>
                                <input 
                                    type="number" 
                                    value={formState.gateActual}
                                    onChange={(e) => handleChange('gateActual', e.target.value)}
                                    className="w-full bg-transparent text-slate-200 font-mono font-bold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Air Gap Section */}
                <div className="space-y-2 mt-2">
                    <label className="text-xs text-slate-400 font-mono uppercase">Generator Air Gap (mm)</label>
                    <div className="grid grid-cols-4 gap-1">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="bg-slate-950 p-1 rounded border border-slate-800">
                                <span className="text-[8px] text-slate-500 block text-center">Q{i}</span>
                                <input 
                                    type="number" 
                                    value={formState[`gapSensor${i}` as keyof typeof formState]}
                                    step="0.1"
                                    onChange={(e) => handleChange(`gapSensor${i}`, e.target.value)}
                                    className="w-full bg-transparent text-center text-emerald-400 font-mono font-bold focus:outline-none text-xs"
                                />
                            </div>
                         ))}
                    </div>
                </div>

                {/* Electrical & Auxiliary Section */}
                <div className="space-y-2 mt-2">
                    <label className="text-xs text-slate-400 font-mono uppercase">Electrical & Auxiliary</label>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Transformer DGA */}
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                             <span className="text-[10px] text-slate-500 block mb-1">DGA (ppm)</span>
                             <div className="grid grid-cols-3 gap-1">
                                <input type="number" placeholder="H2" value={formState.h2} onChange={e => handleChange('h2', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                                <input type="number" placeholder="CH4" value={formState.ch4} onChange={e => handleChange('ch4', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                                <input type="number" placeholder="C2H2" value={formState.c2h2} onChange={e => handleChange('c2h2', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                             </div>
                        </div>
                        {/* Stator PD */}
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                             <span className="text-[10px] text-slate-500 block mb-1">Stator PD</span>
                             <div className="grid grid-cols-2 gap-1">
                                <input type="number" placeholder="pC" value={formState.q_pC} onChange={e => handleChange('q_pC', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                                <input type="number" placeholder="PPS" value={formState.pps} onChange={e => handleChange('pps', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {/* Shaft Seal */}
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                             <span className="text-[10px] text-slate-500 block mb-1">Shaft Seal</span>
                             <div className="grid grid-cols-2 gap-1">
                                <input type="number" placeholder="Flow" value={formState.sealFlow} onChange={e => handleChange('sealFlow', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                                <input type="number" placeholder="Pit Lvl" value={formState.pitLevel} onChange={e => handleChange('pitLevel', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                             </div>
                        </div>
                        {/* Governor */}
                        <div className="bg-slate-950 p-2 rounded border border-slate-800">
                             <span className="text-[10px] text-slate-500 block mb-1">Governor HPU</span>
                             <div className="grid grid-cols-2 gap-1">
                                <input type="number" placeholder="Bar" value={formState.hpuPressure} onChange={e => handleChange('hpuPressure', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                                <input type="number" placeholder="Run(s)" value={formState.pumpRunTime} onChange={e => handleChange('pumpRunTime', e.target.value)} className="bg-transparent text-xs text-center w-full focus:outline-none" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Computer Vision Section */}
                <div className="space-y-2 mt-4 border-t border-slate-800 pt-4">
                    <label className="text-xs text-slate-400 font-mono uppercase flex items-center gap-2">
                        <Camera className="w-3 h-3 text-cyan-400" />
                        Visual Inspection (Computer Vision)
                    </label>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-4">
                        <div className="relative group">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-16 h-16 bg-slate-900 border border-slate-700 border-dashed rounded flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-slate-600" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] text-slate-500 mb-1">Upload component photo for AI analysis (Cracks, Corrosion, Debris)</div>
                            {visionResult ? (
                                <div className="text-xs font-mono">
                                    <span className={visionResult.detections.length > 0 ? "text-amber-400" : "text-emerald-400"}>
                                        {visionResult.detections.length} Issues Detected
                                    </span>
                                    {visionResult.detections.some(d => d.severity === 'CRITICAL') && (
                                        <span className="ml-2 text-red-500 font-bold animate-pulse">CRITICAL</span>
                                    )}
                                    {videoResult && (
                                        <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-cyan-300">
                                            AR: {videoResult.detectedAnomalies.length} Anomalies | Audio: {videoResult.audioAnalysis.detectedPattern}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-[10px] text-slate-600 italic">Ready for analysis...</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button 
                        id="apply-btn"
                        onClick={handleApply}
                        className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        UPDATE
                    </button>
                    <button 
                        id="archive-btn"
                        onClick={handleArchive}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition-colors flex items-center justify-center gap-2 border border-slate-600"
                        title="Archive Knowledge Snapshot"
                    >
                        <Archive className="w-4 h-4" />
                        ARCHIVE
                    </button>
                </div>

                {/* Analysis Feedback */}
                {analysis && (
                    <div className="space-y-2 mt-4">
                        {/* Dr Turbine AI Card */}
                        {drTurbineResult && drTurbineResult.cards.length > 0 && (
                            <div className="p-3 rounded border text-xs bg-red-950/40 border-red-500 animate-pulse">
                                <div className="font-bold uppercase mb-1 flex items-center gap-2 text-red-400">
                                    <ShieldAlert className="w-4 h-4" />
                                    DR. TURBINE INTERVENTION
                                </div>
                                <div className="font-bold text-white mb-1">{drTurbineResult.cards[0].title}</div>
                                <p className="text-red-200 mb-2">{drTurbineResult.cards[0].message}</p>
                                <div className="bg-red-900/50 p-1.5 rounded text-center font-bold text-white">
                                    ACTION: {drTurbineResult.cards[0].actionLabel}
                                </div>
                            </div>
                        )}

                        {/* Invisible Monsters Report */}
                        {monsterResult && (monsterResult.overallRisk === 'HIGH' || monsterResult.overallRisk === 'CRITICAL') && (
                            <div className="p-3 rounded border text-xs bg-orange-950/40 border-orange-500">
                                <div className="font-bold uppercase mb-1 flex items-center gap-2 text-orange-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    INVISIBLE MONSTERS DETECTED
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <span className="text-[9px] text-slate-400 block">CAVITATION (σ)</span>
                                        <span className={`font-bold ${monsterResult.cavitation.riskLevel === 'SAFE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {monsterResult.cavitation.sigma.toFixed(3)} ({monsterResult.cavitation.riskLevel})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 block">EROSION</span>
                                        <span className={`font-bold ${monsterResult.erosion.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                            {monsterResult.erosion.estimatedWearRate.toFixed(1)} mm/yr
                                        </span>
                                    </div>
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-orange-200">
                                    {monsterResult.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className={`p-3 rounded border text-xs ${
                            analysis.zone.zone === 'OPTIMAL' && analysis.cavitation.risk === 'LOW'
                                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                                : 'bg-amber-950/30 border-amber-800 text-amber-400'
                        }`}>
                            <div className="flex items-start gap-2 mb-1">
                                {analysis.zone.zone === 'OPTIMAL' && analysis.cavitation.risk === 'LOW' 
                                    ? <Info className="w-4 h-4 shrink-0" />
                                    : <AlertTriangle className="w-4 h-4 shrink-0" />
                                }
                                <span className="font-bold uppercase">Hydraulic Physics</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1 opacity-90">
                                <li>{analysis.zone.message}</li>
                                {analysis.cavitation.risk !== 'LOW' && (
                                    <li className="text-red-400">{analysis.cavitation.details}</li>
                                )}
                                {analysis.cavitation.risk === 'LOW' && (
                                    <li>Cavitation Margin: Healthy</li>
                                )}
                            </ul>
                        </div>
                        
                        {/* Vibration Feedback */}
                        <div className={`p-3 rounded border text-xs ${
                            analysis.vibration.severity === 'NOMINAL'
                                ? 'bg-indigo-950/30 border-indigo-800 text-indigo-400'
                                : 'bg-red-950/30 border-red-800 text-red-400'
                        }`}>
                            <div className="flex items-start gap-2 mb-1">
                                <span className="font-bold uppercase">Vibration Analysis</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1 opacity-90">
                                <li className="font-bold">{analysis.vibration.pattern}</li>
                                {analysis.vibration.recommendations.length > 0 ? (
                                    analysis.vibration.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))
                                ) : (
                                    <li>Spectrum nominal. No fault patterns detected.</li>
                                )}
                            </ul>
                        </div>

                        {/* Oil & AI Feedback */}
                        {analysis.oilAnalysis && (
                            <div className={`p-3 rounded border text-xs ${
                                analysis.oilAnalysis.overallHealth === 'EXCELLENT' || analysis.oilAnalysis.overallHealth === 'GOOD'
                                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                                    : 'bg-orange-950/30 border-orange-800 text-orange-400'
                            }`}>
                                <div className="font-bold uppercase mb-1">Oil Health: {analysis.oilAnalysis.overallHealth}</div>
                                {analysis.oilAnalysis.findings.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1 opacity-90">
                                        {analysis.oilAnalysis.findings.map((f, i) => (
                                            <li key={i}>{f.message}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        
                        {analysis.aiPrediction?.synergeticRisk.detected && (
                             <div className="p-3 rounded border text-xs bg-purple-950/30 border-purple-800 text-purple-400">
                                <div className="font-bold uppercase mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    AI Risk Detected ({(analysis.aiPrediction.synergeticRisk.probability * 100).toFixed(0)}%)
                                </div>
                                <p>{analysis.aiPrediction.synergeticRisk.message}</p>
                             </div>
                        )}

                        {/* Specialist Notebook Diagnosis */}
                        {damageReport && (
                            <div className="p-3 rounded border text-xs bg-pink-950/30 border-pink-800 text-pink-400">
                                <div className="font-bold uppercase mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Specialist Diagnosis
                                </div>
                                <div className="font-bold mb-1">{damageReport.damageType} ({damageReport.estimatedSeverity})</div>
                                <ul className="list-disc pl-5 space-y-1 opacity-90">
                                    <li>Match Confidence: {damageReport.confidence}%</li>
                                    <li>Action: {damageReport.repairStrategy.immediate[0]}</li>
                                    <li className="text-pink-300">Est. Cost: {damageReport.estimatedCost}</li>
                                </ul>
                            </div>
                        )}

                        {/* Energy & Life Extension */}
                        <div className="grid grid-cols-2 gap-2">
                             <div className="p-2 rounded border text-xs bg-slate-950/50 border-slate-800 text-slate-400">
                                <div className="font-bold uppercase mb-1 flex items-center gap-1 text-cyan-400">
                                    <Zap className="w-3 h-3" />
                                    Harvest
                                </div>
                                <div>{analysis.energyHarvest?.powerW.toFixed(1)} W</div>
                                <div className="text-[10px] text-slate-500">€{analysis.energyHarvest?.annualEur.toFixed(0)}/yr</div>
                             </div>
                             <div className="p-2 rounded border text-xs bg-slate-950/50 border-slate-800 text-slate-400">
                                <div className="font-bold uppercase mb-1 flex items-center gap-1 text-emerald-400">
                                    <TrendingUp className="w-3 h-3" />
                                    Life Ext.
                                </div>
                                <div>+{analysis.lifeExtension?.yearsAdded.toFixed(1)} yrs</div>
                                <div className="text-[10px] text-slate-500">Physics Model</div>
                             </div>
                        </div>

                        {/* Structural & Safety */}
                        {analysis.structural && (
                             <div className={`mt-2 p-2 rounded border text-xs ${
                                analysis.structural.status === 'NORMAL' ? 'bg-slate-900 border-slate-700' : 'bg-red-950/30 border-red-500'
                             }`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold uppercase text-slate-400">Structural Margin</span>
                                    <span className={analysis.structural.status === 'NORMAL' ? 'text-emerald-400' : 'text-red-400'}>
                                        {analysis.structural.margin.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-500">MAWP: {analysis.structural.mawp.toFixed(1)} bar</div>
                             </div>
                        )}

                        {/* Hydraulic Safety */}
                        {analysis.hydraulicSafety && !analysis.hydraulicSafety.approved && (
                             <div className="mt-2 p-2 rounded border text-xs bg-red-950/50 border-red-500 text-red-300">
                                <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    MODIFICATION UNSAFE
                                </div>
                                <div>{analysis.hydraulicSafety.reason}</div>
                             </div>
                        )}

                        {/* Thermal & Mechanical Advanced */}
                        {(analysis.thermal || analysis.wicket || analysis.airGap) && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {analysis.thermal && (
                                    <div className="p-2 rounded border text-xs bg-slate-950/50 border-slate-800 text-slate-400">
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1 text-blue-400">
                                            <TrendingUp className="w-3 h-3" />
                                            Cooling
                                        </div>
                                        <div>Visc: {analysis.thermal.viscosity} cP</div>
                                        <div className="text-[10px] text-slate-500">{analysis.thermal.action} (Valve: {analysis.thermal.valveRec}%)</div>
                                    </div>
                                )}
                                {analysis.airGap && (
                                    <div className={`p-2 rounded border text-xs ${analysis.airGap.action === 'NO_ACTION' ? 'bg-slate-950/50 border-slate-800' : 'bg-red-950/30 border-red-500'}`}>
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1 text-purple-400">
                                            <Zap className="w-3 h-3" />
                                            Air Gap
                                        </div>
                                        <div>Ecc: {analysis.airGap.ecc.toFixed(1)}%</div>
                                        <div className="text-[10px] text-slate-500">UMP: {analysis.airGap.ump.toFixed(0)}N</div>
                                    </div>
                                )}
                            </div>
                        )}
                        {analysis.wicket && analysis.wicket.backlash > 2 && (
                             <div className="mt-2 p-2 rounded border text-xs bg-orange-950/50 border-orange-500 text-orange-300">
                                <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Wicket Gate Hysteresis
                                </div>
                                <div>Backlash: {analysis.wicket.backlash.toFixed(1)}% detected</div>
                             </div>
                        )}

                        {/* Acoustic & Galvanic Feedback */}
                        {(analysis.acoustic || analysis.galvanic) && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {analysis.acoustic && (
                                    <div className={`p-2 rounded border text-xs ${
                                        analysis.acoustic.severity === 'NORMAL' ? 'bg-slate-950/50 border-slate-800' : 'bg-purple-950/30 border-purple-500'
                                    }`}>
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1 text-purple-400">
                                            <Activity className="w-3 h-3" /> Acoustic
                                        </div>
                                        <div>{analysis.acoustic.pattern}</div>
                                        <div className="text-[9px] opacity-70">Conf: {analysis.acoustic.confidence.toFixed(0)}%</div>
                                    </div>
                                )}
                                {analysis.galvanic && (
                                    <div className={`p-2 rounded border text-xs ${
                                        analysis.galvanic.protection === 'GOOD' ? 'bg-slate-950/50 border-slate-800' : 'bg-orange-950/30 border-orange-500'
                                    }`}>
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1 text-orange-400">
                                            <Zap className="w-3 h-3" /> Cathodic
                                        </div>
                                        <div>{analysis.galvanic.voltage} mV</div>
                                        {analysis.galvanic.alerts.length > 0 && (
                                            <div className="text-[9px] text-red-400 font-bold">ALERTS ACTIVE</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Electrical & Auxiliary Feedback */}
                        {(analysis.transformer || analysis.stator || analysis.seal || analysis.governor) && (
                            <div className="mt-2 space-y-2">
                                {analysis.transformer && analysis.transformer.fault !== 'NORMAL' && (
                                    <div className="p-2 rounded border text-xs bg-red-950/30 border-red-500 text-red-300">
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            TRANSFORMER FAULT: {analysis.transformer.fault}
                                        </div>
                                        <div>{analysis.transformer.rec}</div>
                                    </div>
                                )}
                                {analysis.stator && analysis.stator.severity !== 'LOW' && (
                                    <div className="p-2 rounded border text-xs bg-orange-950/30 border-orange-500 text-orange-300">
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            STATOR PD: {analysis.stator.severity}
                                        </div>
                                        <div>Action: {analysis.stator.action}</div>
                                    </div>
                                )}
                                {analysis.seal && analysis.seal.action !== 'NO_ACTION' && (
                                    <div className="p-2 rounded border text-xs bg-purple-950/30 border-purple-500 text-purple-300">
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            SHAFT SEAL RISK: {(analysis.seal.prob * 100).toFixed(1)}%
                                        </div>
                                        <div>{analysis.seal.action}</div>
                                    </div>
                                )}
                                {analysis.governor && analysis.governor.action !== 'NO_ACTION' && (
                                    <div className="p-2 rounded border text-xs bg-amber-950/30 border-amber-500 text-amber-300">
                                        <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                            <Settings className="w-3 h-3" />
                                            GOVERNOR: {analysis.governor.action}
                                        </div>
                                        <div>{analysis.governor.reason}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Synergy */}
                        {analysis.synergy?.correlated && (
                            <div className="mt-2 p-2 rounded border text-xs bg-indigo-950/30 border-indigo-500 text-indigo-300">
                                <div className="font-bold uppercase mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    SYNERGETIC ANOMALY (r={analysis.synergy.r.toFixed(2)})
                                </div>
                                <div>Vibration & Load highly correlated - indicating mechanical coupling issue.</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            )}
        </div>
    );
};
