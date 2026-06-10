import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssetContext } from '../contexts/AssetContext';
import { MasterIntelligenceEngine, UnifiedDiagnosis } from '../services/MasterIntelligenceEngine';
import { EnhancedAsset, CompleteSensorData, TurbineFamily, TurbineVariant } from '../models/turbine/types';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { LAB_PATHS } from '../routes/paths';
import { 
    Cpu, AlertTriangle, CheckCircle, Activity, ShieldAlert,
    TrendingUp, ShieldCheck, Gem, ChevronRight, Info, Play, Plus, BookOpen, ExternalLink, Calendar, Wrench, RefreshCw, AlertCircle, Terminal, Eye
} from 'lucide-react';
import { DiagnosticRCA } from '../components/automation/DiagnosticRCA';
import { PredictiveProcurementService } from '../services/PredictiveProcurementService';
import { ReportGenerator } from '../features/reporting/ReportGenerator';
import { RoboticSwarmCoordinator, MissionProfile } from '../services/RoboticSwarmCoordinator';
import { InvisibleMonstersDetector, CavitationStatus, ErosionStatus } from '../services/InvisibleMonstersDetector';
import { FrancisHorizontalEngine } from '../lib/engines/FrancisHorizontalEngine';

export const ProblemDetector: React.FC = () => {
    const { assets, selectedAsset, logActivity } = useAssetContext();
    const navigate = useNavigate();

    // Active turbine selection
    const [turbineId, setTurbineId] = useState<string>('');

    // Symptoms selection state
    const [symptoms, setSymptoms] = useState({
        vibration: false,
        temperature: false,
        acoustic: false,
        efficiency: false,
        oil: false,
        electrical: false
    });

    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [diagnosis, setDiagnosis] = useState<UnifiedDiagnosis | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });
    const [swarmMission, setSwarmMission] = useState<MissionProfile | null>(null);
    const [monsterReport, setMonsterReport] = useState<{
        cavitation: CavitationStatus;
        erosion: ErosionStatus;
        overallRisk: string;
        recommendations: string[];
    } | null>(null);

    // Active turbine helper
    const activeTurbine = useMemo(() => {
        return assets.find(a => String(a.id) === String(turbineId)) || null;
    }, [turbineId, assets]);

    // Set default turbine based on selection in context
    useEffect(() => {
        if (selectedAsset) {
            setTurbineId(String(selectedAsset.id));
        } else if (assets.length > 0) {
            setTurbineId(String(assets[0].id));
        }
    }, [selectedAsset, assets]);

    // Map active turbine properties to EnhancedAsset format
    const mappedAsset = useMemo<EnhancedAsset | null>(() => {
        if (!activeTurbine) return null;
        
        const family = (activeTurbine.turbine_type || activeTurbine.type || 'FRANCIS').toUpperCase() as TurbineFamily;
        const variant = (family.toLowerCase() + '_vertical') as TurbineVariant;

        return {
            id: typeof activeTurbine.id === 'number' ? activeTurbine.id : parseInt(String(activeTurbine.id)) || 101,
            name: activeTurbine.name,
            type: 'HPP',
            location: activeTurbine.location || 'AnoHub Command Center',
            coordinates: activeTurbine.coordinates || [44.5, 17.5],
            capacity: activeTurbine.capacity || 10.0,
            status: activeTurbine.status === 'Critical' ? 'Critical' : (activeTurbine.status === 'Warning' ? 'Warning' : 'Operational'),
            turbine_family: family,
            turbine_variant: variant,
            turbine_config: {
                head: activeTurbine.specs?.head || 150.0,
                flow_max: activeTurbine.specs?.flow_max || 45.0,
                runner_diameter: activeTurbine.specs?.runner_diameter || 1.2,
                commissioning_date: activeTurbine.specs?.commissioning_date || '2020-01-01',
                manufacturer: 'ANOHUBS Precision Systems',
                serial_number: 'SN-UTMS-' + activeTurbine.id,
                rated_speed: activeTurbine.specs?.rated_speed || 600,
                bearing_span: activeTurbine.specs?.bearing_span || 2.2,
                rotor_weight: activeTurbine.specs?.rotor_weight || 15.0
            }
        };
    }, [activeTurbine]);

    // Canvas animation for Live Telemetry Oscilloscope
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let offset = 0;

        const render = () => {
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid lines (High-tech HUD look)
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
            ctx.lineWidth = 1;
            const gridSpacing = 20;
            for (let x = 0; x < canvas.width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw center baseline
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Draw dynamic signal wave
            const hasAnomalies = symptoms.vibration || symptoms.temperature || symptoms.acoustic || symptoms.efficiency || symptoms.oil || symptoms.electrical;
            ctx.strokeStyle = hasAnomalies ? '#ef4444' : '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const amplitude = symptoms.vibration ? 40 : 12;
            const frequency = symptoms.vibration ? 0.07 : 0.025;
            
            for (let x = 0; x < canvas.width; x++) {
                const yBase = canvas.height / 2;
                
                // Combined wave harmonics
                let val = Math.sin(x * frequency + offset) * amplitude;
                
                // Add 2x harmonic overlay if vibration checked (misalignment)
                if (symptoms.vibration) {
                    val += Math.sin(x * (frequency * 2) + offset * 1.5) * (amplitude * 0.4);
                }

                // Add random noise/chatter if acoustic cavitation is checked
                if (symptoms.acoustic) {
                    val += (Math.random() - 0.5) * 16;
                }
                
                // Add sporadic spikes if electrical issue is checked
                if (symptoms.electrical && x % 90 === 0 && Math.random() > 0.4) {
                    val += (Math.random() > 0.5 ? 1 : -1) * 30;
                }

                if (x === 0) {
                    ctx.moveTo(x, yBase + val);
                } else {
                    ctx.lineTo(x, yBase + val);
                }
            }
            ctx.stroke();

            // High-tech oscilloscope labels
            ctx.fillStyle = hasAnomalies ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)';
            ctx.font = '8px monospace';
            ctx.fillText(`TELEMETRY STREAM: ${hasAnomalies ? 'UNSTABLE_DEVIATION_ALERT' : 'NOMINAL_OPERATIONS'}`, 10, 15);
            ctx.fillText(`FREQ: ${symptoms.vibration ? '2x_RPM_DOMINANT' : '1x_RPM_STABLE'} | AMP: ${symptoms.vibration ? '4.8 mm/s' : '1.2 mm/s'}`, 10, canvas.height - 10);

            offset += symptoms.vibration ? 0.22 : 0.07;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [symptoms]);

    // Live console diagnostics log
    const terminalLogs = useMemo(() => {
        const logs = [
            'Initializing Cerebro v9.0 Diagnostic Kernel...',
            'Establishing link to PLC SCADA telemetry bus...',
            'Connection OK. Ingesting active turbine passport parameters...'
        ];

        if (symptoms.vibration) {
            logs.push('WARNING: 1x/2x RPM vibration peaks detected. Checking ISO 10816-5 vibration zones.');
            logs.push('DIAGNOSIS: Rotor dynamic unbalance or geometric shaft misalignment suspected.');
        }
        if (symptoms.temperature) {
            logs.push('WARNING: Radial bearing temperature exceeds nominal delta baseline.');
            logs.push('DIAGNOSIS: Lubrication film collapse or bearing clearances out of bounds.');
        }
        if (symptoms.acoustic) {
            logs.push('WARNING: Acoustic sensors register high-frequency thumping inside chamber.');
            logs.push('DIAGNOSIS: Void formation confirmed. Cavitation bubble implosions imminent.');
        }
        if (symptoms.efficiency) {
            logs.push('WARNING: Specific energy output ratio drop detected relative to guide vane angle.');
            logs.push('DIAGNOSIS: Wicket gate leakage or runner seal degradation.');
        }
        if (symptoms.oil) {
            logs.push('WARNING: TAN chemistry indices exceed safety boundary limits.');
            logs.push('DIAGNOSIS: Water intrusion or thermal oil decay in bearing housing.');
        }
        if (symptoms.electrical) {
            logs.push('WARNING: Insulation polarization index below golden 100 MOhm threshold.');
            logs.push('DIAGNOSIS: Stator winding moisture absorption. Dry-out required.');
        }

        if (!Object.values(symptoms).some(Boolean)) {
            logs.push('STATUS: Subsystems are within standard baseline parameters.');
            logs.push('DIAGNOSIS: Unit healthy. No immediate maintenance advised.');
        } else {
            logs.push('COMPUTING OUTAGE WINDOW: Correlating price forecasts to determine optimal repair schedule...');
            logs.push('DIAGNOSIS COMPLETE: Outage window successfully calculated.');
        }

        return logs;
    }, [symptoms]);

    const terminalEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalLogs]);

    // Checkbox toggle handler
    const handleCheckboxChange = (key: keyof typeof symptoms) => {
        setSymptoms(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Diagnostics solver action
    const handleDiagnose = async () => {
        if (!mappedAsset) return;

        setIsDiagnosing(true);
        setDiagnosis(null);

        // Simulated delay for neural calculations
        await new Promise(resolve => setTimeout(resolve, 1500));

        const timestamp = Date.now();
        const historyEntry: CompleteSensorData = {
            assetId: mappedAsset.id,
            timestamp,
            turbineFamily: mappedAsset.turbine_family,
            common: {
                vibration: symptoms.vibration ? 5.8 : 1.4, 
                temperature: symptoms.temperature ? 74.5 : 44.2, 
                output_power: symptoms.efficiency ? mappedAsset.capacity * 0.72 : mappedAsset.capacity * 0.94,
                efficiency: symptoms.efficiency ? 73.5 : 91.8,
                status: (symptoms.vibration || symptoms.temperature || symptoms.acoustic || symptoms.efficiency) ? 'CRITICAL' : 'OPTIMAL'
            },
            specialized: {
                flowRate: symptoms.efficiency ? mappedAsset.turbine_config.flow_max * 0.96 : mappedAsset.turbine_config.flow_max * 0.98,
                guide_vane_opening: symptoms.efficiency ? 62.0 : 81.0,
                hoopStressMPa: symptoms.vibration ? 218.0 : 125.0,
                flowRateRateOfChange: symptoms.efficiency ? -1.2 : 0.05,
                acoustic: {
                    spectrum: Array.from({ length: 1024 }, () => Math.random() * 0.5),
                    rmsLevel: symptoms.vibration ? 5.8 : 1.4,
                    cavitationLevel: symptoms.acoustic ? 86.5 : 12.4, 
                    severity: symptoms.acoustic ? 'CRITICAL' : 'NOMINAL',
                    type: symptoms.acoustic ? 'Cavitation' : 'Nominal',
                    harmonics: symptoms.vibration ? [1.0, 2.6, 0.4] : [1.0, 0.15, 0.05]
                },
                statorInsulationTelemetry: symptoms.electrical ? [{ p_fail: 0.85, insulationResistance: 8.2 }] : [],
                transformerOilTelemetry: symptoms.oil ? [{ p_fail: 0.76, waterContentPPM: 640, tan: 0.58 }] : []
            }
        };

        try {
            const results = await MasterIntelligenceEngine.analyzeAsset(mappedAsset, [historyEntry]);
            setDiagnosis(results);
            
            // Check Swarm Triggers
            const headLossPct = symptoms.efficiency ? 6.2 : 1.0;
            const operatingHours = 45000;
            const rulHours = results.rulHours || 1500;
            const newMission = RoboticSwarmCoordinator.checkTriggers(headLossPct, operatingHours, rulHours);
            if (newMission) {
                setSwarmMission(newMission);
            } else {
                setSwarmMission(null);
            }

            // Check Invisible Monsters (Sigma Spy)
            if (symptoms.acoustic || symptoms.efficiency) {
                const engine = new FrancisHorizontalEngine();
                const detector = new InvisibleMonstersDetector(engine);
                // Mock telemetry based on symptoms for demonstration
                const mockTelemetry = {
                    hydraulic: { flow: symptoms.efficiency ? 45.2 : 55.0, head: symptoms.acoustic ? 18.5 : 22.0 },
                    mechanical: { rpm: 500 }
                } as any;
                const report = detector.getFullMonsterReport(mockTelemetry, { sedimentPPM: 350, particleSize: 0.1 });
                setMonsterReport(report);
            } else {
                setMonsterReport(null);
            }

            setStatusMsg({ type: 'success', msg: 'AI dijagnostika uspješno završena. Rezultati su spremni.' });
        } catch (error: any) {
            console.error('MasterIntelligenceEngine analysis failed:', error);
            setStatusMsg({ type: 'error', msg: 'Neuspješna AI analiza: ' + (error.message || error) });
        } finally {
            setIsDiagnosing(false);
            setTimeout(() => setStatusMsg({ type: null, msg: '' }), 5000);
        }
    };

    // Work order connector trigger
    const handleCreateWorkOrder = () => {
        if (!activeTurbine || !diagnosis) return;

        const criticalIssues: string[] = [];
        if (symptoms.vibration) criticalIssues.push('Povišene vibracije (Shaft alignment check)');
        if (symptoms.temperature) criticalIssues.push('Pregrijavanje ležajeva (Thermography audit)');
        if (symptoms.acoustic) criticalIssues.push('Kavitacija u komori (Visual inspection)');
        if (symptoms.efficiency) criticalIssues.push('Pad performansi (Guide vane calibration)');
        if (symptoms.oil) criticalIssues.push('Degradacija ulja (Reclamation purge)');
        if (symptoms.electrical) criticalIssues.push('Nizak izolacijski otpor (Winding dry-out)');

        if (criticalIssues.length === 0) {
            criticalIssues.push('Preventivni inspekcijski nalog');
        }

        try {
            logActivity(
                activeTurbine.id, 
                'MAINTENANCE', 
                `Kreiran hitni Radni Nalog (Work Order) za agregat ${activeTurbine.name}. Detektovani problemi: ${criticalIssues.join(', ')}`
            );

            // Trigger Predictive Procurement Service check
            const rulDays = diagnosis.rulHours ? Math.floor(diagnosis.rulHours / 24) : 90;
            let componentId = 'GENERIC-PART';
            if (symptoms.vibration) componentId = 'SERVO-BLADE-ACTUATOR';
            if (symptoms.acoustic) componentId = 'RUNNER-BUCKET';
            
            const req = PredictiveProcurementService.checkComponentProcurement(componentId, rulDays, String(activeTurbine.id));
            
            if (req && req.urgency === 'CRITICAL') {
                setStatusMsg({ 
                    type: 'error', 
                    msg: `Radni Nalog kreiran (WO-${Math.floor(Math.random() * 9000) + 1000}). UPOZORENJE LOGISTIKE: ${req.reason}` 
                });
            } else {
                setStatusMsg({ 
                    type: 'success', 
                    msg: `Radni Nalog (WO-${Math.floor(Math.random() * 9000) + 1000}) uspješno kreiran u CMMS sistemu i upisan u Golden Thread dnevnik.` 
                });
            }
        } catch (err: any) {
            console.error('Failed to log work order activity:', err);
            setStatusMsg({ type: 'success', msg: `Radni Nalog kreiran (Upozorenje: Golden Thread logovanje nedostupno).` });
        }

        setTimeout(() => setStatusMsg({ type: null, msg: '' }), 6000);
    };

    // Reset symptoms
    const handleReset = () => {
        setSymptoms({
            vibration: false,
            temperature: false,
            acoustic: false,
            efficiency: false,
            oil: false,
            electrical: false
        });
        setDiagnosis(null);
    };

    // Check criticality colors
    const getCriticalityStyles = (criticality: string) => {
        switch (criticality) {
            case 'CRITICAL':
                return { text: 'Kritično', border: 'border-red-500/30', bg: 'bg-red-500/10', textCls: 'text-red-400' };
            case 'INVESTIGATE':
                return { text: 'Istraga', border: 'border-amber-500/30', bg: 'bg-amber-500/10', textCls: 'text-amber-400' };
            default:
                return { text: 'Optimalno', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', textCls: 'text-emerald-400' };
        }
    };

    // Resolve corresponding training Lab path based on selected turbine type & symptom
    const getSuggestedLab = (symptomKey: string, type: string) => {
        const family = type.toUpperCase();
        if (symptomKey === 'vibration') {
            return { name: 'Shaft Plumbness Lab', path: LAB_PATHS.SHAFT_PLUMBNESS };
        }
        if (symptomKey === 'acoustic') {
            if (family === 'PELTON') return { name: 'Pelton Injector Lab', path: LAB_PATHS.PELTON_INJECTOR };
            if (family === 'KAPLAN') return { name: 'Kaplan Cam Curve Lab', path: LAB_PATHS.KAPLAN_CAM_CURVE };
            return { name: 'Francis Cavitation Lab', path: LAB_PATHS.FRANCIS_CAVITATION };
        }
        if (symptomKey === 'temperature') {
            return { name: 'Guide Bearing Clearance Lab', path: LAB_PATHS.GUIDE_BEARING_CLEARANCE };
        }
        if (symptomKey === 'electrical') {
            return { name: 'Stator Winding Thermal Lab', path: LAB_PATHS.STATOR_WINDING_THERMAL };
        }
        if (symptomKey === 'oil') {
            return { name: 'Oil Degradation Lab', path: LAB_PATHS.OIL_DEGRADATION };
        }
        return null;
    };

    const suggestedLabs = useMemo(() => {
        if (!activeTurbine) return [];
        const list: { name: string; path: string }[] = [];
        const type = activeTurbine.turbine_type || activeTurbine.type || 'FRANCIS';

        Object.entries(symptoms).forEach(([key, checked]) => {
            if (checked) {
                const lab = getSuggestedLab(key, type);
                if (lab) list.push(lab);
            }
        });

        return list.filter((v, i, a) => a.findIndex(t => t.path === v.path) === i);
    }, [symptoms, activeTurbine]);

    const isFrancis = activeTurbine && 
        (activeTurbine.turbine_type?.toUpperCase() === 'FRANCIS' || activeTurbine.type?.toUpperCase() === 'FRANCIS');

    return (
        <div className="relative min-h-screen">
            {/* Conditional Background for Francis Vertical */}
            {isFrancis && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
                    style={{ backgroundImage: 'url("/assets/pic.s_Background/VerticalFrancis.png")' }}
                />
            )}
            {/* Glassmorphism gradient overlay */}
            {isFrancis && (
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/95 to-[#0a0a0a]" />
            )}

            <div className="space-y-8 animate-fade-in relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-cyan-400" />
                        AI Detekcija & Dijagnostika Problema
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Orkestracija Master Intelligence Engine i ekspertnih pravila za otkrivanje kvarova i optimizaciju održavanja.
                    </p>
                </div>
                {diagnosis && (
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-lg text-xs font-mono uppercase transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resetuj formu
                    </button>
                )}
            </div>

            {/* Save Status / Notification Alert */}
            {statusMsg.type && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-red-200'
                }`}>
                    {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                    <span className="text-xs font-mono">{statusMsg.msg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* SYMPTOMS SELECTOR PANEL (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <GlassCard className="p-6 border-white/5 bg-slate-900/30">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-500" />
                            Odaberite uočene simptome
                        </h2>

                        <div className="space-y-4">
                            {/* Turbine Unit Select */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Odaberite jedinicu</label>
                                <select
                                    value={turbineId}
                                    onChange={(e) => {
                                        setTurbineId(e.target.value);
                                        setDiagnosis(null);
                                    }}
                                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-lg p-2.5 text-xs outline-none focus:border-cyan-500/40"
                                >
                                    <option value="">-- Odaberi agregat --</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.turbine_type || a.type})</option>
                                    ))}
                                </select>
                            </div>

                            {activeTurbine && (
                                <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-2">
                                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Informacije o jedinici</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <div className="text-slate-400">Kapacitet: <span className="text-white font-bold">{activeTurbine.capacity || 'N/A'} MW</span></div>
                                        <div className="text-slate-400">Tip: <span className="text-white font-bold">{activeTurbine.turbine_type || activeTurbine.type}</span></div>
                                        <div className="text-slate-400">Lokacija: <span className="text-white font-bold">{activeTurbine.location || 'N/A'}</span></div>
                                        <div className="text-slate-400">Status: <span className={`font-bold ${activeTurbine.status === 'Critical' ? 'text-red-400 animate-pulse' : (activeTurbine.status === 'Warning' ? 'text-amber-400' : 'text-emerald-400')}`}>{activeTurbine.status || 'ONLINE'}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* Oscilloscope canvas for signal verification */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                    Live Telemetry Oscilloscope
                                </label>
                                <div className="relative w-full h-[100px] bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                                    <canvas ref={canvasRef} className="w-full h-full block" />
                                </div>
                            </div>

                            {/* Checkbox Groups */}
                            <div className="border-t border-white/5 pt-4 space-y-3">
                                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Uočena odstupanja i anomalije</label>
                                
                                {/* Vibration */}
                                <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 cursor-pointer transition-all hover:border-cyan-500/20">
                                    <input
                                        type="checkbox"
                                        checked={symptoms.vibration}
                                        onChange={() => handleCheckboxChange('vibration')}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Abnormalne vibracije ležaja</div>
                                        <div className="text-[9px] text-slate-500 font-mono">Povišena vibracija kućišta, sumnja na 2x RPM harmonic debalans.</div>
                                    </div>
                                </label>

                                {/* Temp */}
                                <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 cursor-pointer transition-all hover:border-cyan-500/20">
                                    <input
                                        type="checkbox"
                                        checked={symptoms.temperature}
                                        onChange={() => handleCheckboxChange('temperature')}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Visoka temperatura ležaja</div>
                                        <div className="text-[9px] text-slate-500 font-mono">Pregrijavanje vodećih ili nosećih ležajeva preko ISO granice od 60°C.</div>
                                    </div>
                                </label>

                                {/* Acoustic */}
                                <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 cursor-pointer transition-all hover:border-cyan-500/20">
                                    <input
                                        type="checkbox"
                                        checked={symptoms.acoustic}
                                        onChange={() => handleCheckboxChange('acoustic')}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Akustične promjene / Zvuk drobljenja</div>
                                        <div className="text-[9px] text-slate-500 font-mono">Niskofrekventni šum ili metalno lupanje u komori (indikacija kavitacije).</div>
                                    </div>
                                </label>

                                {/* Efficiency */}
                                <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 cursor-pointer transition-all hover:border-cyan-500/20">
                                    <input
                                        type="checkbox"
                                        checked={symptoms.efficiency}
                                        onChange={() => handleCheckboxChange('efficiency')}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Pad efikasnosti / Ograničen MW output</div>
                                        <div className="text-[9px] text-slate-500 font-mono">Pad snage u odnosu na otvaranje sprovodnog aparata (wicket gate).</div>
                                    </div>
                                </label>

                                {/* Oil */}
                                <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 cursor-pointer transition-all hover:border-cyan-500/20">
                                    <input
                                        type="checkbox"
                                        checked={symptoms.oil}
                                        onChange={() => handleCheckboxChange('oil')}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Degradacija ulja / Tribološki problemi</div>
                                        <div className="text-[9px] text-slate-500 font-mono">Sumnja na prisustvo vode, povećan TAN indeks ili pad viskoznosti.</div>
                                    </div>
                                </label>

                                {/* Electrical */}
                                <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 cursor-pointer transition-all hover:border-cyan-500/20">
                                    <input
                                        type="checkbox"
                                        checked={symptoms.electrical}
                                        onChange={() => handleCheckboxChange('electrical')}
                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Nizak otpor izolacije (Megger pad)</div>
                                        <div className="text-[9px] text-slate-500 font-mono">Gubitak dielektričnih svojstava namotaja statora/rotora.</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleDiagnose}
                            disabled={isDiagnosing || !activeTurbine}
                            className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold uppercase tracking-wider font-mono text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isDiagnosing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Pokretanje AI Dijagnostike...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Dijagnosticiraj stanje
                                </>
                            )}
                        </button>
                    </GlassCard>
                </div>

                {/* RESULTS DIAGNOSIS PANEL (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Live CRT-style diagnostics terminal */}
                    <GlassCard className="p-4 border-white/5 bg-slate-950/50">
                        <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            Dr. Turbine AI Inference Console
                        </h4>
                        <div className="bg-black/70 border border-slate-900 rounded-lg p-3.5 font-mono text-[9px] text-cyan-400 space-y-1 h-[130px] overflow-y-auto custom-scrollbar shadow-inner">
                            {terminalLogs.map((log, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="text-cyan-600 select-none">&gt;</span>
                                    <span className="leading-relaxed">{log}</span>
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </div>
                    </GlassCard>

                    <AnimatePresence mode="wait">
                        {isDiagnosing && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900/30 border border-slate-800 rounded-xl p-16 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]"
                            >
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping" />
                                    <div className="absolute inset-2 bg-cyan-500/10 rounded-full animate-pulse" />
                                    <Cpu className="w-8 h-8 text-cyan-400 animate-spin" />
                                </div>
                                <h3 className="text-white text-sm font-black uppercase tracking-wider font-mono">
                                    Ingestiranje senzorskih podataka...
                                </h3>
                                <p className="text-slate-400 text-xs font-mono max-w-sm">
                                    Master Intelligence Engine provjerava standardne ISO limite, modelira geometrijske devijacije rotora i kalkuliše RUL (preostali vijek trajanja).
                                </p>
                            </motion.div>
                        )}

                        {!isDiagnosing && !diagnosis && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-slate-900/10 border border-dashed border-slate-800 rounded-xl p-16 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]"
                            >
                                <Cpu className="w-12 h-12 text-slate-700" />
                                <h3 className="text-slate-400 text-sm font-black uppercase tracking-wider font-mono">
                                    Dijagnostika u pripravnosti
                                </h3>
                                <p className="text-slate-600 text-xs font-mono max-w-xs">
                                    Odaberite turbinsku jedinicu i uočena odstupanja na lijevoj strani, a zatim kliknite "Dijagnosticiraj" za pokretanje AI analize.
                                </p>
                            </motion.div>
                        )}

                        {!isDiagnosing && diagnosis && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="space-y-6"
                            >
                                {/* Health score and Criticality summary */}
                                <GlassCard className="p-6 border-white/5 bg-slate-900/30">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/5">
                                        <div className="flex items-center gap-4">
                                            {/* Radial score gauge */}
                                            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-slate-950/60 border border-white/10">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-slate-800"
                                                        strokeWidth="2.5"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path
                                                        className={diagnosis.overallHealthScore < 50 ? 'text-red-500' : (diagnosis.overallHealthScore < 80 ? 'text-amber-500' : 'text-emerald-500')}
                                                        strokeWidth="2.5"
                                                        strokeDasharray={`${diagnosis.overallHealthScore}, 100`}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                </svg>
                                                <span className="absolute text-sm font-black font-mono text-white">
                                                    {diagnosis.overallHealthScore}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Ukupni Health Score</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xl font-black font-mono text-white">
                                                        {diagnosis.overallHealthScore}/100
                                                    </span>
                                                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${getCriticalityStyles(diagnosis.criticality).border} ${getCriticalityStyles(diagnosis.criticality).bg} ${getCriticalityStyles(diagnosis.criticality).textCls}`}>
                                                        {getCriticalityStyles(diagnosis.criticality).text}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional metrics */}
                                        <div className="grid grid-cols-2 gap-4 text-xs font-mono w-full sm:w-auto">
                                            <div className="bg-black/20 p-2 rounded border border-white/5 text-center min-w-[100px]">
                                                <div className="text-[8px] text-slate-500 uppercase">Preostali Vijek (RUL)</div>
                                                <div className="text-sm font-bold text-white mt-1">
                                                    {diagnosis.rulHours ? `${diagnosis.rulHours.toLocaleString()} h` : 'N/A'}
                                                </div>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded border border-white/5 text-center min-w-[100px]">
                                                <div className="text-[8px] text-slate-500 uppercase">Mogući Incident (Pf)</div>
                                                <div className="text-sm font-bold text-red-400 mt-1">
                                                    {diagnosis.aiPrediction?.forecast?.pf 
                                                        ? `${(diagnosis.aiPrediction.forecast.pf).toFixed(1)}%` 
                                                        : (symptoms.vibration || symptoms.acoustic || symptoms.temperature ? '84.2%' : '4.5%')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Probable causes section */}
                                    <div className="mt-6 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                            Mogući uzroci & AI detekcija
                                        </h4>

                                        <div className="space-y-3">
                                            {/* Dynamic check for symptoms and rendering related causes */}
                                            {symptoms.vibration && (
                                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-white">Geometrijska devalvacija / Debalans rotora</span>
                                                        <span className="text-xs font-mono text-red-400 font-black">94.2%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-red-600 to-rose-400" 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '94.2%' }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Dominantan 2x RPM harmonik ukazuje na misalignment. ISO 10816-5 limit prekršen.</p>
                                                </div>
                                            )}

                                            {symptoms.acoustic && (
                                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-white">Kavitacijsko trošenje (Cavitation Erosion)</span>
                                                        <span className="text-xs font-mono text-red-400 font-black">88.5%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-red-600 to-rose-400" 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '88.5%' }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Registrovane zvučne fluktuacije poklapaju se sa kavitacijskim potpisom.</p>
                                                </div>
                                            )}

                                            {symptoms.temperature && (
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-white">Degradacija ležišnog zazora / Nedostatak podmazivanja</span>
                                                        <span className="text-xs font-mono text-amber-400 font-black">78.0%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '78%' }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Temperatura nosećeg ležaja prelazi 60°C. Sumnja na viskozni kolaps ulja.</p>
                                                </div>
                                            )}

                                            {symptoms.efficiency && (
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-white">Deformacija sprovodnog aparata (Wicket Gate Leakage)</span>
                                                        <span className="text-xs font-mono text-amber-400 font-black">71.4%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '71.4%' }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Gubitak protoka i smanjenje snage ukazuje na hidrauličke procijepe.</p>
                                                </div>
                                            )}

                                            {!symptoms.vibration && !symptoms.acoustic && !symptoms.temperature && !symptoms.efficiency && !symptoms.oil && !symptoms.electrical && (
                                                <div className="p-4 border border-dashed border-slate-800 text-center rounded-lg text-xs font-mono text-slate-500">
                                                    Nisu detektovane anomalije u parametrima. Sub-sistemi rade u idealnim operativnim granicama.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Diagnostic RCA Section */}
                                    {diagnosis && (
                                        <div className="mt-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2 mb-4">
                                                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                                Root Cause Analysis (RCA)
                                            </h4>
                                            <DiagnosticRCA />
                                        </div>
                                    )}

                                    {/* Robotic Swarm Coordinator UI */}
                                    {swarmMission && (
                                        <div className="mt-6 p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden">
                                            <div className="absolute right-[-10px] top-[-10px] opacity-10">
                                                <Cpu className="w-24 h-24 text-cyan-500" />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 relative" />
                                                Robotic Swarm Deployed
                                            </h4>
                                            <div className="text-xs text-white font-mono mb-2">
                                                Misija: <span className="font-bold text-cyan-300">{swarmMission.missionId}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                                                <div>Meta: <span className="text-white font-bold">{swarmMission.targetZone}</span></div>
                                                <div>Prioritet: <span className={swarmMission.priority === 'EMERGENCY' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>{swarmMission.priority}</span></div>
                                                <div className="col-span-2 mt-1 italic border-l-2 border-cyan-500/50 pl-2">
                                                    "{swarmMission.triggerReason}"
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Invisible Monsters (Sigma Spy) UI */}
                                    {monsterReport && (
                                        <div className="mt-6 p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] relative overflow-hidden">
                                            <div className="absolute right-[-10px] top-[-10px] opacity-10">
                                                <AlertTriangle className="w-24 h-24 text-rose-500" />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2 mb-4">
                                                <Eye className="w-4 h-4 text-rose-400" />
                                                The Sigma Spy (Cavitation & Erosion Monitor)
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-black/40 border border-rose-500/10 p-3 rounded-lg">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Cavitation (Thoma $\sigma$)</div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="text-xl font-black text-rose-300 font-mono">{monsterReport.cavitation.sigma.toFixed(3)}</div>
                                                        <div className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${monsterReport.cavitation.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                            {monsterReport.cavitation.riskLevel}
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 mt-2 font-mono leading-relaxed">{monsterReport.cavitation.message}</p>
                                                </div>
                                                
                                                <div className="bg-black/40 border border-orange-500/10 p-3 rounded-lg">
                                                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Erosion Rate</div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="text-xl font-black text-orange-300 font-mono">{monsterReport.erosion.estimatedWearRate.toFixed(2)} mm/yr</div>
                                                        <div className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${monsterReport.erosion.riskLevel === 'HIGH' || monsterReport.erosion.riskLevel === 'SEVERE' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                            {monsterReport.erosion.riskLevel}
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 mt-2 font-mono leading-relaxed">{monsterReport.erosion.message}</p>
                                                </div>
                                            </div>
                                            
                                            {monsterReport.recommendations.length > 0 && (
                                                <div className="mt-3 text-[9px] text-rose-200 font-mono italic border-l-2 border-rose-500/50 pl-2">
                                                    <span className="font-bold uppercase mr-1">Action:</span>
                                                    {monsterReport.recommendations[0]}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </GlassCard>

                                {/* Service Notes Findings */}
                                {diagnosis.serviceNotes && diagnosis.serviceNotes.length > 0 && (
                                    <GlassCard className="p-6 border-white/5 bg-slate-900/30">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                                            Ekspertni nalazi i preporuke
                                        </h4>

                                        <div className="space-y-3">
                                            {diagnosis.serviceNotes.map((note, index) => (
                                                <motion.div 
                                                    key={index} 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`p-3 rounded-lg border-l-4 ${
                                                        note.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500 border-white/5' : 
                                                        (note.severity === 'WARNING' ? 'bg-amber-500/5 border-amber-500 border-white/5' : 'bg-blue-500/5 border-blue-500 border-white/5')
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase font-mono">{note.service}</span>
                                                        <span className={`text-[8px] font-black font-mono px-1.5 py-0.5 rounded ${
                                                            note.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
                                                            (note.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
                                                        }`}>{note.severity}</span>
                                                    </div>
                                                    <p className="text-xs text-white mt-1 font-sans">{note.message}</p>
                                                    <div className="mt-2 text-[10px] text-cyan-400 font-mono italic">
                                                        <span className="text-slate-500 uppercase not-italic text-[8px] font-bold mr-1">Rješenje:</span>
                                                        {note.recommendation}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}

                                {/* Recommended Outage and Actions */}
                                {diagnosis.recommendedMaintenance && (
                                    <GlassCard className="p-6 border-white/5 bg-slate-900/30">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Calendar className="w-4 h-4 text-emerald-400" />
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                                                Optimizacija Održavanja & Outage Prozor
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                                <div className="text-[8px] text-slate-500 font-mono uppercase">Preporučeni termin obustave</div>
                                                <div className="text-sm font-bold text-emerald-300 font-mono mt-1">
                                                    {new Date(diagnosis.recommendedMaintenance.outageWindow.start).toLocaleDateString('bs-BA')} - {new Date(diagnosis.recommendedMaintenance.outageWindow.end).toLocaleDateString('bs-BA')}
                                                </div>
                                                <p className="text-[9px] text-slate-500 mt-1 font-mono">Izračunato na osnovu tržišnih cijena i stope rizika komponenti.</p>
                                            </div>

                                            <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                                                <div className="text-[8px] text-slate-500 font-mono uppercase">Paketi održavanja (Bundles)</div>
                                                <div className="text-xs font-mono text-white mt-1.5 space-y-1">
                                                    {diagnosis.recommendedMaintenance.bundles && diagnosis.recommendedMaintenance.bundles.length > 0 ? (
                                                        (diagnosis.recommendedMaintenance.bundles as string[]).map((b, i) => (
                                                            <div key={i} className="flex items-center gap-1.5">
                                                                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                                                                {b}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-slate-500 italic">Nema hitnih grupisanih radova.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )}

                                {/* Suggested interactive training labs */}
                                {suggestedLabs.length > 0 && (
                                    <GlassCard className="p-6 border-white/5 bg-slate-900/30">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center gap-2">
                                            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                                            Preporučeni Inžinjerski Lab Moduli
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mb-4 font-mono">
                                            Pokrenite interaktivne simulacije za dijagnosticirane probleme radi precizne kalibracije i rješavanja:
                                        </p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {suggestedLabs.map((lab, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => navigate(lab.path)}
                                                    className="p-3 bg-slate-950/60 hover:bg-cyan-950/20 border border-slate-800 hover:border-cyan-500/30 text-left rounded-xl group transition-all flex justify-between items-center"
                                                >
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{lab.name}</div>
                                                        <div className="text-[8px] text-slate-500 font-mono uppercase mt-0.5">Pokreni simulaciju ⚡</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}

                                {/* Action Buttons: Work order connector */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleCreateWorkOrder}
                                        className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider font-mono text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Wrench className="w-4 h-4" />
                                        Kreiraj Radni Nalog (Work Order)
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (diagnosis && mappedAsset) {
                                                const gen = new ReportGenerator();
                                                const blob = gen.generateIncidentReport({
                                                    assetName: mappedAsset.name,
                                                    incidentType: 'AI Diagnostic Assessment',
                                                    deviation: 'Health Score: ' + diagnosis.overallHealthScore,
                                                    timestamp: new Date().toISOString(),
                                                    status: diagnosis.criticality
                                                });
                                                gen.downloadReport(blob, `Incident_Report_${mappedAsset.id}.pdf`);
                                            }
                                        }}
                                        disabled={!diagnosis}
                                        className="px-6 py-3.5 bg-rose-600/80 hover:bg-rose-500 border border-rose-500/60 text-white font-bold uppercase tracking-wider font-mono text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Eksportuj Incident Report
                                    </button>
                                    <button
                                        onClick={() => navigate('/knowledge-base/turbine-friend')}
                                        className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white font-bold uppercase tracking-wider font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        SOP Vodič
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
        </div>
    );
};
