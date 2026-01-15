import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Calendar, Settings, AlertTriangle, Download, Droplets, ArrowUpFromLine, Thermometer, Layers } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDocumentViewer } from '../../contexts/DocumentContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Decimal } from 'decimal.js';
import { TelemetryDrilldownModal } from './TelemetryDrilldownModal';

/**
 * AssetPassportCard — Quick View Asset Information
 * 
 * Displays critical asset info at a glance:
 * - Last overhaul date
 * - Labyrinth clearance (with tolerance breach alert)
 * - Babbitt metal status (Temp based)
 * - Operating hours
 * - Shaft Lift (if available)
 * 
 * DEEP TELEMETRY: Click any metric to open 30-day trend with maintenance advice.
 */

interface PassportField {
    label: string;
    value: string;
    rawValue: number;
    unit?: string;
    status?: 'nominal' | 'warning' | 'critical';
    isoRef?: string;
    icon?: React.ReactNode;
    metricKey: 'labyrinth' | 'babbitt' | 'shaftLift' | 'oilTan' | 'overhaul';
    threshold: { warning?: number; critical: number };
}

export const AssetPassportCard: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset, assetLogs } = useAssetContext();
    const { mechanical, identity } = useTelemetryStore();
    const { viewDocument } = useDocumentViewer();
    const { pushNotification } = useNotifications();
    const navigate = useNavigate();

    // --- DRILLDOWN STATE ---
    const [drilldownOpen, setDrilldownOpen] = useState(false);
    const [activeDrilldown, setActiveDrilldown] = useState<PassportField | null>(null);
    // SURGICAL FIX 2: Track which field was clicked for visual feedback
    const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);

    if (!selectedAsset) return null;

    // --- Specs & Limits (Fallbacks included) ---
    const specs = (selectedAsset.specs || {}) as Record<string, any>;

    // Limits
    const limitLabyrinth = new Decimal(specs.maxLabyrinthClearance || 0.5);
    const limitBabbittAlarm = new Decimal(specs.babbittTempLimits?.alarm || 65);
    const limitBabbittTrip = new Decimal(specs.babbittTempLimits?.trip || 75);
    const shaftLiftMin = new Decimal(specs.shaftLiftRange?.min || 0.15);
    const shaftLiftMax = new Decimal(specs.shaftLiftRange?.max || 0.35);

    // --- Live Telemetry (Decimal.js) ---
    const valLabyrinth = new Decimal(mechanical.radialClearance || 0);
    const valBearingTemp = new Decimal(mechanical.bearingTemp || 0);
    const valAxialPlay = new Decimal(mechanical.axialPlay || 0);
    const valOperatingHours = new Decimal(specs.totalOperatingHours || identity.totalOperatingHours || 0);
    const valOilTAN = new Decimal(identity.fluidIntelligence?.oilSystem?.tan || 0);

    // --- Breach Logic ---
    const isLabyrinthBreach = valLabyrinth.gt(limitLabyrinth);
    const isLabyrinthWarning = valLabyrinth.gt(limitLabyrinth.mul(0.85));

    let babbittStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
    if (valBearingTemp.gt(limitBabbittTrip)) babbittStatus = 'critical';
    else if (valBearingTemp.gt(limitBabbittAlarm)) babbittStatus = 'warning';

    let tanStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
    if (valOilTAN.gt(0.5)) tanStatus = 'critical';
    else if (valOilTAN.gt(0.4)) tanStatus = 'warning';

    let shaftLiftStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
    if (valAxialPlay.lt(shaftLiftMin) || valAxialPlay.gt(shaftLiftMax)) shaftLiftStatus = 'critical';
    else if (valAxialPlay.lt(shaftLiftMin.mul(1.1)) || valAxialPlay.gt(shaftLiftMax.mul(0.9))) shaftLiftStatus = 'warning';

    const hasWarnings = babbittStatus !== 'nominal' || tanStatus !== 'nominal' || shaftLiftStatus !== 'nominal' || isLabyrinthBreach;

    const lastOverhaul = specs.lastOverhaulDate
        ? new Date(specs.lastOverhaulDate).toLocaleDateString()
        : t('common.unknown', '—');

    // --- Field Data (Now with metricKey and threshold for drilldown) ---
    // --- Field Data ---
    const fieldOverhaul: PassportField = {
        label: t('dashboard.assetPassport.lastOverhaul'),
        value: lastOverhaul,
        rawValue: specs.lastOverhaulDate ? new Date(specs.lastOverhaulDate).getTime() : 0,
        status: 'nominal',
        icon: <Calendar className="w-3 h-3 text-slate-400" />,
        metricKey: 'overhaul',
        threshold: { critical: Date.now() - 365 * 24 * 60 * 60 * 1000 * 5 }
    };

    const lubricationFields: PassportField[] = [
        {
            label: t('dashboard.assetPassport.babbittStatus'),
            value: `${valBearingTemp.toFixed(1)}`,
            unit: '°C',
            rawValue: valBearingTemp.toNumber(),
            status: babbittStatus,
            isoRef: `Lim: ${limitBabbittAlarm}/${limitBabbittTrip}°C`,
            icon: <Thermometer className="w-3 h-3 text-slate-400" />,
            metricKey: 'babbitt',
            threshold: { warning: limitBabbittAlarm.toNumber(), critical: limitBabbittTrip.toNumber() }
        },
        {
            label: 'Oil TAN',
            value: valOilTAN.toFixed(2),
            rawValue: valOilTAN.toNumber(),
            unit: 'mg KOH/g',
            status: tanStatus,
            icon: <Droplets className="w-3 h-3 text-slate-400" />,
            metricKey: 'oilTan',
            threshold: { warning: 0.4, critical: 0.5 }
        }
    ];

    const mechanicalFields: PassportField[] = [
        {
            label: t('dashboard.assetPassport.shaftLift', 'Shaft Lift'),
            value: valAxialPlay.toFixed(2),
            rawValue: valAxialPlay.toNumber(),
            unit: 'mm',
            status: shaftLiftStatus,
            isoRef: `Rng: ${shaftLiftMin}-${shaftLiftMax}`,
            icon: <ArrowUpFromLine className="w-3 h-3 text-slate-400" />,
            metricKey: 'shaftLift',
            threshold: { warning: shaftLiftMax.toNumber() * 0.9, critical: shaftLiftMax.toNumber() }
        },
        {
            label: t('dashboard.assetPassport.labyrinthClearance'),
            value: valLabyrinth.toFixed(2),
            rawValue: valLabyrinth.toNumber(),
            unit: 'mm',
            status: isLabyrinthBreach ? 'critical' : isLabyrinthWarning ? 'warning' : 'nominal',
            isoRef: `Max: ${limitLabyrinth.toFixed(2)} mm`,
            icon: <Settings className="w-3 h-3 text-slate-400" />,
            metricKey: 'labyrinth',
            threshold: { warning: limitLabyrinth.toNumber() * 0.85, critical: limitLabyrinth.toNumber() }
        }
    ];

    const handleDownloadPassport = async () => {
        pushNotification('INFO', t('toolbox.toast.generatingPassport', { asset: selectedAsset.name }));

        try {
            const { generateAssetPassport } = await import('../../utils/pdfGenerator');
            const relevantLogs = assetLogs.filter(log => log.assetId === selectedAsset.id);
            const blob = generateAssetPassport(selectedAsset, relevantLogs, t, true);

            if (blob instanceof Blob) {
                viewDocument(blob, `${selectedAsset.name} Passport`, `Passport_${selectedAsset.name}.pdf`);
            }
        } catch (e) {
            pushNotification('WARNING', 'Failed to generate passport');
        }
    };

    // --- DRILLDOWN HANDLER ---
    const handleFieldClick = (field: PassportField) => {
        setActiveDrilldown(field);
        setDrilldownOpen(true);
    };


    const renderField = (field: PassportField) => (
        <div
            key={field.metricKey}
            onClick={() => handleFieldClick(field)}
            className={`
                p-3 rounded-md bg-[#0D141C] border relative group
                cursor-pointer transition-all duration-200
                hover:translate-y-[-2px] hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]
                ${field.status === 'critical' ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                    field.status === 'warning' ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                        'border-slate-800 hover:border-cyan-500/50'}
            `}
        >
            <div className="flex items-center justify-between mb-1.5">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                    {field.label}
                </div>
                <div className={`opacity-50 group-hover:opacity-100 transition-opacity ${field.status !== 'nominal' ? 'animate-pulse' : ''}`}>
                    {field.icon}
                </div>
            </div>

            <div className={`
                text-xl font-mono font-black mb-1
                ${field.status === 'critical' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                    field.status === 'warning' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                        'text-white group-hover:text-cyan-400 transition-colors'}
            `}>
                {field.value}
                {field.unit && <span className="text-[10px] text-slate-500 ml-1 font-sans font-bold lowercase">{field.unit}</span>}
            </div>

            {field.isoRef && (
                <div className="text-[8px] font-mono text-slate-600 border-t border-white/5 pt-1 mt-1">
                    REF: <span className="text-slate-500">{field.isoRef}</span>
                </div>
            )}
        </div>
    );

    return (
        <>
            <GlassCard
                className={`
                    relative overflow-hidden
                    ${hasWarnings ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-cyan-500'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasWarnings ? 'bg-amber-500/20' : 'bg-cyan-500/20'}`}>
                            <FileText className={`w-5 h-5 ${hasWarnings ? 'text-amber-400' : 'text-cyan-400'}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {t('dashboard.assetPassport.title')}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono">{selectedAsset.name}</p>
                        </div>
                    </div>

                    {hasWarnings && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/20 rounded border border-amber-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span className="text-[9px] font-bold text-amber-400 uppercase">
                                {t('dashboard.assetPassport.toleranceBreach')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Operating Hours & Overhaul Banner */}
                <div className="px-4 pt-3 grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-white/5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                            {t('dashboard.assetPassport.operatingHours')}
                        </span>
                        <span className="text-sm font-mono font-bold text-white">
                            {valOperatingHours.toNumber().toLocaleString()} <span className="text-[10px] text-slate-500">hrs</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-white/5" onClick={() => handleFieldClick(fieldOverhaul)}>
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                            Overhaul
                        </span>
                        <span className="text-sm font-mono font-bold text-cyan-400 cursor-pointer">
                            {lastOverhaul}
                        </span>
                    </div>
                </div>

                {/* FIELDS GRID (Grouped) */}
                <div className="p-4 grid grid-cols-2 gap-4">
                    {/* Lubrication Group */}
                    <div className="space-y-2">
                        <h4 className="text-[9px] text-slate-600 font-black uppercase tracking-widest pl-1 border-b border-slate-800 pb-1 mb-2">
                            Lubrication & Bearings
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {lubricationFields.map(renderField)}
                        </div>
                    </div>

                    {/* Mechanical Group */}
                    <div className="space-y-2">
                        <h4 className="text-[9px] text-slate-600 font-black uppercase tracking-widest pl-1 border-b border-slate-800 pb-1 mb-2">
                            Mechanical Alignment
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {mechanicalFields.map(renderField)}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 flex gap-2">
                    <ModernButton
                        variant="ghost"
                        className="flex-1 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wide hover:bg-purple-500/10 hover:text-purple-400"
                        onClick={() => navigate('/hpp-builder', { state: { highlightAsset: selectedAsset?.id, fromPassport: true } })}
                    >
                        <Layers className="w-4 h-4" />
                        {t('dashboard.assetPassport.viewDesign', 'View Design')}
                    </ModernButton>
                    <ModernButton
                        variant="ghost"
                        className="flex-1 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wide hover:bg-cyan-500/10 hover:text-cyan-400"
                        onClick={() => navigate('/hpp-builder')}
                    >
                        <Settings className="w-4 h-4" />
                        {t('dashboard.assetPassport.editSpecs', 'Edit Specs')}
                    </ModernButton>
                    <ModernButton
                        variant="ghost"
                        className={`
                            flex-1 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wide
                            ${hasWarnings ? 'hover:bg-amber-500/10 hover:text-amber-400' : 'hover:bg-cyan-500/10 hover:text-cyan-400'}
                        `}
                        onClick={handleDownloadPassport}
                    >
                        <Download className="w-4 h-4" />
                        {t('dashboard.assetPassport.downloadFull')}
                    </ModernButton>
                </div>
            </GlassCard>

            {/* DEEP TELEMETRY DRILLDOWN MODAL */}
            {activeDrilldown && (
                <TelemetryDrilldownModal
                    isOpen={drilldownOpen}
                    onClose={() => {
                        setDrilldownOpen(false);
                        setActiveDrilldown(null);
                    }}
                    metricKey={activeDrilldown.metricKey}
                    metricLabel={activeDrilldown.label}
                    currentValue={activeDrilldown.rawValue}
                    threshold={activeDrilldown.threshold}
                    unit={activeDrilldown.unit || ''}
                    status={activeDrilldown.status || 'nominal'}
                />
            )}
        </>
    );
};
