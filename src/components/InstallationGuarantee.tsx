import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AssetPicker } from './AssetPicker.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { EngineeringSchema } from '../schemas/engineering.ts';
import { useRisk } from '../contexts/RiskContext.tsx';

// --- TYPE DEFINITIONS ---
interface StageStatus {
    value: string;
    status: 'N/A' | 'PASS' | 'FAIL';
    error?: string;
}

interface AuditState {
    stageStatus: Record<string, StageStatus>;
    finalNotes: string;
    systemOrigin: string;
    locationTag: string;
    fluidType: string;
}

// --- SUB-COMPONENT: TREND WARNING ---
const TrendWarning: React.FC<{ message: string }> = ({ message }) => (
    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <span className="text-amber-500 text-lg">📈</span>
        <p className="text-[11px] font-bold text-amber-200 uppercase tracking-wide leading-tight">
            {message}
        </p>
    </div>
);

const AUDIT_STAGES = [
    { id: 'foundation', field: 'foundation', name: 'Foundation Alignment', requirement: '< 0.05 mm/m (Verticality)' },
    { id: 'shaft', field: 'shaft', name: 'Main Shaft Run-Out', requirement: '< 0.02 mm (Static)' },
    { id: 'bearing_clearance', field: 'bearing_clearance', name: 'Guide Bearing Clearance', requirement: 'OEM Tolerance' },
    { id: 'wicket_synchronization', field: 'wicket_synchronization', name: 'Wicket Gate Sync', requirement: '< 1% Deviation' },
    { id: 'commissioning_vibration', field: 'commissioning_vibration', name: 'Vibration Baseline', requirement: '< 2.5 mm/s (Overall)' },
];

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const InstallationGuarantee: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    const { riskState } = useRisk();

    const isRiskCritical = riskState.criticalFlags > 0;

    // Inicijalizacija stanja
    const [audit, setAudit] = useState<AuditState>({
        stageStatus: AUDIT_STAGES.reduce((acc, stage) => ({
            ...acc,
            [stage.id]: { value: '', status: 'N/A' as const }
        }), {} as Record<string, StageStatus>),
        finalNotes: '',
        systemOrigin: 'Generator',
        locationTag: 'Upper Bearing',
        fluidType: 'VG46'
    });

    const [activeTrends, setActiveTrends] = useState<Record<string, boolean>>({});

    // --- PREDICTIVE LOGIC: TREND CALCULATION ---
    const calculateTrend = async (stageId: string, currentValue: string) => {
        if (!selectedAsset || !currentValue || isNaN(parseFloat(currentValue))) return;

        try {
            const { data, error } = await supabase
                .from('installation_audits')
                .select('audit_data')
                .eq('asset_id', selectedAsset.id)
                .order('created_at', { ascending: false })
                .limit(2);

            if (error) throw error;

            if (data && data.length >= 2) {
                const val1 = parseFloat(data[0].audit_data[stageId]?.value || '0');
                const val2 = parseFloat(data[1].audit_data[stageId]?.value || '0');
                const curVal = parseFloat(currentValue);

                // Constant Increase Detection: current > last > second_to_last
                if (curVal > val1 && val1 > val2 && val1 > 0) {
                    setActiveTrends(prev => ({ ...prev, [stageId]: true }));
                } else {
                    setActiveTrends(prev => ({ ...prev, [stageId]: false }));
                }
            }
        } catch (err) {
            console.error('Trend Calculation Error:', err);
        }
    };

    const handleStageUpdate = (stageId: string, key: 'value' | 'status', value: string) => {
        let errorMsg = '';
        let newStatus: 'N/A' | 'PASS' | 'FAIL' = audit.stageStatus[stageId].status;

        if (key === 'value') {
            const decValue = new Decimal(value || '0');
            const numValue = decValue.toNumber(); // For Zod validation, but we check Decimal first
            const stage = AUDIT_STAGES.find(s => s.id === stageId);

            if (value !== '' && stage?.field) {
                // Precision Check using Decimal.js before Zod
                let precisionPass = true;
                if (stageId === 'foundation' && decValue.gt('0.05')) precisionPass = false;
                if (stageId === 'shaft' && decValue.gt('0.02')) precisionPass = false;
                if (stageId === 'commissioning_vibration' && decValue.gt('2.5')) precisionPass = false;

                const result = EngineeringSchema.pick({ [stage.field]: true } as any).safeParse({ [stage.field]: numValue });

                if (!result.success || !precisionPass) {
                    errorMsg = !precisionPass ? `PRECISION_ERROR: Value ${value} violates 0.05mm standard` : (result.error?.issues[0]?.message || 'Validation Error');
                    newStatus = 'FAIL';
                } else {
                    newStatus = 'PASS';
                    errorMsg = '';
                }
            } else if (value === '') {
                newStatus = 'N/A';
                errorMsg = '';
            }
        }

        setAudit((prev: AuditState) => ({
            ...prev,
            stageStatus: {
                ...prev.stageStatus,
                [stageId]: {
                    ...prev.stageStatus[stageId],
                    [key]: value,
                    status: (key === 'status' ? value : newStatus) as 'N/A' | 'PASS' | 'FAIL',
                    error: errorMsg
                }
            }
        }));

        // Trigger predictive analysis
        if (key === 'value' && value !== '') {
            calculateTrend(stageId, value);
        }
    };

    const handleSaveAudit = async () => {
        if (!selectedAsset) {
            showToast(t('installationGuarantee.toastSelect'), 'error');
            return;
        }

        const entries = Object.values(audit.stageStatus) as StageStatus[];
        const overallStatus = entries.some((s) => s.status === 'FAIL') ? 'FAILED' : 'PASSED';

        const payload = {
            engineer_id: user?.email || 'Guest',
            asset_id: selectedAsset.id,
            asset_name_audit: selectedAsset.name,
            audit_data: audit.stageStatus,
            final_notes: audit.finalNotes,
            audit_status: overallStatus,
            status: 'PENDING',
            system_origin: (audit as any).systemOrigin,
            location_tag: (audit as any).locationTag,
            fluid_type: (audit as any).fluidType,
        };

        const { updateEngineeringHealth } = useRisk();
        const deviations = entries.filter(s => s.status === 'FAIL').length;

        try {
            const { error } = await supabase.from('installation_audits').insert([payload]);
            if (error) throw error;

            // Real-time State Bridge
            updateEngineeringHealth(overallStatus as any, deviations);

            showToast(t('installationGuarantee.toastSuccess', { status: t(`installationGuarantee.${overallStatus.toLowerCase()}`) }), overallStatus === 'PASSED' ? 'success' : 'warning');
        } catch (error: any) {
            console.error('Save Audit Error:', error);
            showToast(t('installationGuarantee.toastError', { error: error.message }), 'error');
        }
    };

    // Logika za status trake
    // Logika za status trake
    const { overallStatus } = useMemo(() => {
        const stageEntries = Object.values(audit.stageStatus) as StageStatus[];
        const failures = stageEntries.some((s) => s.status === 'FAIL');
        const status = failures ? 'FAILED' :
            stageEntries.some((s) => s.status === 'PASS') ? 'PASSED' : 'PENDING';

        return { overallStatus: status };
    }, [audit.stageStatus]);

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">
                <BackButton text={t('actions.back')} />
                <div className="w-full max-w-xs">
                    <AssetPicker />
                </div>
            </div>

            <div className="text-center space-y-2 mb-8">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                    {t('installationGuarantee.title').split(' ')[0]} <span className="text-cyan-400">{t('installationGuarantee.title').split(' ')[1]}</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto font-light">
                    {t('installationGuarantee.subtitle')}
                </p>
            </div>

            <GlassCard className="p-0 border-t-4 border-t-cyan-500">
                {/* STATUS BAR */}
                <div className="p-6 border-b border-white/5 bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-2xl">🏗️</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('installationGuarantee.activeAudit')}</p>
                            <p className="text-lg font-bold text-white">{selectedAsset?.name || t('installationGuarantee.selectAsset')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('installationGuarantee.liveStatus')}</span>
                        <div className="flex flex-col">
                            <span className={`text-xl font-black uppercase tracking-wider ${overallStatus === 'FAILED' ? 'text-red-500 animate-pulse' :
                                overallStatus === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                {t(`installationGuarantee.${overallStatus.toLowerCase()}`)}
                            </span>
                            <span className="text-[8px] text-amber-500 uppercase font-bold tracking-widest text-center mt-1 bg-amber-500/10 rounded px-1 animate-pulse">
                                DRAFT: PENDING APPROVAL
                            </span>
                        </div>
                    </div>
                </div>

                {/* GRANULAR TAGS BAR */}
                <div className="flex flex-wrap gap-4 p-4 border-b border-white/5 bg-slate-900/20">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[9px] text-slate-500 uppercase font-black mb-1 block">System Origin</label>
                        <select
                            value={(audit as any).systemOrigin}
                            onChange={(e) => setAudit(prev => ({ ...prev, systemOrigin: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                        >
                            <option value="Generator">Generator</option>
                            <option value="Hydraulic Unit">Hydraulic Unit</option>
                            <option value="Lubrication System">Lubrication System</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[9px] text-slate-500 uppercase font-black mb-1 block">Location Tag</label>
                        <select
                            value={(audit as any).locationTag}
                            onChange={(e) => setAudit(prev => ({ ...prev, locationTag: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                        >
                            <option value="Upper Bearing">Upper Bearing</option>
                            <option value="Thrust Bearing">Thrust Bearing</option>
                            <option value="Turbine Cover">Turbine Cover</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-[9px] text-slate-500 uppercase font-black mb-1 block">Fluid Type</label>
                        <select
                            value={(audit as any).fluidType}
                            onChange={(e) => setAudit(prev => ({ ...prev, fluidType: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                        >
                            <option value="VG46">ISO VG46</option>
                            <option value="VG68">ISO VG68</option>
                            <option value="N/A">N/A</option>
                        </select>
                    </div>
                </div>

                {/* AUDIT TABLE */}
                <div className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="h-px w-8 bg-cyan-500"></span>
                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">{t('installationGuarantee.checkpoints')}</h3>
                    </div>

                    {AUDIT_STAGES.map((stage, index) => {
                        const stageData = audit.stageStatus[stage.id];
                        const isAlarm = stageData.status === 'FAIL';

                        return (
                            <div key={stage.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all duration-300 ${isAlarm
                                ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                : 'bg-slate-800/40 border-white/5 hover:border-cyan-500/30'
                                }`}>
                                <div className="md:col-span-5">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-mono ${isAlarm ? 'text-red-400' : 'text-slate-600'}`}>0{index + 1}</span>
                                        <div>
                                            <p className={`text-sm font-bold ${isAlarm ? 'text-red-200' : 'text-slate-200'}`}>{t(`installationGuarantee.checks.${stage.id}`)}</p>
                                            <p className={`text-[10px] font-mono mt-0.5 ${isAlarm ? 'text-red-400' : 'text-cyan-400/80'}`}>{t(`installationGuarantee.checks.${stage.id}Req`)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4 relative group">
                                    <input
                                        type="text"
                                        placeholder={t('installationGuarantee.inputPlaceholder')}
                                        value={stageData.value}
                                        onChange={(e) => handleStageUpdate(stage.id, 'value', e.target.value)}
                                        className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-white text-sm outline-none transition-all placeholder-slate-600 ${isAlarm
                                            ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-950/20 text-red-100 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]'
                                            : 'border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                                            }`}
                                    />
                                    {isAlarm && stageData.error && (
                                        <div className="absolute -top-10 left-0 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg animate-bounce uppercase tracking-tighter z-10">
                                            {stageData.error}
                                        </div>
                                    )}

                                    {activeTrends[stage.id] && (
                                        <TrendWarning message="Predictive Alert: Deviation trend suggests limit breach within next 48h" />
                                    )}
                                </div>

                                <div className="md:col-span-3">
                                    <select
                                        value={stageData.status}
                                        onChange={(e) => handleStageUpdate(stage.id, 'status', e.target.value as any)}
                                        className={`w-full border rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors outline-none appearance-none text-center ${stageData.status === 'PASS' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                                            stageData.status === 'FAIL' ? 'bg-red-500/40 border-red-500 text-white' :
                                                'bg-slate-800 border-slate-600 text-slate-400'
                                            }`}
                                    >
                                        <option value="N/A">{t('installationGuarantee.statusOptions.pending')}</option>
                                        <option value="PASS">{t('installationGuarantee.statusOptions.pass')}</option>
                                        <option value="FAIL">{t('installationGuarantee.statusOptions.fail')}</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* NOTES & FOOTER */}
                <div className="p-6 md:p-8 bg-slate-900/30 border-t border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('installationGuarantee.remarksTitle')}</h3>
                    <textarea
                        rows={3}
                        value={audit.finalNotes}
                        onChange={(e) => setAudit(prev => ({ ...prev, finalNotes: e.target.value }))}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm resize-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all"
                        placeholder={t('installationGuarantee.remarksPlaceholder')}
                    />

                    <div className="flex flex-col items-end gap-2 mt-6">
                        {isRiskCritical && (
                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold animate-pulse uppercase tracking-wider mb-1">
                                <span>⚠️</span>
                                <span>{t('installationGuarantee.riskBlock', 'Audit Locked: Critical Risks Detected in Diagnostics')}</span>
                            </div>
                        )}
                        <ModernButton
                            onClick={handleSaveAudit}
                            disabled={!selectedAsset || isRiskCritical}
                            variant={isRiskCritical ? 'secondary' : 'primary'}
                            className={`px-8 shadow-lg ${isRiskCritical ? 'grayscale opacity-50' : 'shadow-cyan-900/20'}`}
                            icon={<span>{isRiskCritical ? '🔒' : '🔏'}</span>}
                        >
                            {!selectedAsset
                                ? t('installationGuarantee.selectBtn')
                                : isRiskCritical
                                    ? t('installationGuarantee.lockedBtn', 'Resolve Risks First')
                                    : t('installationGuarantee.sealBtn')}
                        </ModernButton>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.
