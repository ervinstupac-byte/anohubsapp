import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../ui/GlassCard.tsx';
import { ModernButton } from '../ui/ModernButton.tsx';
import { ModernInput } from '../ui/ModernInput.tsx';
import { supabase } from '../../services/supabaseClient.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import { Globe, MapPin, Wind, Thermometer, Droplets, Shield, Zap } from 'lucide-react';
import { PlantMap } from './PlantMap.tsx';

export const PlantMaster: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [plants, setPlants] = useState<any[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('plants').select('*');
        if (data) {
            setPlants(data);
            if (data.length > 0 && !selectedPlant) setSelectedPlant(data[0]);
        }
        setIsLoading(false);
    };

    const handleLocationChange = (lat: number, lng: number) => {
        if (!selectedPlant) return;
        setSelectedPlant({
            ...selectedPlant,
            gps_lat: lat,
            gps_lng: lng
        });
    };

    const handleSave = async () => {
        if (!selectedPlant) return;
        setIsLoading(true);
        const { error } = await supabase
            .from('plants')
            .update({
                location_name: selectedPlant.location_name,
                gps_lat: selectedPlant.gps_lat,
                gps_lng: selectedPlant.gps_lng,
                elevation_masl: selectedPlant.elevation_masl,
                ambient_temp_avg: selectedPlant.ambient_temp_avg,
                humidity_avg: selectedPlant.humidity_avg
            })
            .eq('id', selectedPlant.id);

        if (error) showToast("Error saving plant data", "error");
        else showToast("Plant data synchronized successfully", "success");
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                        Site <span className="text-cyan-400">Genesis</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">
                        Global Infrastructure Node // Geospatial Master
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="flex-1 md:flex-none bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        value={selectedPlant?.id || ''}
                        onChange={(e) => setSelectedPlant(plants.find(p => p.id === e.target.value))}
                    >
                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ModernButton variant="primary" onClick={handleSave} isLoading={isLoading}>Sync Config</ModernButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Overwatch */}
                <div className="lg:col-span-2 h-[450px]">
                    <PlantMap
                        lat={selectedPlant?.gps_lat || 44.0}
                        lng={selectedPlant?.gps_lng || 18.0}
                        onLocationChange={handleLocationChange}
                    />
                </div>

                <div className="space-y-6">
                    <GlassCard title="Geospatial Identity" icon={<Globe className="w-5 h-5 text-cyan-400" />}>
                        <div className="space-y-4">
                            <ModernInput
                                label="Location Name"
                                value={selectedPlant?.location_name || ''}
                                onChange={(e: any) => setSelectedPlant({ ...selectedPlant, location_name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <ModernInput
                                    label="Latitude"
                                    type="number"
                                    value={selectedPlant?.gps_lat || 0}
                                    onChange={(e: any) => setSelectedPlant({ ...selectedPlant, gps_lat: parseFloat(e.target.value) })}
                                />
                                <ModernInput
                                    label="Longitude"
                                    type="number"
                                    value={selectedPlant?.gps_lng || 0}
                                    onChange={(e: any) => setSelectedPlant({ ...selectedPlant, gps_lng: parseFloat(e.target.value) })}
                                />
                            </div>
                            <ModernInput
                                label="Elevation (m.a.s.l)"
                                type="number"
                                value={selectedPlant?.elevation_masl || 0}
                                onChange={(e: any) => setSelectedPlant({ ...selectedPlant, elevation_masl: parseFloat(e.target.value) })}
                            />
                        </div>
                    </GlassCard>

                    <GlassCard title="Linked Assets" icon={<MapPin className="w-5 h-5 text-amber-400" />}>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Turbines</p>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xl font-black text-white">4</span>
                                    <span className="text-[8px] text-slate-500">Units</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Capacity</p>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xl font-black text-white">12.5 <span className="text-[10px]">MW</span></span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard title="Environmental Baseline" icon={<Wind className="w-5 h-5 text-emerald-400" />}>
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Thermometer className="w-3 h-3 text-cyan-400" />
                                    Avg Temperature
                                </span>
                                <span className="text-white font-mono font-bold text-sm">{selectedPlant?.ambient_temp_avg}°C</span>
                            </div>
                            <input
                                type="range" min="0" max="45" step="0.5"
                                value={selectedPlant?.ambient_temp_avg || 15}
                                onChange={(e) => setSelectedPlant({ ...selectedPlant, ambient_temp_avg: parseFloat(e.target.value) })}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Droplets className="w-3 h-3 text-blue-400" />
                                    Avg Humidity
                                </span>
                                <span className="text-white font-mono font-bold text-sm">{selectedPlant?.humidity_avg}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" step="1"
                                value={selectedPlant?.humidity_avg || 60}
                                onChange={(e) => setSelectedPlant({ ...selectedPlant, humidity_avg: parseInt(e.target.value) })}
                                className="w-full accent-blue-500"
                            />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Site Security" icon={<Shield className="w-5 h-5 text-purple-400" />}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                            <span className="text-xs text-slate-300">Intrusion Detection</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                            <span className="text-xs text-slate-300">Access Logging</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Optimal</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <span className="text-xs text-red-400">Fence Integrity</span>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Low</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Energy Forensic" icon={<Zap className="w-5 h-5 text-cyan-400" />}>
                    <div className="space-y-4">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Efficiency Rating</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">92.4%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="w-[92.4%] h-full bg-emerald-500" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed">
                            Site efficiency is within nominal range of ±1.2% compared to historical monthly average.
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
