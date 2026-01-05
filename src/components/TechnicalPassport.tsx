import React, { useState, useEffect, useMemo } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { PhysicsEngine } from '../services/PhysicsEngine';
import { GlassCard } from './ui/GlassCard';
import { ModernInput } from './ui/ModernInput';
import { ModernButton } from './ui/ModernButton';
import { AssetPassport } from '../types';
import { SentinelKernel } from '../utils/SentinelKernel';
import { useTranslation } from 'react-i18next';
import {
    Thermometer, Activity, Gauge, Zap, Waves, Volume2, Save, Download,
    AlertTriangle, Shield, Settings, History, Droplets, ZapOff, Info, Book, PenTool
} from 'lucide-react';
import { ProfessionalReportEngine } from '../services/ProfessionalReportEngine';
import { ProfileLoader } from '../services/ProfileLoader';
import masterKnowledge from '../knowledge/MasterKnowledgeMap.json';

// --- HERITAGE INSIGHTS KNOWLEDGE BASE ---
const HERITAGE_INSIGHTS: Record<string, { title: string; desc: string }> = {
    // Mechanical
    runout: { title: "The 0.05 mm/m Law", desc: "Alignment exceeding 0.05 mm/m is an ethical failure. Precision anchors structural longevity." },
    bearingClearance: { title: "Cubic Wear Rule", desc: "Doubling clearance increases dynamic impact by factor of 8 (2^3). maintain tight tolerances." },
    axialPlay: { title: "Thrust Management", desc: "Excessive play (>0.15mm) causes hammer-effect on thrust pads during load rejection." },
    governorDeadband: { title: "Frequency Stability", desc: "Deadband > 0.05Hz causes grid oscillation. Keep tight for island-mode stability." },
    runnerGap: { title: "Volumetric Sealing", desc: "Each 0.1mm gap increase loses ~0.5% efficiency. Water must work, not bypass." },
    labyrinthGap: { title: "parasitic Flow", desc: "Worn labyrinths bypass the runner, wasting potential energy directly to the draft tube." },
    lastAlignmentCheck: { title: "Seasonal Drift", desc: "Concrete foundations shift with temperature. Re-align every season transition." },

    // Electrical
    statorInsulation: { title: "Dielectric Health", desc: "Megger < 100MΩ indicates moisture ingress. Dry-out required to prevent flashover." },
    rotorInsulation: { title: "Field Integrity", desc: "Low rotor insulation risks excitation failure. Clean carbon dust regularly." },
    polarizationIndex: { title: "Age vs Moisture", desc: "PI < 2.0 suggests brittle insulation or water absorption. PI < 1.0 is immediate danger." },
    dcBatteryVoltage: { title: "The Last Defense", desc: "During blackout, this voltage fires the emergency lube pump. Critical safety node." },
    lastRelayTest: { title: "Silent Sentinel", desc: "Protection relays must be tested annually. A stuck relay guarantees catastrophic failure." },

    // Auxiliary
    sealLeakageRate: { title: "Run-Dry Risk", desc: "Leakage cools the seal. Zero leakage is dangerous (burning); too much floods the pit." },
    oilViscosity: { title: "Fluid Film Wedge", desc: "Viscosity drops 50% for every 10°C rise. Maintain 46 cSt at 40°C for hydrodynamic lift." },
    oilAge: { title: "Chemical Breakdown", desc: "Oxidized oil becomes acidic, eating white metal bearings from the inside out." },
    lastOilChange: { title: "Fresh Blood", desc: "Change oil before TAN > 0.5. Clean oil extends bearing life by 300%." },
    vibrationSensors: { title: "The Nervous System", desc: "Accelerometers detect faults months before audible failure. Trust the trend." },
    frequencySensors: { title: "Grid Pulse", desc: "Captures islanding events and load rejection spikes." },
    acousticObservation: { title: "The Song of Steel", desc: "Grinding sounds = metal contact. Thumping = draft tube surge. Listen to the machine." },

    // Pressure
    penstock: { title: "Artery Pressure", desc: "Head pressure drives the system. Sudden drops indicate rupture or massive leak." },
    labyrinthFront: { title: "Upper Seal", desc: "High pressure here indicates worn lower labyrinth. Water is bypassing the runner." },
    labyrinthRear: { title: "Thrust Relief", desc: "This pressure pushes up against the rotor weight. Balance is key." },
    spiralCasing: { title: "Containment Vessel", desc: "Hoop stress is highest here. Watch for hairline cracks in the weld seams." },
    draftTube: { title: "Vacuum Recovery", desc: "Negative pressure recovers energy. Loss of vacuum = 5-10% power loss." },

    // Kinematics
    mivOpeningTime: { title: "Hydraulic shock", desc: "Opening too fast causes water hammer in the penstock." },
    mivClosingTime: { title: "Surge Protection", desc: "Closing too fast bursts pipes. Closing too slow overspeeds the generator." },
    distributorCylinderStrokeTime: { title: "Governor Response", desc: "Sluggish cylinders cause grid instability and hunting." },
    bypassType: { title: "Pressure Relief", desc: "Synchronous bypass prevents water hammer during load rejection." }
};

