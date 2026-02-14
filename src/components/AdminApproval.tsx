import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient.ts';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { useToast } from '../stores/useAppStore';
import { BackButton } from './BackButton.tsx';

interface Measurement {
    id: string;
    asset_name_audit: string;
    audit_status: string;
    status: string;
    created_at: string;
    system_origin: string;
    location_tag: string;
    fluid_type: string;
    audit_data: any;
}

export const AdminApproval: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [pending, setPending] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('installation_audits')
                .select('*')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false });

            if (data) setPending(data);
            if (error) throw error;
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from('installation_audits')
            .update({ status: 'LIVE' })
            .eq('id', id);

        if (!error) {
            showToast('Measurement approved and broadcasted to Global Fleet.', 'success');

            // Log to Digital Integrity Ledger
            await supabase.from('digital_integrity').insert({
                operation_type: 'BROADCAST_LIVE',
                asset_id: pending.find(m => m.id === id)?.asset_name_audit || 'FLEET',
                payload: { audit_id: id, status: 'LIVE', admin_action: 'CONFIRM_VERACITY' },
                hash: `SEAL_${Math.random().toString(36).substring(7)}`
            });

            setPending(prev => prev.filter(m => m.id !== id));
        } else {
            showToast('Approval failed.', 'error');
        }
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center">
                <BackButton text="Engineer Hub" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Approval <span className="text-cyan-400">Control</span>
                </h2>
                <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-1 rounded-full">
                    <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">{pending.length} PENDING</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/5" />)}
                </div>
            ) : pending.length === 0 ? (
                <GlassCard className="text-center py-20 border-emerald-500/20">
                    <span className="text-5xl mb-4 block">✅</span>
                    <h3 className="text-xl font-bold text-white uppercase">{t('adminApproval.allClear', 'ALL SYSTEMS BROADCASTED')}</h3>
                    <p className="text-slate-500 text-sm mt-2">{t('adminApproval.noPending', 'No pending field measurements requiring validation.')}</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pending.map((m) => (
                        <GlassCard
                            key={m.id}
                            title={m.asset_name_audit}
                            subtitle={new Date(m.created_at).toLocaleString()}
                            className="group hover:border-cyan-500/50 transition-all border-amber-500/20"
                        >
                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-black/20 p-2 rounded border border-white/5">
                                        <p className="text-[8px] text-slate-500 uppercase font-black">Origin</p>
                                        <p className="text-[10px] text-cyan-400 font-bold">{m.system_origin || 'Generator'}</p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded border border-white/5">
                                        <p className="text-[8px] text-slate-500 uppercase font-black">Location</p>
                                        <p className="text-[10px] text-amber-400 font-bold">{m.location_tag || 'Upper Brg'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-2">Audit Payload</p>
                                    <div className="space-y-1">
                                        {Object.entries(m.audit_data || {}).map(([key, val]: [string, any]) => (
                                            <div key={key} className="flex justify-between text-[10px] font-mono">
                                                <span className="text-slate-400">{key}:</span>
                                                <span className={val.status === 'PASS' ? 'text-emerald-400' : 'text-red-400'}>{val.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <ModernButton
                                    variant="primary"
                                    fullWidth
                                    onClick={() => handleApprove(m.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 h-10 text-xs"
                                >
                                    CONFIRM & BROADCAST
                                </ModernButton>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};
