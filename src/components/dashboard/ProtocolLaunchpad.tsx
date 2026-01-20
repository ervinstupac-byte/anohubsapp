import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, Lock, Download, ClipboardCheck } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { useAssetContext } from '../../contexts/AssetContext';
import { idAdapter } from '../../utils/idAdapter';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useSyncWatcher } from '../../hooks/useSyncWatcher';
import { useDocumentViewer } from '../../contexts/DocumentContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { LocalLedger } from '../../services/LocalLedger';
import { SyncBadge } from './SyncBadge';
import { useProtocolHistoryStore } from '../../stores/ProtocolHistoryStore';
import { FieldAuditForm } from './FieldAuditForm';
import { ForensicReportService } from '../../services/ForensicReportService';
import reportService from '../../services/reportService';

/**
 * ProtocolLaunchpad — The Report Engine
 * 
 * Displays available measurement protocols and enables one-click PDF generation.
 * CRITICAL: PDF generation is blocked if sync status shows unsynced data.
 */

interface Protocol {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    generator: 'audit' | 'diagnostic';
    dataSource: string;
}

const PROTOCOLS: Protocol[] = [
    {
        id: 'shaft-alignment',
        name: 'Shaft Alignment',
        description: 'Precision laser alignment verification',
        icon: <ClipboardCheck className="w-5 h-5" />,
        route: '/maintenance/shaft-alignment',
        generator: 'audit',
        dataSource: 'mechanical.alignment'
    },
    {
        id: 'bolt-torque',
        name: 'Bolt Torque',
        description: 'Tension & elongation protocol',
        icon: <ClipboardCheck className="w-5 h-5" />,
        route: '/maintenance/bolt-torque',
        generator: 'audit',
        dataSource: 'mechanical.boltSpecs'
    },
    {
        id: 'vibration-check',
        name: 'Vibration Check',
        description: 'ISO 10816 spectral analysis',
        icon: <ClipboardCheck className="w-5 h-5" />,
        route: '/francis/diagnostics',
        generator: 'diagnostic',
        dataSource: 'mechanical.vibration'
    }
];