export const TechnicalPassport: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset, activeProfile, updateAsset } = useAssetContext();

    const profile = useMemo(() => activeProfile || (selectedAsset ? ProfileLoader.getProfile(selectedAsset.turbine_type || selectedAsset.type) : undefined), [selectedAsset, activeProfile]);

    // Initial state based on plugin fields or existing data
    const [passportData, setPassportData] = useState<AssetPassport>(selectedAsset?.assetPassport || {
        mechanical: { runout: 0, bearingClearance: 0, axialPlay: 0, governorDeadband: 0, runnerGap: 0, labyrinthGap: 0, lastAlignmentCheck: '' },
        electrical: { statorInsulation: 0, rotorInsulation: 0, polarizationIndex: 0, dcBatteryVoltage: 0, lastRelayTest: '' },
        auxiliary: { sealLeakageRate: 0, oilViscosity: 0, oilAge: 0, lastOilChange: '', vibrationSensors: false, frequencySensors: false, acousticObservation: 'Nominal' },
        pressureProfile: { penstock: 0, labyrinthFront: 0, labyrinthRear: 0, spiralCasing: 0, draftTube: 0 },
        kinematics: { mivOpeningTime: 0, mivClosingTime: 0, distributorCylinderStrokeTime: 0, bypassType: 'Manual' }
    });

    useEffect(() => {
        if (selectedAsset?.assetPassport) {
            setPassportData(selectedAsset.assetPassport);
        }
    }, [selectedAsset]);

    const calculations = useMemo(() => {
        const { runnerGap, labyrinthGap, runout, axialPlay } = passportData.mechanical;
        const { polarizationIndex } = passportData.electrical;
        const { mivClosingTime } = passportData.kinematics;
        const { acousticObservation } = passportData.auxiliary;

        // 1. Volumetric Efficiency Loss (Use Plugin if available)
        let totalLoss = 0;
        if (profile?.math.formulas.calculateVolumetricLoss) {
            totalLoss = profile.math.formulas.calculateVolumetricLoss({ assetPassport: passportData } as any, profile.math.constants);
        } else {
            const runnerLoss = Math.max(0, (runnerGap - 0.5) * 4.5);
            const labLoss = Math.max(0, (labyrinthGap - 0.3) * 6.2);
            totalLoss = parseFloat((runnerLoss + labLoss).toFixed(2));
        }

        // 2. Emergency Shutdown Risk
        let risk: 'Low' | 'Medium' | 'High' = 'Low';
        if (mivClosingTime > 25) risk = 'High';
        else if (mivClosingTime > 18) risk = 'Medium';

        // 3. Mechanical Sound Verdict
        const soundVerdict = SentinelKernel.evaluateAcoustics(acousticObservation || 'Nominal');

        // 4. Insulation Alert
        let insulationAlert = "Insulation status nominal.";
        if (polarizationIndex < 1.5 && polarizationIndex > 0) {
            insulationAlert = "CRITICAL: Winding Deterioration Alert. Polarization Index < 1.5 suggests moisture or contamination.";
        }

        // 5. Bearing Life Impact
        let bearingLifeImpact = "Bearing stability verified.";
        if (runout > 0.08 || axialPlay > 0.15) {
            bearingLifeImpact = `DEGRADED: High Runout (${runout}mm) and Axial Play (${axialPlay}mm) correlate to accelerated bearing wear (projected 25% life reduction).`;
        }

        // 6. Maintenance Urgency & Service Countdown
        // Mock state for urgency calculation (combining Passport data with Identity context)
        const mockState = {
            identity: selectedAsset,
            mechanical: {
                ...passportData.mechanical,
                vibration: selectedAsset?.specs?.vibration || 1.2, // Fallback to spec or nominal
                bearingTemp: selectedAsset?.specs?.bearingTemp || 45,
                insulationResistance: passportData.electrical.statorInsulation,
            }
        };

        const urgencyLevel = PhysicsEngine.calculateMaintenanceUrgency(mockState as any);
        const totalHours = selectedAsset?.totalOperatingHours || 0;
        const hoursSinceOverhaul = selectedAsset?.hoursSinceLastOverhaul || 0;
        const serviceThreshold = (masterKnowledge as any).standardThresholds.goldenStandards.maintenanceCycleHours || 8000;
        const hoursRemaining = Math.max(0, serviceThreshold - hoursSinceOverhaul);
        const countdownPercent = Math.min(100, (hoursSinceOverhaul / serviceThreshold) * 100);

        return {
            volumetricEfficiencyLoss: totalLoss,
            shutdownRisk: risk,
            soundVerdict,
            insulationAlert,
            bearingLifeImpact,
            urgencyLevel,
            hoursRemaining,
            countdownPercent
        };
    }, [passportData, profile, selectedAsset]);

    const handleSave = () => {
        if (!selectedAsset) return;
        updateAsset(selectedAsset.id, { assetPassport: { ...passportData, calculations } });
    };

    const handleGeneratePDF = () => {
        if (!selectedAsset) return;
        ProfessionalReportEngine.generateTechnicalAudit({
            ...selectedAsset,
            assetPassport: { ...passportData, calculations }
        } as any, `PASSPORT-${selectedAsset.id}`);
    };

    const handleChange = (section: string, field: string, value: any) => {
        setPassportData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof AssetPassport] as any),
                [field]: value
            }
        }));
    };

    if (!selectedAsset) return <div className="p-8 text-white">Select an asset to access Technical Passport.</div>;

    const getIcon = (sectionId: string) => {
        switch (sectionId) {
            case 'mechanical': return <Settings className="text-slate-400" />;
            case 'electrical': return <Zap className="text-yellow-400" />;
            case 'auxiliary': return <Droplets className="text-blue-400" />;
            case 'pressureProfile': return <Waves className="text-indigo-400" />;
            case 'kinematics': return <Activity className="text-emerald-400" />;
            case 'maintenance': return <History className="text-purple-400" />;
            default: return <Settings className="text-slate-400" />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 min-h-screen relative overflow-hidden">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}></div>

            <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <Shield className="text-cyan-400 w-8 h-8" />
                        Comprehensive Asset Passport
                    </h1>
                    <p className="text-slate-400 text-sm font-mono mt-1 flex items-center gap-2">
                        <PenTool size={12} className="text-cyan-500" />
                        360° {profile?.type} Technical Matrix // {profile?.subType || 'Asset Portal'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <ModernButton onClick={handleSave} variant="secondary" icon={<Save size={18} />}>
                        Lock Record
                    </ModernButton>
                    <ModernButton onClick={handleGeneratePDF} variant="primary" icon={<Download size={18} />}>
                        Generate 360° Report
                    </ModernButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                {profile?.ui_manifest.passport_sections.map((section) => (
                    <GlassCard key={section.id} title={section.title} icon={getIcon(section.id)}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {section.fields.map((field) => (
                                    <div key={field.id} className="relative group/field">
                                        <ModernInput
                                            label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
                                            type={field.type === 'select' ? undefined : field.type}
                                            as={field.type === 'select' ? 'select' : undefined}
                                            step={field.step}
                                            value={(passportData as any)[section.id]?.[field.id] || ''}
                                            onChange={(e) => handleChange(section.id, field.id, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                            className={field.id === 'draftTube' || field.id === 'acousticObservation' ? 'col-span-2' : ''}
                                        >
                                            {field.options?.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </ModernInput>

                                        {/* Dynamic Heritage Insights Tooltip */}
                                        {HERITAGE_INSIGHTS[field.id] && (
                                            <div className="absolute top-0 right-0 p-1 cursor-help group-hover/field:text-cyan-400 text-slate-600 transition-colors" title="Heritage Insight">
                                                <Info size={14} />
                                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl opacity-0 scale-95 origin-bottom-right group-hover/field:opacity-100 group-hover/field:scale-100 transition-all z-50 pointer-events-none">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Book size={10} className="text-cyan-400" />
                                                        <span className="text-[10px] font-black uppercase text-cyan-400 tracking-tighter">{HERITAGE_INSIGHTS[field.id].title}</span>
                                                    </div>
                                                    <p className="text-[9px] leading-tight text-slate-300 font-medium">
                                                        {HERITAGE_INSIGHTS[field.id].desc}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Specialized Inference UI Blocks */}
                            {section.id === 'mechanical' && (
                                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-red-400 tracking-widest">CEREBRO Inference</p>
                                    <p className="text-slate-200 text-xs italic mt-1">{calculations.bearingLifeImpact}</p>
                                </div>
                            )}
                            {section.id === 'electrical' && (
                                <div className={`p-3 rounded-xl border flex gap-3 ${passportData.electrical.polarizationIndex < 1.5 && passportData.electrical.polarizationIndex > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/5 border-green-500/20'}`}>
                                    {passportData.electrical.polarizationIndex < 1.5 && passportData.electrical.polarizationIndex > 0 ? <ZapOff className="text-red-500" /> : <Zap className="text-green-500" />}
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Insulation Alert</p>
                                        <p className="text-slate-200 text-xs mt-1">{calculations.insulationAlert}</p>
                                    </div>
                                </div>
                            )}
                            {section.id === 'auxiliary' && (
                                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest">Acoustic Verdict</p>
                                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">"{calculations.soundVerdict}"</p>
                                </div>
                            )}
                            {section.id === 'kinematics' && (
                                <div className={`p-3 rounded-xl border ${calculations.shutdownRisk === 'High' ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-white/5'}`}>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Shutdown Risk</p>
                                    <p className={`text-sm font-black mt-1 ${calculations.shutdownRisk === 'High' ? 'text-red-500' : 'text-emerald-400'}`}>{calculations.shutdownRisk.toUpperCase()}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}

                {/* MAINTENANCE URGENCY & SERVICE PREDICTION */}
                <GlassCard title="Maintenance Forecast" icon={<History className="text-purple-400" />}>
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] uppercase font-black text-slate-500">Service Countdown</p>
                                <p className="text-xs font-mono text-cyan-400">{calculations.hoursRemaining}h REMAINING</p>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${calculations.countdownPercent > 90 ? 'bg-red-500' : calculations.countdownPercent > 70 ? 'bg-orange-500' : 'bg-cyan-500'}`}
                                    style={{ width: `${calculations.countdownPercent}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Recommended service interval: 8,000h</p>
                        </div>

                        <div className={`p-4 rounded-2xl border ${calculations.urgencyLevel >= 4 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/50 border-white/5'}`}>
                            <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Maintenance Urgency Level</p>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <div
                                        key={lvl}
                                        className={`h-8 flex-1 rounded-md flex items-center justify-center text-xs font-black transition-all ${lvl <= calculations.urgencyLevel
                                            ? (calculations.urgencyLevel >= 4 ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-amber-500 text-white')
                                            : 'bg-slate-800 text-slate-600'
                                            }`}
                                    >
                                        {lvl}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3 italic">
                                {calculations.urgencyLevel === 5 ? 'IMMEDIATE INTERVENTION REQUIRED' :
                                    calculations.urgencyLevel === 4 ? 'SCHEDULE REVISION IMMEDIATELY' :
                                        calculations.urgencyLevel === 3 ? 'MONITOR CLOSELY - DEGRADATION DETECTED' :
                                            'System operating within nominal parameters'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Starts</p>
                                <p className="text-lg font-black text-white">{selectedAsset.startStopCount || 0}</p>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Hours</p>
                                <p className="text-lg font-black text-white">{selectedAsset.totalOperatingHours || 0}</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* QUICK STATS FOOTER */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Efficiency Loss</p>
                    <p className="text-xl font-bold text-white">{calculations.volumetricEfficiencyLoss}%</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Shaft Integrity</p>
                    <p className={`text-xl font-bold ${passportData.mechanical.runout > 0.08 ? 'text-red-500' : 'text-emerald-400'}`}>{passportData.mechanical.runout} mm</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Insulation PI</p>
                    <p className={`text-xl font-bold ${passportData.electrical.polarizationIndex < 1.5 ? 'text-orange-500' : 'text-white'}`}>{passportData.electrical.polarizationIndex}</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Seal Status</p>
                    <p className="text-xl font-bold text-white">{passportData.auxiliary.sealLeakageRate} ml/min</p>
                </div>
            </div>
        </div>
    );
};
