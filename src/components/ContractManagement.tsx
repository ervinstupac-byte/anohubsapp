import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
// ISPRAVKA 1: AssetPicker (komponenta) ostaje uvezena iz svog fajla
import { AssetPicker } from './AssetPicker.tsx'; 
// ISPRAVKA 2: useAssetContext (hook) se uvozi izravno iz Contexta, što je ispravan put
import { useAssetContext } from '../contexts/AssetContext.tsx'; 
import { useRisk } from '../contexts/RiskContext.tsx'; 
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

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const ContractManagement: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { riskState } = useRisk(); 
    const { showToast } = useToast();
    
    const [contract, setContract] = useState<ContractStatus>({
        status: 'ACTIVE',
        warranty_valid: true,
        penalty_amount: 0,
        days_remaining: 1095, 
        last_audit_date: 'N/A'
    });

    // --- LOGIC ENGINE ---
    useEffect(() => {
        if (!selectedAsset) return;

        // Default Status
        let newStatus: ContractStatus = {
            status: 'ACTIVE',
            warranty_valid: true,
            penalty_amount: 0,
            days_remaining: 1095, 
            last_audit_date: riskState.isAssessmentComplete ? new Date().toLocaleDateString() : 'Pending'
        };

        // 🧠 NEURAL LINK LOGIC:
        if (riskState.isAssessmentComplete) {
            
            if (riskState.criticalFlags > 0) {
                // KRITIČNO: Bilo koji 'High' rizik poništava garanciju
                newStatus.status = 'BREACHED';
                newStatus.warranty_valid = false;
                newStatus.penalty_amount = 50000 * riskState.criticalFlags;
                newStatus.breach_reason = `CRITICAL OPERATIONAL RISK DETECTED (${riskState.criticalFlags} flags via Neural Link)`;
            
            } else if (riskState.riskScore > 40) {
                // UPOZORENJE: Visok score, ali nema kritičnih zastavica
                newStatus.status = 'WARNING';
                newStatus.penalty_amount = riskState.riskScore * 500;
                newStatus.breach_reason = 'Operational Risk Score exceeds safety threshold.';
            }
        }

        setContract(newStatus);

    }, [selectedAsset, riskState]); // Osvježava se kad se promijeni rizik

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
            doc.setTextColor(220, 38, 38);
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
                    Automated warranty validation & dynamic penalty calculation based on live risk data.
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
                    <GlassCard className={`p-0 overflow-hidden border-2 transition-all duration-500 ${
                        contract.status === 'BREACHED' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                        contract.status === 'WARNING' ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]' :
                        'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    }`}>
                        <div className={`p-10 text-center relative h-full flex flex-col justify-center ${
                             contract.status === 'BREACHED' ? 'bg-red-950/30' :
                             contract.status === 'WARNING' ? 'bg-amber-950/30' :
                             'bg-emerald-950/30'
                        }`}>
                            <div className="text-8xl mb-6 filter drop-shadow-lg animate-bounce-slow">
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
                                    <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Detected Violation (Live)</p>
                                    <p className="text-sm text-red-100 font-medium leading-relaxed">{contract.breach_reason}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* RIGHT: TIMELINE & ACTIONS */}
                    <div className="space-y-6">
                        
                        {/* LIVE FEED PANEL */}
                        <GlassCard title="Live Risk Feed" subtitle="Data Source: Risk Assessment Module">
                            {!riskState.isAssessmentComplete ? (
                                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
                                        <p className="text-xs text-slate-400">Waiting for Risk Assessment data...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-white/5">
                                            <span className="text-xs text-slate-400">Calculated Risk Score</span>
                                            <span className="text-sm font-mono font-bold text-white">{riskState.riskScore}/100</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-white/5">
                                            <span className="text-xs text-slate-400">Critical Flags</span>
                                            <span className={`text-sm font-mono font-bold ${riskState.criticalFlags > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {riskState.criticalFlags}
                                            </span>
                                        </div>
                                    </div>
                                )}
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