export const ProtocolLaunchpad: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const { mechanical, diagnosis } = useTelemetryStore();
    const { hasPendingData, pendingCount, syncStatus, isOnline } = useSyncWatcher();
    const { viewDocument } = useDocumentViewer();
    const { pushNotification } = useNotifications();
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const { addEntry: logProtocol } = useProtocolHistoryStore();
    const [fieldAuditOpen, setFieldAuditOpen] = useState(false);

    // View Last Audit handler
    const handleViewLastAudit = () => {
        if (!selectedAsset) return;

        // Find most recent audit in localStorage
        const auditKeys = Object.keys(localStorage).filter(k => k.startsWith('field_audit_'));
        if (auditKeys.length === 0) {
            pushNotification('WARNING', 'No field audits found');
            return;
        }

        // Get latest audit
        const latestKey = auditKeys.sort().reverse()[0];
        const auditData = JSON.parse(localStorage.getItem(latestKey) || '{}');

        if (!auditData.timestamp) {
            pushNotification('WARNING', 'Invalid audit data');
            return;
        }

        // Generate PDF
        const blob = ForensicReportService.generateFieldAuditReport({ auditData, t });
        ForensicReportService.openAndDownloadBlob(blob, `Audit_Report_${selectedAsset.name}_${Date.now()}.pdf`, true);
        pushNotification('INFO', 'Executive audit report downloaded');
    };

    // Check which protocols have data available
    const protocolStatus = useMemo(() => {
        const mechanicalData = mechanical as Record<string, any>;

        return PROTOCOLS.map(protocol => {
            const pathParts = protocol.dataSource.split('.');
            let hasData = false;
            let value: any = mechanicalData;

            for (const part of pathParts.slice(1)) { // Skip 'mechanical' prefix
                if (value && typeof value === 'object') {
                    value = value[part];
                    hasData = value !== undefined && value !== null;
                }
            }

            return {
                ...protocol,
                hasData,
                canGenerate: hasData && (!hasPendingData || syncStatus === 'IDLE')
            };
        });
    }, [mechanical, hasPendingData, syncStatus]);

    const handleGenerateReport = async (protocol: Protocol) => {
        if (!selectedAsset) return;

        // Integrity check: Block if there's pending data
        if (hasPendingData) {
            pushNotification(
                'WARNING',
                t('dashboard.syncFirst')
            );
            return;
        }

        setGeneratingId(protocol.id);

        try {
            // 1. Create Ledger Entry FIRST to get authenticity UUID
            const numericAssetId = idAdapter.toNumber(selectedAsset.id) ?? 0;
            const storageAssetId = idAdapter.toStorage(selectedAsset.id);
            // Use numeric asset id for ledger payload to match historical ledger shape
            const entry = LocalLedger.createEntry({
                type: 'REPORT_GENERATED',
                protocol: protocol.id,
                protocolName: protocol.name,
                assetId: numericAssetId,
                timestamp: Date.now()
            }, 'PROTOCOL');

            if (protocol.generator === 'audit') {
                const blob = ForensicReportService.generateAuditReport({
                    contextTitle: `${selectedAsset.name} - ${protocol.name}`,
                    slogan: `Protocol completed on ${new Date().toLocaleDateString()}`,
                    metrics: [{ label: 'Protocol', value: protocol.name }],
                    diagnostics: diagnosis ? [{ type: 'info', message: (diagnosis as any).summary || 'No diagnosis' }] : [],
                    logs: [],
                    physicsData: [],
                    engineerName: 'Field Engineer',
                    t,
                    ledgerId: entry.uuid
                });

                if (blob instanceof Blob) {
                    const filename = `${protocol.id}_${selectedAsset.name}.pdf`;
                    viewDocument(blob, `${protocol.name} Report`, filename);
                    // Persist a minimal report record (fire-and-forget)
                    reportService.saveReport({
                        assetId: idAdapter.toDb(selectedAsset.id),
                        reportType: 'PROTOCOL_REPORT',
                        pdfPath: filename,
                        metadata: { protocolId: protocol.id, ledgerId: entry.uuid }
                    }).catch((e:any) => console.warn('ProtocolLaunchpad.saveReport failed:', e?.message || e));
                }
            } else {
                const blob = ForensicReportService.generateDiagnosticDossier({
                    caseId: `DIAG-${Date.now().toString(36).toUpperCase()}`,
                    insight: diagnosis || { summary: 'Manual vibration check' },
                    engineerName: 'Field Engineer',
                    snapshotImage: null,
                    t,
                    ledgerId: entry.uuid
                });

                if (blob instanceof Blob) {
                    const filename = `diagnostic_${selectedAsset.name}.pdf`;
                    viewDocument(blob, `${protocol.name} Dossier`, filename);
                    reportService.saveReport({
                        assetId: idAdapter.toDb(selectedAsset.id),
                        reportType: 'PROTOCOL_DIAGNOSTIC',
                        pdfPath: filename,
                        metadata: { protocolId: protocol.id, ledgerId: entry.uuid }
                    }).catch((e:any) => console.warn('ProtocolLaunchpad.saveReport failed:', e?.message || e));
                }
            }

            pushNotification('INFO', `${protocol.name} report generated successfully`);

            // NEW: Log to ProtocolHistoryStore for Executive Dashboard event markers
            logProtocol({
                protocolId: protocol.id,
                protocolName: protocol.name,
                assetId: numericAssetId,
                assetName: selectedAsset.name,
                type: 'protocol',
                ledgerUUID: entry.uuid
            });

        } catch (e) {
            pushNotification('WARNING', `Failed to generate ${protocol.name} report`);
        } finally {
            setGeneratingId(null);
        }
    };

    if (!selectedAsset) return null;

    return (
        <>
            <GlassCard className="relative overflow-hidden border-l-4 border-l-emerald-500">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                {t('dashboard.protocolLaunchpad.title')}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono">
                                One-click field reports
                            </p>
                        </div>
                    </div>

                    {/* Sync Status Badge + Field Audit Buttons */}
                    <div className="flex items-center gap-2">
                        <ModernButton
                            variant="ghost"
                            onClick={handleViewLastAudit}
                            className="text-[10px] px-2 py-1.5 font-bold uppercase tracking-wider hover:bg-emerald-500/10 hover:text-emerald-400"
                        >
                            View Last Audit
                        </ModernButton>
                        <ModernButton
                            variant="primary"
                            onClick={() => setFieldAuditOpen(true)}
                            className="text-[10px] px-3 py-1.5 font-bold uppercase tracking-wider"
                        >
                            New Field Audit
                        </ModernButton>
                        <SyncBadge showLabel={false} />
                    </div>
                </div>

                {/* Sync Warning Banner */}
                {hasPendingData && (
                    <div className="mx-4 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 animate-pulse">
                        <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping absolute top-1 left-1 opacity-75" />
                            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500">
                                <Lock className="w-3 h-3 text-amber-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                Syncing Data...
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                                {pendingCount} items pending upload
                            </p>
                        </div>
                    </div>
                )}

                {/* Protocols List */}
                <div className="p-4 space-y-3">
                    {protocolStatus.map((protocol) => (
                        <div
                            key={protocol.id}
                            className={`
                            p-4 rounded-xl border transition-all
                            ${protocol.hasData
                                    ? 'bg-slate-900/50 border-white/10 hover:border-emerald-500/30'
                                    : 'bg-slate-900/30 border-white/5 opacity-60'}
                        `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center
                                    ${protocol.hasData ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}
                                `}>
                                        {protocol.hasData ? <CheckCircle className="w-4 h-4" /> : protocol.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{protocol.name}</p>
                                        <p className="text-[10px] text-slate-500">{protocol.description}</p>
                                    </div>
                                </div>

                                <ModernButton
                                    variant={protocol.canGenerate ? 'primary' : 'ghost'}
                                    disabled={!protocol.canGenerate || generatingId === protocol.id}
                                    onClick={() => handleGenerateReport(protocol)}
                                    className="text-sm px-4 py-2"
                                >
                                    {generatingId === protocol.id ? (
                                        <span className="animate-pulse">Generating...</span>
                                    ) : hasPendingData ? (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            {t('dashboard.protocolLaunchpad.generatePdf')}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            {t('dashboard.protocolLaunchpad.generatePdf')}
                                        </>
                                    )}
                                </ModernButton>
                            </div>

                            {/* Status indicator */}
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`
                                inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase
                                ${protocol.hasData
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-700/50 text-slate-500'}
                            `}>
                                    {protocol.hasData
                                        ? t('dashboard.protocolLaunchpad.completed')
                                        : t('dashboard.protocolLaunchpad.startSession')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Field Audit Modal */}
            <FieldAuditForm
                isOpen={fieldAuditOpen}
                onClose={() => setFieldAuditOpen(false)}
                onSubmitSuccess={() => pushNotification('INFO', 'Field audit logged successfully')}
            />
        </>
    );
};
