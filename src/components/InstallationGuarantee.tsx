import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx'; // <--- NOVO

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
    
    // Audit States
    const [audit, setAudit] = useState({
        stageStatus: AUDIT_STAGES.reduce((acc, stage) => ({ ...acc, [stage.id]: { value: '', status: 'N/A' as 'N/A' | 'PASS' | 'FAIL' } }), {}),
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

        const overallStatus = Object.values(audit.stageStatus).some((s: any) => s.status === 'FAIL') ? 'FAILED' : 'PASSED';

        const payload = {
            engineer_id: user?.email || 'Guest',
            asset_id: selectedAsset.id, // <--- VEZANO ZA ASSET
            asset_name_audit: selectedAsset.name,
            audit_data: audit.stageStatus,
            final_notes: audit.finalNotes,
            audit_status: overallStatus,
        };

        try {
            const { error } = await supabase.from('installation_audits').insert([payload]);

            if (error) throw error;

            showToast(`Audit for ${selectedAsset.name} sealed successfully! Status: ${overallStatus}`, overallStatus === 'PASSED' ? 'success' : 'warning');
        } catch (error: any) {
            console.error('Save Audit Error:', error);
            showToast(`Failed to save audit: ${error.message}`, 'error');
        }
    };

    const overallStatus = Object.values(audit.stageStatus).some((s: any) => s.status === 'FAIL') ? 'FAILED' : 
                          Object.values(audit.stageStatus).some((s: any) => s.status === 'PASS') ? 'PASSED' : 'PENDING';

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
            <BackButton text="Back to Hub" />

            {/* 1. ASSET PICKER */}
            <AssetPicker />
            
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white">Installation Guarantee</h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                    The 0.05 mm/m Protocol. Non-negotiable precision mandate during assembly and commissioning.
                </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-6">
                
                {/* STATUS BAR */}
                <div className={`flex justify-between items-center p-4 rounded-xl border ${
                    overallStatus === 'FAILED' ? 'bg-red-900/20 border-red-500/50' : 
                    overallStatus === 'PASSED' ? 'bg-green-900/20 border-green-500/50' : 
                    'bg-slate-900/50 border-slate-700'
                }`}>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase">Current Asset:</p>
                        <p className="text-xl font-mono text-white">{selectedAsset?.name || '--- Select Asset ---'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase">Audit Status:</p>
                        <p className={`text-xl font-black ${overallStatus === 'FAILED' ? 'text-red-500' : overallStatus === 'PASSED' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {overallStatus}
                        </p>
                    </div>
                </div>

                {/* AUDIT TABLE */}
                <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Mandatory Checks</h3>
                <div className="space-y-4">
                    {AUDIT_STAGES.map(stage => (
                        <div key={stage.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                            <div className="md:col-span-5">
                                <p className="text-sm font-bold text-white">{stage.name}</p>
                                <p className="text-xs text-slate-500">{stage.requirement}</p>
                            </div>

                            <div className="md:col-span-4">
                                <input
                                    type="text"
                                    placeholder="Measured Value"
                                    value={audit.stageStatus[stage.id].value}
                                    onChange={(e) => handleStageUpdate(stage.id, 'value', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <select
                                    value={audit.stageStatus[stage.id].status}
                                    onChange={(e) => handleStageUpdate(stage.id, 'status', e.target.value as any)}
                                    className={`w-full border rounded p-2 text-sm font-bold cursor-pointer ${
                                        audit.stageStatus[stage.id].status === 'PASS' ? 'bg-green-900/50 border-green-500 text-green-400' :
                                        audit.stageStatus[stage.id].status === 'FAIL' ? 'bg-red-900/50 border-red-500 text-red-400' :
                                        'bg-slate-800 border-slate-600 text-slate-400'
                                    }`}
                                >
                                    <option value="N/A">PENDING</option>
                                    <option value="PASS">PASS</option>
                                    <option value="FAIL">FAIL</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                {/* NOTES */}
                <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 pt-4">Final Remarks</h3>
                <textarea
                    rows={4}
                    value={audit.finalNotes}
                    onChange={(e) => setAudit(prev => ({ ...prev, finalNotes: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded p-3 text-white resize-none focus:border-cyan-500 outline-none"
                    placeholder="Document deviations, risks, and necessary corrective actions."
                />

                {/* SAVE BUTTON */}
                <div className="flex justify-end pt-4 border-t border-slate-700">
                    <button 
                        onClick={handleSaveAudit} 
                        disabled={!selectedAsset} 
                        className={`px-8 py-4 font-bold rounded-xl shadow-lg transition-all ${
                            !selectedAsset 
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/30 hover:-translate-y-1'
                        }`}
                    >
                        {selectedAsset ? 'SEAL AUDIT TO CLOUD' : 'Select Asset to Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallationGuarantee;