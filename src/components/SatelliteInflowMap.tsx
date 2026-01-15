import React from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';

interface SatelliteInflowMapProps {
    snowCover: number;
    assetName: string;
}

export const SatelliteInflowMap: React.FC<SatelliteInflowMapProps> = ({ snowCover, assetName }) => {
    return (
        <GlassCard title={`Satellite Hydration Analysis - ${assetName}`} className="h-full relative overflow-hidden">
            <div className="mt-4 aspect-video bg-slate-900 rounded-2xl relative overflow-hidden border border-white/5">
                {/* Simulated Terrain Map */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125" />

                {/* SWE / Snow Cover Overlay */}
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                <div
                    className="absolute inset-0 bg-white/20 blur-[40px] mix-blend-screen transition-all duration-1000"
                    style={{
                        clipPath: `circle(${snowCover * 0.8}% at 50% 50%)`,
                        opacity: snowCover / 100
                    }}
                />

                {/* Satellite Artifacts */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-cyan-500/20 absolute rotate-45" />
                    <div className="w-full h-[1px] bg-cyan-500/20 absolute -rotate-45" />
                    <div className="w-32 h-32 border border-cyan-500/40 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-24 h-24 border border-cyan-500/20 rounded-full" />
                    </div>
                </div>

                {/* NASA/ESA Branding */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <span className="text-[8px] font-black text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">SENTINEL-2 LIVE</span>
                    <span className="text-[8px] font-black text-slate-400 bg-black/60 px-2 py-0.5 rounded">SWE SENSOR ACTIVE</span>
                </div>

                {/* Coordinates Overlay */}
                <div className="absolute bottom-4 left-4 font-mono text-[8px] text-slate-500 space-y-1">
                    <p>LAT: 44.3129° N</p>
                    <p>LON: 17.8421° E</p>
                    <p>ALT: 1,420m ASL</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Snow Cover (SWE)</p>
                    <p className="text-xl font-black text-white">{snowCover.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Catchment saturation</p>
                    <p className="text-xl font-black text-cyan-400">OPTIMAL</p>
                </div>
            </div>
        </GlassCard>
    );
};
