import React, { useState, useEffect, useMemo } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { AssetPassport } from '../types';
import { useTranslation } from 'react-i18next';
import {
    Thermometer, Activity, Gauge, Zap, Waves, Volume2, Save, Download,
    AlertTriangle, Shield, Settings, History, Droplets, ZapOff, Info, Book, PenTool
} from 'lucide-react';
import { ProfileLoader } from '../services/ProfileLoader';
import { mapAssetToEnhancedAsset } from '../utils/assetMapper';

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

    // Use mapAssetToEnhancedAsset to get consistent enhanced data
    const enhancedAsset = useMemo(() => selectedAsset ? mapAssetToEnhancedAsset(selectedAsset) : null, [selectedAsset]);
    
    const profile = useMemo(() => activeProfile || (enhancedAsset ? ProfileLoader.getProfile(enhancedAsset.turbine_family) : undefined), [enhancedAsset, activeProfile]);

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
        if (runout > 0.1 || axialPlay > 0.25 || (acousticObservation as string) === 'Grinding') risk = 'High';
        else if (runout > 0.05 || polarizationIndex < 1.5) risk = 'Medium';

        // 3. Surge Safety
        const isSurgeSafe = mivClosingTime > 45 && mivClosingTime < 120; // Generic rule if no profile

        return { totalLoss, risk, isSurgeSafe };
    }, [passportData, profile]);

    if (!selectedAsset) return (
        <div className="flex items-center justify-center h-full text-slate-500 font-mono">
            SELECT ASSET TO VIEW PASSPORT
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <GlassCard className="p-6 border-cyan-500/30">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <Book className="w-6 h-6 text-cyan-400" />
                            Technical Passport
                        </h1>
                        <p className="text-cyan-200 text-xs font-mono mt-1">
                            {selectedAsset.name} • {String(selectedAsset.id).toUpperCase()} • {profile?.type || 'GENERIC'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                        <button 
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => updateAsset(selectedAsset.id, { assetPassport: passportData })}
                        >
                            <Save className="w-4 h-4" />
                            Save Revisions
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Volumetric Loss</div>
                        <div className={`text-2xl font-black ${calculations.totalLoss > 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {calculations.totalLoss}%
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Shutdown Risk</div>
                        <div className={`text-2xl font-black ${calculations.risk === 'High' ? 'text-red-500' : calculations.risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {calculations.risk.toUpperCase()}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Surge Protection</div>
                        <div className={`text-2xl font-black ${calculations.isSurgeSafe ? 'text-cyan-400' : 'text-red-400'}`}>
                            {calculations.isSurgeSafe ? 'OPTIMAL' : 'UNSAFE'}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Input Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mechanical */}
                <GlassCard className="p-6 border-blue-500/20">
                    <h3 className="text-blue-400 font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Mechanical Integrity
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(passportData.mechanical).map(([key, val]) => (
                            <div key={key} className="group">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <Info className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 cursor-help" />
                                </div>
                                <input 
                                    type={typeof val === 'number' ? 'number' : 'text'}
                                    value={val}
                                    onChange={(e) => setPassportData(prev => ({
                                        ...prev,
                                        mechanical: { ...prev.mechanical, [key]: typeof val === 'number' ? parseFloat(e.target.value) : e.target.value }
                                    }))}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono"
                                />
                                {HERITAGE_INSIGHTS[key] && (
                                    <div className="hidden group-hover:block mt-2 p-2 bg-blue-900/20 border border-blue-500/20 rounded text-[10px] text-blue-200">
                                        <span className="font-bold block mb-0.5">{HERITAGE_INSIGHTS[key].title}</span>
                                        {HERITAGE_INSIGHTS[key].desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Electrical */}
                <GlassCard className="p-6 border-amber-500/20">
                    <h3 className="text-amber-400 font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Electrical Health
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(passportData.electrical).map(([key, val]) => (
                            <div key={key} className="group">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}</label>
                                </div>
                                <input 
                                    type={typeof val === 'number' ? 'number' : 'text'}
                                    value={val}
                                    onChange={(e) => setPassportData(prev => ({
                                        ...prev,
                                        electrical: { ...prev.electrical, [key]: typeof val === 'number' ? parseFloat(e.target.value) : e.target.value }
                                    }))}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded p-2 text-sm text-white focus:border-amber-500 outline-none transition-colors font-mono"
                                />
                                {HERITAGE_INSIGHTS[key] && (
                                    <div className="hidden group-hover:block mt-2 p-2 bg-amber-900/20 border border-amber-500/20 rounded text-[10px] text-amber-200">
                                        <span className="font-bold block mb-0.5">{HERITAGE_INSIGHTS[key].title}</span>
                                        {HERITAGE_INSIGHTS[key].desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Hydraulics & Pressure */}
                <GlassCard className="p-6 border-cyan-500/20">
                    <h3 className="text-cyan-400 font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <Droplets className="w-4 h-4" /> Pressure Profile
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(passportData.pressureProfile).map(([key, val]) => (
                            <div key={key} className="group">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}</label>
                                </div>
                                <input 
                                    type="number"
                                    value={val}
                                    onChange={(e) => setPassportData(prev => ({
                                        ...prev,
                                        pressureProfile: { ...prev.pressureProfile, [key]: parseFloat(e.target.value) }
                                    }))}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors font-mono"
                                />
                                {HERITAGE_INSIGHTS[key] && (
                                    <div className="hidden group-hover:block mt-2 p-2 bg-cyan-900/20 border border-cyan-500/20 rounded text-[10px] text-cyan-200">
                                        <span className="font-bold block mb-0.5">{HERITAGE_INSIGHTS[key].title}</span>
                                        {HERITAGE_INSIGHTS[key].desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Kinematics */}
                <GlassCard className="p-6 border-purple-500/20">
                    <h3 className="text-purple-400 font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Kinematics & Timing
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(passportData.kinematics).map(([key, val]) => (
                            <div key={key} className="group">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}</label>
                                </div>
                                <input 
                                    type={typeof val === 'number' ? 'number' : 'text'}
                                    value={val}
                                    onChange={(e) => setPassportData(prev => ({
                                        ...prev,
                                        kinematics: { ...prev.kinematics, [key]: typeof val === 'number' ? parseFloat(e.target.value) : e.target.value }
                                    }))}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none transition-colors font-mono"
                                />
                                {HERITAGE_INSIGHTS[key] && (
                                    <div className="hidden group-hover:block mt-2 p-2 bg-purple-900/20 border border-purple-500/20 rounded text-[10px] text-purple-200">
                                        <span className="font-bold block mb-0.5">{HERITAGE_INSIGHTS[key].title}</span>
                                        {HERITAGE_INSIGHTS[key].desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
