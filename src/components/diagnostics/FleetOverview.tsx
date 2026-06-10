import React from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useTranslation } from 'react-i18next';
import { TrashRackRobot } from '../../services/TrashRackRobot';
import { Settings, Droplets, FileDown } from 'lucide-react';
import { ReportGenerator } from '../../features/reporting/ReportGenerator';

interface FleetOverviewProps {
    onToggleMap: () => void;
    showMap: boolean;
    onRegisterAsset: () => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = React.memo(({ onToggleMap, showMap, onRegisterAsset }) => {
    const { assets, selectedAsset, selectAsset } = useAssetContext();
    const { t } = useTranslation();
    
    const [trashRackStatus, setTrashRackStatus] = React.useState<{ shouldClean: boolean; reason: string } | null>(null);
    const [optimalSchedule, setOptimalSchedule] = React.useState<{ recommendedTime: number; marketPrice: number; savings: number }[]>([]);

    React.useEffect(() => {
        TrashRackRobot.checkCleaningTrigger(0.6, 50).then(res => {
            setTrashRackStatus(res);
            setOptimalSchedule(TrashRackRobot.getOptimalCleaningSchedule(0.6));
        });
    }, []);

    return (
        <div className="p-3 sm:p-4 border-b border-black/10 bg-black/5 text-slate-800">
            <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-slate-600 truncate">{t('sidebar.fleetOverview')}</h3>
                <button
                    onClick={onToggleMap}
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded border transition-colors whitespace-nowrap ${showMap ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm' : 'bg-black/10 text-slate-700 border-black/10 hover:bg-white/20 hover:text-black'}`}
                >
                    {showMap ? 'HIDE MAP' : 'GLOBAL MAP'}
                </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {assets.map(asset => (
                    <div key={asset.id} className="flex flex-col gap-1">
                        <button
                            onClick={() => selectAsset(asset.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden
                                ${selectedAsset?.id === asset.id
                                    ? 'bg-white/40 border border-cyan-600/30 text-black shadow-sm'
                                    : 'hover:bg-white/20 border border-transparent text-slate-700'}
                            `}
                        >
                            {/* Status Dot */}
                            <div className={`
                                w-2 h-2 rounded-full shrink-0
                                 ${asset.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                                    asset.status === 'Warning' || asset.status === 'Maintenance' ? 'bg-amber-400' :
                                        'bg-emerald-500'}
                             `}></div>

                            {/* Asset Name + Waveform */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-[11px] font-black uppercase truncate text-left tracking-wider">
                                    {asset.name}
                                </span>
                                <div className="flex items-end gap-0.5 h-3 overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div
                                            key={i}
                                            className="w-[2px] bg-cyan-600 animate-wave"
                                            style={{
                                                height: `${40 + Math.random() * 60}%`,
                                                animationDelay: `${i * 0.15}s`,
                                                animationDuration: `${0.8 + Math.random()}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {selectedAsset?.id === asset.id && (
                                <span className="text-[10px] text-cyan-600 animate-pulse">▶</span>
                            )}
                        </button>

                        {/* METRIC GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-3 mb-1">
                            {/* ALGN First for mobile compliance */}
                            <div className="flex items-center justify-between md:justify-start md:gap-2 px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 order-1">
                                <span className="text-[8px] font-mono text-amber-700 font-bold uppercase">ALGN</span>
                                <span className="text-[9px] font-mono font-bold text-amber-800">0.02 mm/m</span>
                            </div>
                            <div className="flex items-center justify-between md:justify-start md:gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 order-2">
                                <span className="text-[8px] font-mono text-emerald-700 font-bold uppercase">VIB</span>
                                <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase">1.2 mm/s</span>
                            </div>
                            <div className="flex items-center justify-between md:justify-start md:gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 order-3">
                                <span className="text-[8px] font-mono text-emerald-700 font-bold uppercase">TEMP</span>
                                <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase">42.4°C</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trash Rack Robot Status */}
            <div className="mt-4 mb-2 p-3 bg-white/40 border border-cyan-600/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-cyan-800">
                        <Droplets className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Auto-Clean (Trash Rack)</span>
                    </div>
                    {trashRackStatus?.shouldClean ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                </div>
                <div className="text-[9px] font-mono text-slate-600 mb-2 leading-relaxed">
                    {trashRackStatus?.reason || 'Checking DP thresholds...'}
                </div>
                {optimalSchedule.length > 0 && (
                    <div className="space-y-1 mt-2 border-t border-cyan-600/10 pt-2">
                        <div className="text-[8px] font-bold text-cyan-800 uppercase">Optimal Window (Price Match):</div>
                        {optimalSchedule.slice(0, 1).map((opt, i) => (
                            <div key={i} className="flex justify-between items-center text-[9px] font-mono">
                                <span>{new Date(opt.recommendedTime).toLocaleTimeString('bs-BA', {hour: '2-digit', minute:'2-digit'})}</span>
                                <span className="text-emerald-700 font-bold">€{opt.marketPrice.toFixed(2)}/MWh</span>
                                <span className="text-emerald-600">(Save €{opt.savings.toFixed(1)})</span>
                            </div>
                        ))}
                        <button className="w-full mt-1.5 py-1 bg-cyan-600 text-white text-[9px] font-bold uppercase rounded hover:bg-cyan-700 transition-colors">
                            Approve Schedule
                        </button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
                <button
                    onClick={onRegisterAsset}
                    className="flex-1 py-2 px-2 flex items-center justify-center gap-1 sm:gap-2 border border-dashed border-black/25 rounded text-[9px] sm:text-[10px] font-bold text-slate-600 hover:text-cyan-600 hover:border-cyan-500 hover:bg-white/20 transition-all uppercase tracking-wider"
                >
                    <span className="text-sm">+</span>
                    <span className="hidden xs:inline">Register New Plant</span>
                    <span className="xs:hidden">New Plant</span>
                </button>
                <button
                    onClick={() => {
                        const gen = new ReportGenerator();
                        const blob = gen.generateExecutiveBriefing({
                            fleetHealth: 88.5,
                            totalMoneyAtRisk: 1450000,
                            reports: assets.map(a => ({
                                assetName: a.name,
                                score: a.status === 'Critical' ? 45 : (a.status === 'Warning' ? 72 : 95),
                                efficiency: a.status === 'Critical' ? 68 : (a.status === 'Warning' ? 84 : 92),
                                risk: a.status === 'Critical' ? 450000 : (a.status === 'Warning' ? 120000 : 0),
                                readiness: a.status === 'Critical' ? 'COMPROMISED' : (a.status === 'Warning' ? 'DEGRADED' : 'OPTIMAL')
                            })),
                            integrityHash: Math.random().toString(36).substring(2, 15).toUpperCase()
                        });
                        gen.downloadReport(blob, `Executive_Briefing_${new Date().toISOString().split('T')[0]}.pdf`);
                    }}
                    className="flex-1 py-2 px-2 flex items-center justify-center gap-1 sm:gap-2 border border-black/10 bg-cyan-600 text-white rounded text-[9px] sm:text-[10px] font-bold hover:bg-cyan-500 transition-all uppercase tracking-wider"
                    title="Generate PDF Fleet Report"
                >
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Fleet Briefing</span>
                    <span className="xs:hidden">Briefing</span>
                </button>
            </div>
        </div>
    );
});
