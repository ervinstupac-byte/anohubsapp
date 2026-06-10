import React, { useMemo, useState, useEffect } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Clock, AlertTriangle, ClipboardList, Wrench, Cpu, 
    BookOpen, ChevronRight, Activity, Shield, Zap, 
    BarChart3, Server, Brain
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { MorningReportGenerator, MorningReport } from '../services/MorningReportGenerator';
import { GlobalHealthDashboard } from '../services/GlobalHealthDashboard';

export const HomeHub: React.FC = () => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();
    const { user, userRole } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const shiftInfo = useMemo(() => {
        const hour = currentTime.getHours();
        let greeting = t('greeting.morning', 'Good morning');
        let shift = t('shift.morning', 'Morning Shift');
        let timeRange = '06:00 - 14:00';

        if (hour >= 12 && hour < 18) {
            greeting = t('greeting.afternoon', 'Good afternoon');
            shift = t('shift.afternoon', 'Afternoon Shift');
            timeRange = '14:00 - 22:00';
        } else if (hour >= 18 || hour < 6) {
            greeting = t('greeting.evening', 'Good evening');
            shift = t('shift.night', 'Night Shift');
            timeRange = '22:00 - 06:00';
        }
        return { greeting, shift, timeRange };
    }, [currentTime, t]);

    const formattedDate = useMemo(() => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [currentTime]);

    const morningReportData = useMemo<MorningReport>(() => {
        const mockScadaHistory = [
            {
                timestamp: new Date(),
                plcVoice: {
                    timestamp: new Date(),
                    quality: 'GOOD' as const,
                    turbineRPM: 500,
                    turbinePower: 12500,
                    guideVaneOpening: 76,
                    inletPressure: 15.2,
                    outletPressure: 0.1,
                    flowRate: 9.8,
                    bearingTemps: { guideBearing: 62.4, thrustBearing: 58.2, generatorBearing: 51.5 },
                    oilPressure: 4.8,
                    oilTemperature: 42.1,
                    coolingFlowRate: 150,
                    coolingInletTemp: 12.5,
                    coolingOutletTemp: 18.2
                },
                protectionVoice: {
                    timestamp: new Date(),
                    quality: 'GOOD' as const,
                    generatorFaults: { overcurrent_51: false, differential_87: false, groundFault_64: false, reversepower_32: false },
                    excitationData: { fieldCurrent: 120, fieldVoltage: 80, fieldResistance: 0.67, ratedResistance: 0.65, resistanceDeviation: 3, alarm: false },
                    transformerFaults: { overtemperature: false, bucholzAlarm: false, differentialTrip: false },
                    activeTrips: []
                },
                civilVoice: {
                    timestamp: new Date(),
                    quality: 'GOOD' as const,
                    riverLevel: 142.5,
                    upstreamLevel: 143.1,
                    downstreamLevel: 120.4,
                    reservoirLevel: 145.0,
                    trashRackDeltaP: 120,
                    trashRackUpstreamLevel: 143.1,
                    trashRackDownstreamLevel: 142.9,
                    ambientTemperature: 22.5,
                    waterTemperature: 11.2,
                    sedimentLevel: 15.4,
                    damDeformation: 0.2,
                    foundationSettlement: 0.1,
                    vibrationLevel: 2.3
                },
                overallQuality: 'GOOD' as const
            }
        ];

        const healthDashboard = new GlobalHealthDashboard();
        const generator = new MorningReportGenerator(mockScadaHistory, healthDashboard, []);
        return generator.generateReport();
    }, []);

    const francisTurbines = useMemo(() => assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'FRANCIS'), [assets]);
    const peltonTurbines = useMemo(() => assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'PELTON'), [assets]);
    const kaplanTurbines = useMemo(() => assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'KAPLAN'), [assets]);

    const handleSelectFamily = (family: 'FRANCIS' | 'PELTON' | 'KAPLAN') => {
        const familyAssets = assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === family);
        if (familyAssets.length > 0) {
            selectAsset(familyAssets[0].id);
            navigate(`/turbines/${family.toLowerCase()}`);
        }
    };

    const actionCards = [
        { title: 'Logbook', desc: t('hub.logbookDesc', 'Shift records'), path: '/logbook', icon: <ClipboardList className="w-5 h-5 text-slate-200" />, color: 'from-slate-700/30 to-slate-800/30 hover:border-slate-500/40' },
        { title: t('hub.problemDetection', 'Problem Detection'), desc: t('hub.aiDiagnostics', 'AI Diagnostics'), path: '/problems', icon: <Cpu className="w-5 h-5 text-slate-200" />, color: 'from-slate-700/30 to-slate-800/30 hover:border-slate-500/40' },
        { title: t('hub.sopManuals', 'SOP Manuals'), desc: t('hub.operationalProtocols', 'Operational Protocols'), path: '/knowledge-base', icon: <BookOpen className="w-5 h-5 text-slate-200" />, color: 'from-slate-700/30 to-slate-800/30 hover:border-slate-500/40' },
        { title: t('hub.strategy', 'Strategy'), desc: t('hub.strategicDecisions', 'Strategic Decisions'), path: '/strategic-lab', icon: <Brain className="w-5 h-5 text-slate-200" />, color: 'from-slate-700/30 to-slate-800/30 hover:border-slate-500/40' },
        { title: t('hub.engineeringTools', 'Engineering Tools'), desc: 'HPP Builder', path: '/hpp-builder', icon: <Wrench className="w-5 h-5 text-slate-200" />, color: 'from-slate-700/30 to-slate-800/30 hover:border-slate-500/40' },
    ];

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('hub.guest', 'User');
    const roleLabel = userRole || 'GUEST';

    return (
        <div className="relative min-h-screen">
            {/* Dynamic Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
                style={{ backgroundImage: 'url("/assets/pic.s_Background/main dash.jpg")' }}
            />
            {/* Glassmorphism gradient overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/90 to-[#0a0a0a]" />

            <div className="space-y-8 relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-700/30">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded font-mono font-bold tracking-wider uppercase border border-slate-700">
                            {roleLabel}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">
                        {shiftInfo.greeting}, <span className="text-slate-50">{userName}</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-mono">
                        {formattedDate}
                    </p>
                </div>

                {/* Clock Block */}
                <div className="flex gap-3 items-center bg-slate-900/50 border border-slate-700 rounded p-4">
                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-300">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">{t('hub.shift', 'SHIFT')}</div>
                        <div className="text-sm font-semibold text-slate-100">{shiftInfo.shift}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{shiftInfo.timeRange}</div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Quick Actions & Turbine Selector */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-slate-500" />
                            {t('hub.quickAccess', 'Quick Access')}
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {actionCards.map((card, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ y: -2 }}
                                    onClick={() => navigate(card.path)}
                                    className={`w-full text-left p-4 rounded border border-slate-700 bg-gradient-to-r ${card.color} transition-all duration-200 flex items-center gap-4 group`}
                                >
                                    <div className="p-2.5 bg-slate-900/80 rounded border border-slate-700 group-hover:border-slate-600 transition-all">
                                        {card.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-slate-100">{card.title}</h3>
                                        <p className="text-xs text-slate-400">{card.desc}</p>
                                    </div>
                                    <ChevronRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Machine Status & Telemetry */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                            <Server className="w-3.5 h-3.5 text-slate-500" />
                            {t('hub.assetStatus', 'Asset Status')}
                        </h2>
                        <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-100">
                                            {selectedAsset ? selectedAsset.name : t('hub.selectTurbine', 'Select Turbine')}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-mono uppercase">
                                            {selectedAsset ? `${selectedAsset.turbine_type || selectedAsset.type}` : ''}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                        selectedAsset?.status === 'Operational' || (selectedAsset?.status as string) === 'ONLINE'
                                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-slate-800 text-red-400 border border-red-500/20'
                                    }`}>
                                        {selectedAsset ? selectedAsset.status.toUpperCase() : 'N/A'}
                                    </span>
                                </div>

                                {selectedAsset && (
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center text-xs border-b border-slate-700 pb-2">
                                            <span className="text-slate-400">{t('hub.vibration', 'Vibration')}</span>
                                            <span className="font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                2.3 mm/s
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-b border-slate-700 pb-2">
                                            <span className="text-slate-400">{t('hub.bearingTemp', 'Bearing Temp.')}</span>
                                            <span className="font-mono font-semibold text-amber-400 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                62.4°C
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">{t('hub.flow', 'Flow')}</span>
                                            <span className="font-mono font-semibold text-slate-200">9.8 m³/s</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Analytics Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                            {t('hub.analytics', 'Analytics')}
                        </h2>
                        <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                            <div className="space-y-4">
                                <div className="bg-slate-950/60 rounded p-4 border border-slate-700">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-2">
                                        <span>{t('hub.today', 'TODAY')}</span>
                                        <span className="text-amber-400 font-bold">{t('hub.loss', 'LOSS')}</span>
                                    </div>
                                    <div className="text-xl font-bold text-amber-400 font-mono">
                                        €{morningReportData.metrics.totalMoneyLeakToday.toFixed(2)}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/problems')}
                                    className="w-full py-3 bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 rounded text-xs font-semibold font-mono transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {t('hub.checkWarnings', 'Check Warnings')}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Turbine Selector */}
            <div className="space-y-3 pt-6 border-t border-slate-700/30">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                    {t('hub.turbines', 'Turbines')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectFamily('FRANCIS')}
                        className={`cursor-pointer rounded border bg-slate-900/40 p-5 transition-all duration-200 relative overflow-hidden group ${
                            selectedAsset?.turbine_type === 'FRANCIS' 
                                ? 'border-slate-500 bg-slate-900/60' 
                                : 'border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="text-2xl text-slate-300 font-bold">F</div>
                                <span className="text-[10px] text-slate-300 font-mono font-bold tracking-wider bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                                    {francisTurbines.length}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">Francis</h3>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-semibold">
                                <span>Otvori</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectFamily('PELTON')}
                        className={`cursor-pointer rounded border bg-slate-900/40 p-5 transition-all duration-200 relative overflow-hidden group ${
                            selectedAsset?.turbine_type === 'PELTON' 
                                ? 'border-slate-500 bg-slate-900/60' 
                                : 'border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="text-2xl text-slate-300 font-bold">P</div>
                                <span className="text-[10px] text-slate-300 font-mono font-bold tracking-wider bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                                    {peltonTurbines.length}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">Pelton</h3>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-semibold">
                                <span>Otvori</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectFamily('KAPLAN')}
                        className={`cursor-pointer rounded border bg-slate-900/40 p-5 transition-all duration-200 relative overflow-hidden group ${
                            selectedAsset?.turbine_type === 'KAPLAN' 
                                ? 'border-slate-500 bg-slate-900/60' 
                                : 'border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="text-2xl text-slate-300 font-bold">K</div>
                                <span className="text-[10px] text-slate-300 font-mono font-bold tracking-wider bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                                    {kaplanTurbines.length}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">Kaplan</h3>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-semibold">
                                <span>Otvori</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            </div>
        </div>
    );
};
