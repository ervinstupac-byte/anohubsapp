import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { ModernInput } from '../../shared/components/ui/ModernInput';
import { supabase } from '../../services/supabaseClient.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import { Droplets, Info, TrendingUp, Waves } from 'lucide-react';

export const HydrologyLab: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [plants, setPlants] = useState<any[]>([]);
    const [selectedPlantId, setSelectedPlantId] = useState('');
    const [hydrology, setHydrology] = useState<any>({
        design_head: 100,
        design_flow: 10.5,
        ecological_flow: 1.2,
        min_flow: 0.5
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        const { data } = await supabase.from('plants').select('id, name');
        if (data) {
            setPlants(data);
            if (data.length > 0) {
                setSelectedPlantId(data[0].id);
                fetchHydrology(data[0].id);
            }
        }
    };

    const fetchHydrology = async (plantId: string) => {
        setIsLoading(true);
        const { data } = await supabase.from('hydrology_context').select('*').eq('plant_id', plantId).single();
        if (data) setHydrology(data);
        else {
            // Create default if not exists
            setHydrology({
                plant_id: plantId,
                design_head: 100,
                design_flow: 10.5,
                ecological_flow: 1.2,
                min_flow: 0.5
            });
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        const { error } = await supabase.from('hydrology_context').upsert(hydrology, { onConflict: 'plant_id' });
        if (error) showToast("Hydrology sync failed", "error");
        else showToast("Hydrology parameters etched to database", "success");
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                    Hydrology <span className="text-cyan-400">Lab</span>
                </h2>
                <div className="flex gap-2">
                    <select
                        className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        value={selectedPlantId}
                        onChange={(e) => {
                            setSelectedPlantId(e.target.value);
                            fetchHydrology(e.target.value);
                        }}
                    >
                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ModernButton variant="primary" onClick={handleSave} isLoading={isLoading}>Save Changes</ModernButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="Primary Parameters" icon={<Waves className="w-5 h-5 text-blue-400" />}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <ModernInput
                                label="Design Head (m)"
                                type="number"
                                value={hydrology.design_head}
                                onChange={(e: any) => setHydrology({ ...hydrology, design_head: parseFloat(e.target.value) })}
                            />
                            <ModernInput
                                label="Design Flow (m³/s)"
                                type="number"
                                value={hydrology.design_flow}
                                onChange={(e: any) => setHydrology({ ...hydrology, design_flow: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                <Info className="w-4 h-4 text-cyan-500" />
                                Ecological Constraints
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ModernInput
                                    label="Min Operating Flow"
                                    type="number"
                                    value={hydrology.min_flow}
                                    onChange={(e: any) => setHydrology({ ...hydrology, min_flow: parseFloat(e.target.value) })}
                                />
                                <ModernInput
                                    label="Ecological Flow (Qmin)"
                                    type="number"
                                    value={hydrology.ecological_flow}
                                    onChange={(e: any) => setHydrology({ ...hydrology, ecological_flow: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Flow Duration Curve (FDC)" icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}>
                    <div className="h-64 flex flex-col items-center justify-center border border-white/5 bg-black/40 rounded-2xl">
                        <div className="text-cyan-400/20 mb-4 animate-pulse">
                            <Waves className="w-16 h-16" />
                        </div>
                        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">FDC Mapping UI - COMING SOON</p>
                        <p className="text-[8px] text-slate-700 font-mono mt-1 italic">Integration with Global Hydrological Database pending</p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
