import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useAssetContext, AssetPicker } from './AssetPicker.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import jsPDF from 'jspdf';
import { GlassCard } from './ui/GlassCard.tsx'; 
import { ModernButton } from './ui/ModernButton.tsx'; 

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
    
    // UKLONJENO loading stanje jer se nije koristilo u UI-u
    
    const [contract, setContract] = useState<ContractStatus>({
        status: 'ACTIVE',
        warranty_valid: true,
        penalty_amount: 0,
        days_remaining: 1095, 
        last_audit_date: 'N/A'
    });

    useEffect(() => {
        const analyzeContractHealth = async () => {
            if (!selectedAsset) return;

            try {
                // Fetch last Audit
                const { data: auditData } = await supabase
                    .from('installation_audits')
                    .select('*')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Fetch Risk Score
                const { data: riskData } = await supabase
                    .from('risk_assessments')
                    .select('risk_score')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                let newStatus: ContractStatus = {
                    status: 'ACTIVE',
                    warranty_valid: true,
                    penalty_amount: 0,
                    days_remaining: 1095, 
                    last_audit_date: auditData ? new Date(auditData.created_at).toLocaleDateString() : 'No Audits'
                };

                // RULES ENGINE
                if (auditData && auditData.audit_status === 'FAILED') {
                    newStatus.status = 'BREACHED';
                    newStatus.warranty_valid = false;
                    newStatus.penalty_amount = 250000;
                    newStatus.breach_reason = 'Critical Non-Compliance: 0.05 mm/m Protocol Failed.';
                } else if (riskData && riskData.risk_score > 50) {
                    newStatus.status = 'WARNING';
                    newStatus.penalty_amount = riskData.risk_score * 1000;
                    newStatus.breach_reason = 'Operational Risk exceeds contractual safety limits.';
                }

                setContract(newStatus);

            } catch (error) {
                console.error('Contract analysis failed:', error);
            }
        };

        analyzeContractHealth();
    }, [selectedAsset]);

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
            <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-4">
                <BackButton text="Back to Hub" />
                <div className="w-full max-w-xs">
                    <AssetPicker />
                </div>
            </div>

            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                    Smart Contract <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                    Automated warranty validation & dynamic penalty calculation.
                </p>
            </div>

            {!selectedAsset ? (
                <GlassCard className="text-center py-24 border-dashed border-slate-700 opacity-50">
                    <div className="text-6xl mb-6 grayscale">⚖️</div>
                    <h3 className="text-xl font-bold text-white">No Asset Selected</h3>
                    <p className="text-slate-400 mt-2">Select a project above to execute legal analysis.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                    
                    {/* LEFT: STATUS CARD */}
                    <GlassCard className={`p-0 overflow-hidden border-2 ${
                        contract.status === 'BREACHED' ? 'border-red-500 shadow-red-900/20' :
                        contract.status === 'WARNING' ? 'border-amber-500 shadow-amber-900/20' :
                        'border-emerald-500 shadow-emerald-900/20'
                    }`}>
                        <div className={`p-10 text-center relative ${
                             contract.status === 'BREACHED' ? 'bg-red-900/10' :
                             contract.status === 'WARNING' ? 'bg-amber-900/10' :
                             'bg-emerald-900/10'
                        }`}>
                            <div className="text-8xl mb-6 filter drop-shadow-lg">
                                {contract.status === 'BREACHED' ? '🚫' : contract.status === 'WARNING' ? '⚠️' : '✅'}
                            </div>
                            <h3 className="text-5xl font-black text-white mb-2 tracking-tight">{contract.status}</h3>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-8">Contract Standing</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Warranty Status</p>
                                    <p className={`font-bold text-lg ${contract.warranty_valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {contract.warranty_valid ? 'VALID' : 'VOID'}
                                    </p>
                                </div>
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Penalty Accrued</p>
                                    <p className="font-mono font-bold text-lg text-white">€ {contract.penalty_amount.toLocaleString()}</p>
                                </div>
                            </div>

                            {contract.breach_reason && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-left animate-pulse">
                                    <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Detected Violation</p>
                                    <p className="text-sm text-red-100 font-medium leading-relaxed">{contract.breach_reason}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* RIGHT: TIMELINE & ACTIONS */}
                    <div className="space-y-6">
                        <GlassCard title="Warranty Timeline" subtitle="Contract Duration">
                            <div className="pt-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">
                                    <span>Inception</span>
                                    <span>Expiration</span>
                                </div>
                                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <div className="absolute top-0 left-0 h-full bg-cyan-500 w-1/4"></div>
                                </div>
                                <div className="text-center">
                                    <span className="text-2xl font-black text-white">{contract.days_remaining}</span>
                                    <span className="text-sm text-slate-500 ml-2 font-medium">Days Remaining</span>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="bg-gradient-to-br from-slate-900 to-slate-800">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-white mb-2">Legal Enforcement</h3>
                                <p className="text-xs text-slate-400">Generate legally binding notices based on real-time data.</p>
                            </div>
                            
                            <ModernButton 
                                onClick={generateLegalNotice}
                                variant={contract.status === 'ACTIVE' ? 'secondary' : 'danger'}
                                fullWidth
                                className="py-4 text-sm"
                                icon={<span>📜</span>}
                            >
                                {contract.status === 'ACTIVE' ? 'Generate Compliance Certificate' : 'GENERATE NOTICE OF BREACH'}
                            </ModernButton>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};