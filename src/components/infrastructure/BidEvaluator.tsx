import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../ui/GlassCard.tsx';
import { ModernButton } from '../ui/ModernButton.tsx';
import { ModernInput } from '../ui/ModernInput.tsx';
import { HydraulicIntegrity } from '../../services/HydraulicIntegrity.ts';
import { supabase } from '../../services/supabaseClient.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import { BarChart3, ShieldAlert, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export const BidEvaluator: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [bids, setBids] = useState<any[]>([]);
    const [selectedBid, setSelectedBid] = useState<any>({
        manufacturer: '',
        proposed_turbine_type: 'FRANCIS',
        promised_efficiency: 94.0,
        price_eur: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { fetchBids(); }, []);

    const fetchBids = async () => {
        const { data } = await supabase.from('turbine_bids').select('*').order('created_at', { ascending: false });
        if (data) setBids(data);
    };

    const runAnalysis = () => {
        const type = selectedBid.proposed_turbine_type as 'FRANCIS' | 'PELTON' | 'KAPLAN';
        const evaluation = HydraulicIntegrity.validateBidEfficiency(selectedBid.promised_efficiency, type);

        setSelectedBid({
            ...selectedBid,
            eval_verdict: evaluation.verdict,
            eval_notes: `Physics limit for ${type} is ${evaluation.limit}%.`
        });
    };

    const saveBid = async () => {
        setIsLoading(true);
        const { error } = await supabase.from('turbine_bids').insert([selectedBid]);
        if (error) showToast("Error saving bid", "error");
        else {
            showToast("Bid evaluation stored in genesis ledger", "success");
            fetchBids();
        }
        setIsLoading(false);
    };

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'PLAUSIBLE': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
            case 'MARKETING_LIE': return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
            case 'IMPOSSIBLE': return 'text-red-400 border-red-500/30 bg-red-500/5';
            default: return 'text-slate-400 border-white/10';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                    Bid <span className="text-cyan-400">Evaluator</span>
                </h2>
                <div className="flex gap-2 text-xs font-mono text-slate-500">
                    <Scale className="w-4 h-4" />
                    Marketing Lie Detector v4.2
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="Inbound Offer Data">
                    <div className="space-y-6">
                        <ModernInput
                            label="Manufacturer"
                            placeholder="e.g. Voith, Andritz, General Electric..."
                            value={selectedBid.manufacturer}
                            onChange={(e: any) => setSelectedBid({ ...selectedBid, manufacturer: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <ModernInput
                                label="Turbine Technology"
                                as="select"
                                value={selectedBid.proposed_turbine_type}
                                onChange={(e: any) => setSelectedBid({ ...selectedBid, proposed_turbine_type: e.target.value })}
                            >
                                <option value="FRANCIS">Francis</option>
                                <option value="KAPLAN">Kaplan</option>
                                <option value="PELTON">Pelton</option>
                            </ModernInput>
                            <ModernInput
                                label="Promised Efficiency (%)"
                                type="number"
                                step="0.1"
                                value={selectedBid.promised_efficiency}
                                onChange={(e: any) => setSelectedBid({ ...selectedBid, promised_efficiency: parseFloat(e.target.value) })}
                            />
                        </div>
                        <ModernInput
                            label="Offer Price (€)"
                            type="number"
                            value={selectedBid.price_eur}
                            onChange={(e: any) => setSelectedBid({ ...selectedBid, price_eur: parseFloat(e.target.value) })}
                        />

                        <div className="flex gap-4 pt-4">
                            <ModernButton variant="secondary" fullWidth onClick={runAnalysis}>Analyze Physics</ModernButton>
                            <ModernButton variant="primary" fullWidth onClick={saveBid} isLoading={isLoading}>Archive Bid</ModernButton>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard title="Physics Audit Results" subtitle="Verdict based on fluid dynamics constraints">
                        {selectedBid.eval_verdict ? (
                            <div className={`p-6 rounded-2xl border ${getVerdictStyle(selectedBid.eval_verdict)} transition-all duration-500`}>
                                <div className="flex items-center gap-4 mb-4">
                                    {selectedBid.eval_verdict === 'PLAUSIBLE' && <CheckCircle2 className="w-10 h-10" />}
                                    {selectedBid.eval_verdict === 'MARKETING_LIE' && <AlertTriangle className="w-10 h-10" />}
                                    {selectedBid.eval_verdict === 'IMPOSSIBLE' && <ShieldAlert className="w-10 h-10" />}

                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter">{selectedBid.eval_verdict.replace('_', ' ')}</h4>
                                        <p className="text-xs opacity-70 font-mono">{selectedBid.eval_notes}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm opacity-90">
                                    <p>{selectedBid.eval_verdict === 'PLAUSIBLE'
                                        ? "The offered efficiency is within the theoretical bounds of modern hydro technology."
                                        : selectedBid.eval_verdict === 'MARKETING_LIE'
                                            ? "This efficiency is statistically unlikely and may indicate 'marketing optimization' of data."
                                            : "Physics Violation: No known turbine configuration can achieve this efficiency at this scale."}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                                <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                                <span className="text-xs uppercase font-black tracking-widest">Awaiting Analysis</span>
                            </div>
                        )}
                    </GlassCard>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Recent Evaluations</h3>
                        {bids.slice(0, 3).map(bid => (
                            <div key={bid.id} className="glass-panel p-4 flex justify-between items-center border-white/5">
                                <div>
                                    <h5 className="text-white font-bold">{bid.manufacturer}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono">{bid.proposed_turbine_type} @ {bid.promised_efficiency}%</p>
                                </div>
                                <div className={`text-[10px] font-black px-2 py-1 rounded border ${getVerdictStyle(bid.eval_verdict)}`}>
                                    {bid.eval_verdict}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
