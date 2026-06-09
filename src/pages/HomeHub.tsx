import React, { useMemo, useState, useEffect } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Clock, AlertTriangle, Play, ClipboardList, Wrench, Cpu, 
    BookOpen, User, ChevronRight, Activity, Shield, CheckCircle 
} from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { MorningReportGenerator, MorningReport } from '../services/MorningReportGenerator';
import { GlobalHealthDashboard } from '../services/GlobalHealthDashboard';

export const HomeHub: React.FC = () => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Get greeting and shift dynamically
    const shiftInfo = useMemo(() => {
        const hour = currentTime.getHours();
        let greeting = 'Dobro jutro';
        let shift = 'Jutarnja smjena';
        let timeRange = '06:00 - 14:00';
        let icon = '🌅';

        if (hour >= 12 && hour < 18) {
            greeting = 'Dobar dan';
            shift = 'Poslijepodnevna smjena';
            timeRange = '14:00 - 22:00';
            icon = '☀️';
        } else if (hour >= 18 || hour < 6) {
            greeting = 'Dobro veče';
            shift = 'Noćna smjena';
            timeRange = '22:00 - 06:00';
            icon = '🌙';
        }
        return { greeting, shift, timeRange, icon };
    }, [currentTime]);

    // Format date in Bosnian/Croatian/Serbian
    const formattedDate = useMemo(() => {
        return currentTime.toLocaleDateString('bs-BA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [currentTime]);

    // Instantiating static reports using MorningReportGenerator logic
    const morningReportData = useMemo<MorningReport>(() => {
        // Compile mock SCADA snapshot history
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

    // Filter turbines by family
    const francisTurbines = useMemo(() => assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'FRANCIS'), [assets]);
    const peltonTurbines = useMemo(() => assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'PELTON'), [assets]);
    const kaplanTurbines = useMemo(() => assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'KAPLAN'), [assets]);

    // Handle turbine selector card clicks
    const handleSelectFamily = (family: 'FRANCIS' | 'PELTON' | 'KAPLAN') => {
        const familyAssets = assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === family);
        if (familyAssets.length > 0) {
            selectAsset(familyAssets[0].id);
            navigate(`/turbines/${family.toLowerCase()}`);
        }
    };

    // Quick Action handlers
    const actionCards = [
        { title: 'Moj Logbook', desc: 'Evidentiraj smjenu i preglede', path: '/logbook', icon: <ClipboardList className="w-5 h-5 text-amber-400" />, color: 'from-amber-500/20 to-yellow-500/5 hover:border-amber-500/50' },
        { title: 'Detekcija Problema', desc: 'Pokreni AI dijagnostiku', path: '/problems', icon: <Cpu className="w-5 h-5 text-red-400" />, color: 'from-red-500/20 to-rose-500/5 hover:border-red-500/50' },
        { title: 'SOP Priručnici', desc: 'Pretraži operativne protokole', path: '/knowledge-base', icon: <BookOpen className="w-5 h-5 text-cyan-400" />, color: 'from-cyan-500/20 to-blue-500/5 hover:border-cyan-500/50' },
        { title: 'Inžinjerski Alati', desc: 'HPP Builder i proračuni', path: '/hpp-builder', icon: <Wrench className="w-5 h-5 text-purple-400" />, color: 'from-purple-500/20 to-indigo-500/5 hover:border-purple-500/50' },
    ];

    const feedItems = [
        { id: 1, type: 'log', time: 'Prije 1h', operator: 'Ervinstupac', msg: 'Završen rutinski pregled Unit-1 (Francis). Sve u granicama normale.' },
        { id: 2, type: 'alert', time: 'Prije 3h', operator: 'Sistem', msg: 'Upozorenje: Povišena temperatura guide ležišta na Unit-2 (Kaplan): 62.4°C.' },
        { id: 3, type: 'log', time: 'Prije 5h', operator: 'Kenan O.', msg: 'Unesene koordinate centriranja za Pelton mlaznicu Unit-3.' }
    ];

    // Get display name of current user
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Korisnik';
    const roleLabel = userRole || 'GUEST';

    return (
        <div className="space-y-8 animate-fade-in relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
            {/* HERO PANEL: Greeting, Time, & Active Shift */}
            <GlassCard className="relative overflow-hidden border-[#ffffff10] bg-slate-900/40 p-6 md:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-[30%] h-[150%] bg-gradient-to-l from-cyan-500/10 to-transparent blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase border border-cyan-500/20">
                                {roleLabel} CONSOLE
                            </span>
                            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono">
                                NC-9.0 active
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {shiftInfo.icon} {shiftInfo.greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">{userName}</span>
                        </h1>
                        <p className="text-sm text-slate-400 font-mono">
                            {formattedDate}
                        </p>
                    </div>

                    {/* Clock & Shift block */}
                    <div className="flex gap-4 items-center bg-black/30 border border-white/5 rounded-2xl p-4 shadow-inner">
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500 font-black uppercase tracking-wider font-mono">AKTIVNA SMJENA</div>
                            <div className="text-sm font-bold text-white tracking-tight">{shiftInfo.shift}</div>
                            <div className="text-[10px] text-cyan-400 font-mono font-bold">{shiftInfo.timeRange}</div>
                        </div>
                    </div>
                </div>

                {/* Alarm strip banner */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <span className="text-xs font-mono font-black text-red-200 uppercase tracking-wider">
                            Sistemska upozorenja
                        </span>
                    </div>
                    <div className="text-xs text-slate-300 flex-grow">
                        Jedinica 2 (Kaplan): Uočena povišena temperatura ležišta. Preporučuje se uvid u logbook.
                    </div>
                    <button 
                        onClick={() => navigate('/problems')}
                        className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider font-mono flex items-center gap-1"
                    >
                        <span>Detekcija</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </GlassCard>

            {/* THREE-COLUMN GRID: Actions, Feed, Telementry Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. QUICK ACTIONS (Lijeva kolona - 4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-cyan-500" />
                        Brzi akcioni linkovi
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {actionCards.map((card, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(card.path)}
                                className={`w-full text-left p-4 rounded-xl border border-white/5 bg-gradient-to-r ${card.color} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-start gap-4 group`}
                            >
                                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 group-hover:border-cyan-500/30 group-hover:scale-105 transition-all">
                                    {card.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-cyan-300 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-normal">
                                        {card.desc}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. TODAY'S FEED (Srednja kolona - 4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                        <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
                        Dnevni feed aktivnosti
                    </h2>

                    <GlassCard className="p-5 border-white/5 bg-slate-900/30 h-[330px] flex flex-col justify-between overflow-hidden">
                        <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                            {feedItems.map(item => (
                                <div key={item.id} className="text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0 space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="font-bold text-cyan-400 bg-cyan-900/20 px-1.5 py-0.5 rounded">
                                            @{item.operator}
                                        </span>
                                        <span className="text-slate-500">
                                            {item.time}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed font-sans">
                                        {item.msg}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate('/logbook')}
                            className="w-full mt-4 py-2 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white rounded-lg text-xs font-bold font-mono transition-colors uppercase tracking-wider text-center"
                        >
                            Otvori Logbook arhivu
                        </button>
                    </GlassCard>
                </div>

                {/* 3. MACHINE STATUS STRIP (Desna kolona - 4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-red-500" />
                        Statusni strip agregata
                    </h2>

                    <GlassCard className="p-5 border-white/5 bg-slate-900/30 h-[330px] flex flex-col justify-between">
                        <div className="space-y-3.5">
                            {/* Selected Asset Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-tight">
                                        {selectedAsset ? selectedAsset.name : 'Nema odabira'}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-mono uppercase">
                                        {selectedAsset ? `${selectedAsset.turbine_type || selectedAsset.type} TIP` : 'Odaberite turbinu ispod'}
                                    </p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                    selectedAsset?.status === 'Operational' || (selectedAsset?.status as string) === 'ONLINE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                    {selectedAsset ? selectedAsset.status.toUpperCase() : 'N/A'}
                                </span>
                            </div>

                            {/* Telemetry rows */}
                            {selectedAsset ? (
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                        <span className="text-slate-400">Vibracije (ležište)</span>
                                        <span className="font-mono font-bold text-white flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            2.3 mm/s (OK)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                        <span className="text-slate-400">Temp. ležišta</span>
                                        <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            62.4°C (WARN)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                        <span className="text-slate-400">Pritisak ulja HPU</span>
                                        <span className="font-mono font-bold text-white">4.8 bar</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Protok vode</span>
                                        <span className="font-mono font-bold text-white">9.8 m³/s</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-xs text-slate-500 py-12">
                                    Odaberite turbinu ispod za prikaz telemetrijskih podataka.
                                </div>
                            )}
                        </div>

                        {/* Interactive Financial warning snippet from MorningReport */}
                        <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
                                <span>FINANSIJSKI IMPACT</span>
                                <span className="text-red-400 font-bold">DEGRADACIJA</span>
                            </div>
                            <div className="text-xs text-white font-black flex justify-between">
                                <span>Gubitak danas:</span>
                                <span className="text-amber-400 font-mono">
                                    €{morningReportData.metrics.totalMoneyLeakToday.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>

            {/* TURBINE SELECTOR SECTION (Donji dio - 3 premium kartice) */}
            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Turbinski selektor (Ravnopravne jedinice)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Francis Card */}
                    <div 
                        onClick={() => handleSelectFamily('FRANCIS')}
                        className={`cursor-pointer rounded-2xl border bg-slate-900/40 p-6 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group ${
                            selectedAsset?.turbine_type === 'FRANCIS' 
                                ? 'border-[#06b6d4] shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-slate-900/60' 
                                : 'border-white/5 hover:border-[#06b6d4]/50'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-gradient-to-l from-cyan-500/10 to-transparent blur-[30px] pointer-events-none" />
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="text-3xl">🌊</div>
                                <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                                    {francisTurbines.length} Jedinice
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Francis</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Srednji i visoki padovi, radijani tok vode. Dominantni tip u elektrani.
                                </p>
                            </div>
                            <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-bold pt-2 uppercase">
                                <span>Otvori Francis konzolu</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Pelton Card */}
                    <div 
                        onClick={() => handleSelectFamily('PELTON')}
                        className={`cursor-pointer rounded-2xl border bg-slate-900/40 p-6 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group ${
                            selectedAsset?.turbine_type === 'PELTON' 
                                ? 'border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-slate-900/60' 
                                : 'border-white/5 hover:border-[#f59e0b]/50'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-gradient-to-l from-amber-500/10 to-transparent blur-[30px] pointer-events-none" />
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="text-3xl">💧</div>
                                <span className="text-[10px] text-amber-400 font-mono font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                    {peltonTurbines.length} Jedinice
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Pelton</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Visoki padovi i mali protok, tangencijalni rad. Integrisani mlazni sinhronizatori.
                                </p>
                            </div>
                            <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold pt-2 uppercase">
                                <span>Otvori Pelton konzolu</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Kaplan Card */}
                    <div 
                        onClick={() => handleSelectFamily('KAPLAN')}
                        className={`cursor-pointer rounded-2xl border bg-slate-900/40 p-6 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group ${
                            selectedAsset?.turbine_type === 'KAPLAN' 
                                ? 'border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-slate-900/60' 
                                : 'border-white/5 hover:border-[#10b981]/50'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-gradient-to-l from-emerald-500/10 to-transparent blur-[30px] pointer-events-none" />
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="text-3xl">🔄</div>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                    {kaplanTurbines.length} Jedinice
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Kaplan</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Niski padovi i veliki protoci, aksijalni tok. Cam kriva optimizacija.
                                </p>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold pt-2 uppercase">
                                <span>Otvori Kaplan konzolu</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
