import React, { useState, useEffect } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { PeltonHub } from './PeltonHub';
import { KaplanHub } from './KaplanHub';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { 
    ChevronRight, Settings, FileText, Activity, ShieldAlert,
    BookOpen, Cpu, Wrench
} from 'lucide-react';

export const TurbineHub: React.FC = () => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'francis' | 'pelton' | 'kaplan'>('francis');

    // Sync tab with route or active selectedAsset
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('pelton')) {
            setActiveTab('pelton');
        } else if (path.includes('kaplan')) {
            setActiveTab('kaplan');
        } else {
            setActiveTab('francis');
        }
    }, [location]);

    const handleTabChange = (tab: 'francis' | 'pelton' | 'kaplan') => {
        setActiveTab(tab);
        const familyAssets = assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === tab.toUpperCase());
        if (familyAssets.length > 0) {
            selectAsset(familyAssets[0].id);
        }
        if (tab === 'francis') {
            navigate('/turbines/francis');
        } else {
            navigate(`/turbines/${tab}`);
        }
    };

    // Filter turbines
    const francisTurbines = assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'FRANCIS');
    const peltonTurbines = assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'PELTON');
    const kaplanTurbines = assets.filter(a => String(a.turbine_type || a.type).toUpperCase() === 'KAPLAN');

    return (
        <div className="space-y-8 w-full px-4 md:px-8 py-8">
            
            {/* Tab Navigation header */}
            <div className="flex border-b border-slate-700 space-x-1 pb-px">
                <button
                    onClick={() => handleTabChange('francis')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest font-mono border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'francis' 
                            ? 'border-slate-400 text-slate-50' 
                            : 'border-transparent text-slate-400 hover:text-slate-50'
                    }`}
                >
                    <span className="text-lg">F</span>
                    <span>Francis Hub</span>
                </button>
                <button
                    onClick={() => handleTabChange('pelton')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest font-mono border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'pelton' 
                            ? 'border-slate-400 text-slate-50' 
                            : 'border-transparent text-slate-400 hover:text-slate-50'
                    }`}
                >
                    <span className="text-lg">P</span>
                    <span>Pelton Hub</span>
                </button>
                <button
                    onClick={() => handleTabChange('kaplan')}
                    className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest font-mono border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'kaplan' 
                            ? 'border-slate-400 text-slate-50' 
                            : 'border-transparent text-slate-400 hover:text-slate-50'
                    }`}
                >
                    <span className="text-lg">K</span>
                    <span>Kaplan Hub</span>
                </button>
            </div>

            {/* Content Switcher */}
            <div className="mt-8">
                <Routes>
                    <Route path="pelton" element={<PeltonHub />} />
                    <Route path="kaplan" element={<KaplanHub />} />
                    <Route path="*" element={
                        <FrancisHubContent 
                            assets={francisTurbines} 
                            selectedAsset={selectedAsset} 
                            selectAsset={selectAsset}
                            navigate={navigate}
                        />
                    } />
                </Routes>
            </div>

        </div>
    );
};

// Internal component for Francis Hub content since Francis has a dedicated Router
interface FrancisHubContentProps {
    assets: any[];
    selectedAsset: any;
    selectAsset: (id: any) => void;
    navigate: any;
}

const FrancisHubContent: React.FC<FrancisHubContentProps> = ({ assets, selectedAsset, selectAsset, navigate }) => {
    
    // Set default asset if not Francis
    useEffect(() => {
        if (assets.length > 0 && (!selectedAsset || String(selectedAsset.turbine_type || selectedAsset.type).toUpperCase() !== 'FRANCIS')) {
            selectAsset(assets[0].id);
        }
    }, [assets, selectedAsset, selectAsset]);

    const activeFrancis = selectedAsset && String(selectedAsset.turbine_type || selectedAsset.type).toUpperCase() === 'FRANCIS' 
        ? selectedAsset 
        : (assets[0] || null);

    return (
        <div className="space-y-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-5 rounded border border-slate-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                            Agregat: Francis Vertical Runner
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            RPM: 500 | RATED: 12.5 MW
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">
                        Francis Turbine Hub
                    </h1>
                    <p className="text-xs text-slate-400 font-sans">
                        Radijalno-aksijalni tok vode, kavitaciona erozija labirintnih zaptivki i stabilnost penstock cjevovoda pod pritiskom.
                    </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    <button
                        onClick={() => navigate('/francis/hub')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-2"
                    >
                        Otvori Francis Twin
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => navigate('/francis/vertical')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded text-xs font-bold uppercase tracking-widest font-mono transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:border-cyan-500/50"
                        >
                            Francis Vertical <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => navigate('/francis/horizontal')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded text-xs font-bold uppercase tracking-widest font-mono transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:border-cyan-500/50"
                        >
                            Francis Horizontal <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Diagnostic Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Labyrinth Clearance</div>
                    <div className="text-sm font-semibold text-slate-200">0.24 mm (Unutar tolerancije)</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Guide Vane Angle</div>
                    <div className="text-sm font-semibold text-slate-200">76.2%</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Water Head (Net)</div>
                    <div className="text-sm font-semibold text-slate-200">150.2 m</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
            </div>

            {/* Main Lab Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* Left Area (Interactive Lab Module) - 2 cols on xl */}
                <div className="xl:col-span-2 space-y-4">
                    <GlassCard className="p-6 border-slate-700 bg-slate-900/30">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            Aktivni Francis agregati u sistemu
                        </h3>
                        
                        <div className="space-y-3">
                            {assets.map(a => (
                                <div 
                                    key={a.id} 
                                    onClick={() => selectAsset(a.id)}
                                    className={`p-4 rounded border transition-all cursor-pointer flex justify-between items-center ${
                                        String(activeFrancis?.id) === String(a.id)
                                            ? 'border-slate-500 bg-slate-800'
                                            : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <div className="text-sm font-semibold text-slate-100 uppercase tracking-tight">{a.name}</div>
                                        <div className="text-[9px] text-slate-500 font-mono uppercase">
                                            Lokacija: {a.location} | Snaga: {a.capacity} MW
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-slate-800 text-slate-200 px-3 py-1 rounded font-mono border border-slate-700">
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Labs for this type */}
                    <GlassCard className="p-6 border-slate-700 bg-slate-900/30">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mb-6 flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-slate-400" />
                            Preporučeni istraživački moduli (Labs)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                onClick={() => navigate('/lab/francis-cavitation')}
                                className="p-4 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded space-y-2 cursor-pointer transition-all"
                            >
                                <div className="text-xs font-semibold text-slate-100 uppercase">Cavitation Profiling Lab</div>
                                <p className="text-[10px] text-slate-400">Analiza kavitacionih vibracija i akustičkog spektra na Francis runneru.</p>
                            </div>
                            <div 
                                onClick={() => navigate('/lab/guide-bearing-clearance')}
                                className="p-4 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded space-y-2 cursor-pointer transition-all"
                            >
                                <div className="text-xs font-semibold text-slate-100 uppercase">Guide Bearing Clearance</div>
                                <p className="text-[10px] text-slate-400">Proračun hidrodinamičkog pritiska i odstupanja zazora kliznih ležajeva.</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Area (SOPs and Technical Details) - 1 col */}
                <div className="space-y-4">
                    {/* SOP Manuals */}
                    <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Relevantni SOP priručnici
                        </h3>

                        <div className="space-y-3">
                            <div 
                                onClick={() => navigate('/francis/sop-water-hammer')}
                                className="p-3 bg-slate-900 border border-slate-700 rounded space-y-1 hover:border-slate-600 transition-all cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-slate-100 uppercase">WATER HAMMER SOP</div>
                                <p className="text-[10px] text-slate-400">Procedura zaštite cjevovoda od vodenog udara kod brzog zatvaranja MIV ventila.</p>
                            </div>
                            <div 
                                onClick={() => navigate('/francis/sop-shaft-alignment')}
                                className="p-3 bg-slate-900 border border-slate-700 rounded space-y-1 hover:border-slate-600 transition-all cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-slate-100 uppercase">SHAFT ALIGNMENT PROCEDURES</div>
                                <p className="text-[10px] text-slate-400">Precizne tolerancije centriranja vratila i poravnanja spojnice (coupling).</p>
                            </div>
                            <div 
                                onClick={() => navigate('/francis/sop-oil-health')}
                                className="p-3 bg-slate-900 border border-slate-700 rounded space-y-1 hover:border-slate-600 transition-all cursor-pointer"
                            >
                                <div className="text-xs font-semibold text-slate-100 uppercase">BEARING OIL HEALTH SOP</div>
                                <p className="text-[10px] text-slate-400">Granične vrijednosti viskoznosti, vode u ulju (ppm) i kiselosti (TAN).</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Safety checklist */}
                    <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            Sigurnosne granice
                        </h3>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between border-b border-slate-700 pb-1.5">
                                <span className="text-slate-400">Dozvoljena vibracija:</span>
                                <span className="text-emerald-400 font-bold">3.5 mm/s</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-1.5">
                                <span className="text-slate-400">Dozvoljena temp. ležaja:</span>
                                <span className="text-slate-200">60.0°C</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Zazor labirinta max:</span>
                                <span className="text-amber-400">0.30 mm</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
