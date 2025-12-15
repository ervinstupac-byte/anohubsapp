import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useAssetContext, AssetPicker } from './AssetPicker.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import jsPDF from 'jspdf'; // Koristimo direktno za brzi pravni dokument

interface ContractStatus {
    status: 'ACTIVE' | 'BREACHED' | 'WARNING' | 'EXPIRED';
    warranty_valid: boolean;
    penalty_amount: number;
    days_remaining: number;
    last_audit_date: string;
    breach_reason?: string;
}

export const ContractManagement: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [contract, setContract] = useState<ContractStatus>({
        status: 'ACTIVE',
        warranty_valid: true,
        penalty_amount: 0,
        days_remaining: 1095, // 3 years default
        last_audit_date: 'N/A'
    });

    // --- ANALIZA PODATAKA ---
    useEffect(() => {
        const analyzeContractHealth = async () => {
            if (!selectedAsset) return;
            setLoading(true);

            try {
                // 1. Dohvati zadnji Instalacijski Audit
                const { data: auditData } = await supabase
                    .from('installation_audits')
                    .select('*')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // 2. Dohvati Risk Score
                const { data: riskData } = await supabase
                    .from('risk_assessments')
                    .select('risk_score')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // --- LOGIKA "PAMETNOG UGOVORA" ---
                let newStatus: ContractStatus = {
                    status: 'ACTIVE',
                    warranty_valid: true,
                    penalty_amount: 0,
                    days_remaining: 1095, // Hardcoded 3 years for demo
                    last_audit_date: auditData ? new Date(auditData.created_at).toLocaleDateString() : 'No Audits'
                };

                // PRAVILO: FAILED AUDIT = AUTOMATSKI PREKRŠAJ
                if (auditData && auditData.audit_status === 'FAILED') {
                    newStatus.status = 'BREACHED';
                    newStatus.warranty_valid = false;
                    newStatus.penalty_amount = 250000; // Početna kazna
                    newStatus.breach_reason = 'Critical Non-Compliance: 0.05 mm/m Protocol Failed.';
                }
                // PRAVILO: HIGH RISK = UPOZORENJE I PENALI
                else if (riskData && riskData.risk_score > 50) {
                    newStatus.status = 'WARNING';
                    newStatus.penalty_amount = riskData.risk_score * 1000; // Dinamički penal
                    newStatus.breach_reason = 'Operational Risk exceeds contractual safety limits.';
                }

                setContract(newStatus);

            } catch (error) {
                console.error('Contract analysis failed:', error);
            } finally {
                setLoading(false);
            }
        };

        analyzeContractHealth();
    }, [selectedAsset]);

    // --- GENERIRANJE PRAVNOG DOKUMENTA (On-the-fly) ---
    const generateLegalNotice = () => {
        if (!selectedAsset) return;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("NOTICE OF NON-COMPLIANCE", 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Asset: ${selectedAsset.name}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        doc.text(`Status: ${contract.status}`, 20, 60);
        
        doc.text("Pursuant to the Master Service Agreement, AnoHUB system has detected", 20, 80);
        doc.text("deviations from the mandatory Standard of Excellence.", 20, 86);
        
        if (contract.breach_reason) {
            doc.setTextColor(255, 0, 0);
            doc.text(`VIOLATION: ${contract.breach_reason}`, 20, 100);
            doc.setTextColor(0, 0, 0);
        }
        
        doc.text(`Estimated Contract Penalty: EUR ${contract.penalty_amount.toLocaleString()}`, 20, 120);
        
        doc.save(`Legal_Notice_${selectedAsset.name}.pdf`);
        showToast('Legal Notice generated.', 'success');
    };

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
            <BackButton text="Back to Hub" />
            <AssetPicker />

            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    Smart Contract <span className="text-cyan-400">Intelligence</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Automated warranty validation & dynamic penalty calculation.
                </p>
            </div>

            {!selectedAsset ? (
                <div className="text-center p-12 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                    <p className="text-slate-500">Select a project above to execute legal analysis.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* LEFT: STATUS CARD */}
                    <div className={`p-8 rounded-3xl border-2 flex flex-col justify-center items-center text-center shadow-2xl transition-all relative overflow-hidden ${
                        contract.status === 'BREACHED' ? 'bg-red-900/20 border-red-500 shadow-red-900/20' :
                        contract.status === 'WARNING' ? 'bg-yellow-900/20 border-yellow-500 shadow-yellow-900/20' :
                        'bg-green-900/20 border-green-500 shadow-green-900/20'
                    }`}>
                        {/* Background watermark */}
                        <div className="absolute inset-0 opacity-5 text-9xl font-black flex items-center justify-center select-none">
                            {contract.status}
                        </div>

                        <div className="text-6xl mb-4 relative z-10">
                            {contract.status === 'BREACHED' ? '⚖️' : contract.status === 'WARNING' ? '⚠️' : '🛡️'}
                        </div>
                        <h3 className="text-4xl font-black text-white mb-2 relative z-10">{contract.status}</h3>
                        <p className="text-sm uppercase tracking-widest text-slate-400 mb-6 relative z-10">Contract Standing</p>
                        
                        <div className="w-full bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400 text-sm">Warranty Validity</span>
                                <span className={`font-bold ${contract.warranty_valid ? 'text-green-400' : 'text-red-400'}`}>
                                    {contract.warranty_valid ? 'VALID' : 'VOID'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Accumulated Penalty</span>
                                <span className="font-mono font-bold text-white">€ {contract.penalty_amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {contract.breach_reason && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left w-full relative z-10 animate-pulse">
                                <p className="text-xs font-bold text-red-400 uppercase mb-1">Detected Violation:</p>
                                <p className="text-sm text-red-200">{contract.breach_reason}</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: TIMELINE & ACTIONS */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-4">Warranty Timeline</h3>
                            <div className="relative pt-6 pb-2">
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{ width: '25%' }}></div>
                                </div>
                                <div className="flex justify-between text-xs mt-2 text-slate-400">
                                    <span>Start Date</span>
                                    <span className="text-white font-bold">{contract.days_remaining} Days Remaining</span>
                                    <span>End Date</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-2">Legal Enforcement</h3>
                            <p className="text-xs text-slate-400 mb-6">
                                Automated protocols for contract compliance.
                            </p>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={generateLegalNotice}
                                    className={`p-4 rounded-lg text-white text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                                        contract.status === 'ACTIVE' 
                                        ? 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700' 
                                        : 'bg-red-600 hover:bg-red-500 border-red-400 shadow-lg shadow-red-900/50'
                                    }`}
                                >
                                    <span>📜</span>
                                    {contract.status === 'ACTIVE' ? 'Generate Compliance Certificate' : 'GENERATE NOTICE OF BREACH'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};