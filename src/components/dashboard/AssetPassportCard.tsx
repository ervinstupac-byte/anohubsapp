import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Calendar, Settings, AlertTriangle, Download, Droplets, ArrowUpFromLine, Thermometer, Layers, Clock } from 'lucide-react';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDocumentViewer } from '../../contexts/DocumentContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Decimal } from 'decimal.js';
import { TelemetryDrilldownModal } from './TelemetryDrilldownModal';
// Defer loading the heavy PDF generator until explicitly requested

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
        icon: <Calendar className="w-3 h-3 text-scada-muted" />,
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
            icon: <Thermometer className="w-3 h-3 text-scada-muted" />,
            metricKey: 'babbitt',
            threshold: { warning: limitBabbittAlarm.toNumber(), critical: limitBabbittTrip.toNumber() }
        },
        {
            label: 'Oil TAN',
            value: valOilTAN.toFixed(2),
            rawValue: valOilTAN.toNumber(),
            unit: 'mg KOH/g',
            status: tanStatus,
            icon: <Droplets className="w-3 h-3 text-scada-muted" />,
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
            icon: <ArrowUpFromLine className="w-3 h-3 text-scada-muted" />,
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
            icon: <Settings className="w-3 h-3 text-scada-muted" />,
            metricKey: 'labyrinth',
            threshold: { warning: limitLabyrinth.toNumber() * 0.85, critical: limitLabyrinth.toNumber() }
        }
    ];

    const handleDownloadPassport = async () => {
        pushNotification('INFO', t('toolbox.toast.generatingPassport', { asset: selectedAsset.name }));

        try {
            const numericAssetId = Number(selectedAsset.id);
            const relevantLogs = numericAssetId !== null
                ? assetLogs.filter(log => log.assetId === numericAssetId)
                : assetLogs.filter(log => String(log.assetId) === String(selectedAsset.id));
            const { ForensicReportService } = await import('../../services/ForensicReportService');
            const blob = ForensicReportService.generateAssetPassport({
                asset: selectedAsset,
                logs: relevantLogs,
                t
            });

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
                p-3 rounded-sm bg-scada-bg border relative group
                cursor-pointer transition-all duration-200
                hover:bg-scada-panel hover:shadow-scada-card
                ${field.status === 'critical' ? 'border-status-error/50 bg-status-error/5' :
                    field.status === 'warning' ? 'border-status-warning/50 bg-status-warning/5' :
                        'border-scada-border hover:border-status-info/50'}
            `}
        >
            <div className="flex items-center justify-between mb-1.5">
                <div className="text-[9px] text-scada-muted font-bold uppercase tracking-widest truncate font-mono">
                    {field.label}
                </div>
                <div className={`opacity-50 group-hover:opacity-100 transition-opacity ${field.status !== 'nominal' ? 'animate-pulse' : ''}`}>
                    {field.icon}
                </div>
            </div>

            <div className={`
                text-xl font-mono font-black mb-1 tabular-nums
                ${field.status === 'critical' ? 'text-status-error' :
                    field.status === 'warning' ? 'text-status-warning' :
                        'text-scada-text group-hover:text-status-info transition-colors'}
            `}>
                {field.value}
                {field.unit && <span className="text-[10px] text-scada-muted ml-1 font-sans font-bold lowercase">{field.unit}</span>}
            </div>

            {field.isoRef && (
                <div className="text-[8px] font-mono text-scada-text/60 border-t border-scada-border pt-1 mt-1">
                    REF: <span className="text-scada-muted">{field.isoRef}</span>
                </div>
            )}
        </div>
    );

    return (
        <>
            <div
                className={`
                    relative overflow-hidden bg-scada-panel border rounded-sm shadow-scada-card
                    ${hasWarnings ? 'border-l-4 border-l-status-warning' : 'border-l-4 border-l-status-info'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-scada-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${hasWarnings ? 'bg-status-warning/20' : 'bg-status-info/20'}`}>
                            <FileText className={`w-5 h-5 ${hasWarnings ? 'text-status-warning' : 'text-status-info'}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-scada-text uppercase tracking-wider font-header">
                                {t('dashboard.assetPassport.title')}
                            </h3>
                            <p className="text-[10px] text-scada-muted font-mono">{selectedAsset.name}</p>
                        </div>
                    </div>

                    {hasWarnings && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-status-warning/20 rounded-sm border border-status-warning/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-status-warning" />
                            <span className="text-[9px] font-bold text-status-warning uppercase font-mono">
                                {t('dashboard.assetPassport.toleranceBreach')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Operating Hours & Overhaul Banner */}
                <div className="px-4 pt-3 grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 rounded-sm bg-scada-bg border border-scada-border">
                        <span className="text-[9px] uppercase font-bold text-scada-muted tracking-wider font-mono">
                            {t('dashboard.assetPassport.operatingHours')}
                        </span>
                        <span className="text-sm font-mono font-bold text-scada-text tabular-nums">
                            {valOperatingHours.toNumber().toLocaleString()} <span className="text-[10px] text-scada-muted">hrs</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-sm bg-scada-bg border border-scada-border cursor-pointer hover:border-status-info/30 transition-colors" onClick={() => handleFieldClick(fieldOverhaul)}>
                        <span className="text-[9px] uppercase font-bold text-scada-muted tracking-wider font-mono">
                            Overhaul
                        </span>
                        <span className="text-sm font-mono font-bold text-status-info">
                            {lastOverhaul}
                        </span>
                    </div>
                </div>

                {/* NC-5.4: Temporal Logic - 180-Day Alignment Rule */}
                <div className="px-4 pt-2">
                    <div className="flex items-center justify-between p-2 rounded-sm bg-status-warning/5 border border-status-warning/20">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-status-warning" />
                            <span className="text-[9px] uppercase font-bold text-status-warning tracking-wider font-mono">
                                Laser Alignment Countdown
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-mono font-black text-status-warning tabular-nums">
                                {Math.max(0, 180 - Math.floor((Date.now() - new Date(identity.lastAlignmentDate || '2025-10-01').getTime()) / (1000 * 60 * 60 * 24)))}
                                <span className="text-[10px] ml-1 text-scada-muted font-bold uppercase">Days Left</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* FIELDS GRID (Grouped) */}
                <div className="p-4 grid grid-cols-2 gap-4">
                    {/* Lubrication Group */}
                    <div className="space-y-2">
                        <h4 className="text-[9px] text-scada-muted font-black uppercase tracking-widest pl-1 border-b border-scada-border pb-1 mb-2 font-mono">
                            Lubrication & Bearings
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {lubricationFields.map(renderField)}
                        </div>
                    </div>

                    {/* Mechanical Group */}
                    <div className="space-y-2">
                        <h4 className="text-[9px] text-scada-muted font-black uppercase tracking-widest pl-1 border-b border-scada-border pb-1 mb-2 font-mono">
                            Mechanical Alignment
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {mechanicalFields.map(renderField)}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-scada-border flex gap-2">
                    <ModernButton
                        variant="ghost"
                        className="flex-1 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wide hover:bg-h-purple/10 hover:text-h-purple border-scada-border"
                        onClick={() => navigate('/hpp-builder', { state: { highlightAsset: String(selectedAsset?.id), fromPassport: true } })}
                    >
                        <Layers className="w-4 h-4" />
                        {t('dashboard.assetPassport.viewDesign', 'View Design')}
                    </ModernButton>
                    <ModernButton
                        variant="ghost"
                        className="flex-1 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wide hover:bg-status-info/10 hover:text-status-info border-scada-border"
                        onClick={() => navigate('/hpp-builder')}
                    >
                        <Settings className="w-4 h-4" />
                        {t('dashboard.assetPassport.editSpecs', 'Edit Specs')}
                    </ModernButton>
                    <ModernButton
                        variant="ghost"
                        className={`
                            flex-1 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wide border-scada-border
                            ${hasWarnings ? 'hover:bg-status-warning/10 hover:text-status-warning' : 'hover:bg-status-info/10 hover:text-status-info'}
                        `}
                        onClick={handleDownloadPassport}
                    >
                        <Download className="w-4 h-4" />
                        {t('dashboard.assetPassport.downloadFull')}
                    </ModernButton>
                </div>
            </div>

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
