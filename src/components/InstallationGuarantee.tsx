import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// --- TYPE DEFINITIONS ---
// Definiramo kako izgleda status jedne faze
interface StageStatus {
    value: string;
    status: 'N/A' | 'PASS' | 'FAIL';
}

// Definiramo cijelo stanje audita
// Record<string, StageStatus> znači: objekt gdje su ključevi stringovi, a vrijednosti StageStatus
interface AuditState {
    stageStatus: Record<string, StageStatus>;
    finalNotes: string;
}

const AUDIT_STAGES = [
    { id: 'foundation', name: 'Foundation Alignment', requirement: '< 0.05 mm/m (Verticality)' },
    { id: 'shaft', name: 'Main Shaft Run-Out', requirement: '< 0.02 mm (Static)' },
    { id: 'bearing_clearance', name: 'Guide Bearing Clearance', requirement: 'OEM Tolerance' },
    { id: 'wicket_synchronization', name: 'Wicket Gate Sync', requirement: '< 1% Deviation' },
    { id: 'commissioning_vibration', name: 'Vibration Baseline', requirement: '< 2.5 mm/s (Overall)' },
];

export const InstallationGuarantee: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    
    // Inicijalizacija stanja s eksplicitnim tipom AuditState
    const [audit, setAudit] = useState<AuditState>({
        stageStatus: AUDIT_STAGES.reduce((acc, stage) => ({ 
            ...acc, 
            [stage.id]: { value: '', status: 'N/A' } 
        }), {} as Record<string, StageStatus>), // Važno: casting u Record
        finalNotes: '',
    });

    const handleStageUpdate = (stageId: string, key: 'value' | 'status', value: string) => {
        setAudit(prev => ({
            ...prev,
            stageStatus: {
                ...prev.stageStatus,
                [stageId]: {
                    ...prev.stageStatus[stageId],
                    [key]: value
                }
            }
        }));
    };

    const handleSaveAudit = async () => {
        if (!selectedAsset) {
            showToast('Please select a Target Asset before saving the audit.', 'error');
            return;
        }

        const overallStatus = Object.values(audit.stageStatus).some((s) => s.status === 'FAIL') ? 'FAILED' : 'PASSED';

        const payload = {
            engineer_id: user?.email || 'Guest',
            asset_id: selectedAsset.id,
            asset_name_audit: selectedAsset.name,
            audit_data: audit.stageStatus,
            final_notes: audit.finalNotes,
            audit_status: overallStatus,
        };

        try {
            const { error } = await supabase.from('installation_audits').insert([payload]);
            if (error) throw error;
            showToast(`Audit sealed successfully! Status: ${overallStatus}`, overallStatus === 'PASSED' ? 'success' : 'warning');
        } catch (error: any) {
            console.error('Save Audit Error:', error);
            showToast(`Failed to save audit: ${error.message}`, 'error');
        }
    };

    // Logika za status trake
    const overallStatus = Object.values(audit.stageStatus).some((s) => s.status === 'FAIL') ? 'FAILED' : 
                          Object.values(audit.stageStatus).some((s) => s.status === 'PASS') ? 'PASSED' : 'PENDING';

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">
                <BackButton text="Back to Hub" />
                <div className="w-full max-w-xs">
                    <AssetPicker />
                </div>
            </div>

            <div className="text-center space-y-2 mb-8">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                    Installation <span className="text-cyan-400">Guarantee</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto font-light">
                    The 0.05 mm/m Protocol. Non-negotiable precision mandate during assembly.
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
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Audit For</p>
                            <p className="text-lg font-bold text-white">{selectedAsset?.name || '--- Select Asset ---'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Status</span>
                        <span className={`text-xl font-black uppercase tracking-wider ${
                            overallStatus === 'FAILED' ? 'text-red-500' : 
                            overallStatus === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                            {overallStatus}
                        </span>
                    </div>
                </div>

                {/* AUDIT TABLE */}
                <div className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="h-px w-8 bg-cyan-500"></span>
                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Mandatory Checkpoints</h3>
                    </div>

                    {AUDIT_STAGES.map((stage, index) => (
                        <div key={stage.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-slate-800/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div className="md:col-span-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-slate-600">0{index + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{stage.name}</p>
                                        <p className="text-[10px] text-cyan-400/80 font-mono mt-0.5">{stage.requirement}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-4">
                                <input
                                    type="text"
                                    placeholder="Enter Measured Value..."
                                    value={audit.stageStatus[stage.id].value}
                                    onChange={(e) => handleStageUpdate(stage.id, 'value', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-slate-600"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <select
                                    value={audit.stageStatus[stage.id].status}
                                    onChange={(e) => handleStageUpdate(stage.id, 'status', e.target.value as any)}
                                    className={`w-full border rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors outline-none appearance-none text-center ${
                                        audit.stageStatus[stage.id].status === 'PASS' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                                        audit.stageStatus[stage.id].status === 'FAIL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                                        'bg-slate-800 border-slate-600 text-slate-400'
                                    }`}
                                >
                                    <option value="N/A">Pending</option>
                                    <option value="PASS">Pass</option>
                                    <option value="FAIL">Fail</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                {/* NOTES & FOOTER */}
                <div className="p-6 md:p-8 bg-slate-900/30 border-t border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Engineer's Remarks</h3>
                    <textarea
                        rows={3}
                        value={audit.finalNotes}
                        onChange={(e) => setAudit(prev => ({ ...prev, finalNotes: e.target.value }))}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm resize-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all"
                        placeholder="Document any deviations, risks, or corrective actions taken..."
                    />

                    <div className="flex justify-end mt-6">
                        <ModernButton 
                            onClick={handleSaveAudit} 
                            disabled={!selectedAsset} 
                            variant="primary"
                            className="px-8 shadow-lg shadow-cyan-900/20"
                            icon={<span>🔒</span>}
                        >
                            {selectedAsset ? 'Seal Audit to Cloud' : 'Select Asset to Begin'}
                        </ModernButton>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default InstallationGuarantee;