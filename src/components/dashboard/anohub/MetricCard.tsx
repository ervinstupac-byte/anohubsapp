import React from 'react';

interface MetricCardProps {
    title: string;
    value: string;
    unit: string;
    subtitle: string;
    chart?: React.ReactNode;
    statusColor?: string; // Optional accent color (e.g. 'text-cyan-400')
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, subtitle, chart, statusColor = 'text-cyan-400' }) => {
    const isAmber = statusColor.includes('amber');
    const glowClass = isAmber ? 'bloom-glow-amber' : 'bloom-glow-cyan';
    const accentColor = isAmber ? 'text-amber-400' : 'text-cyan-400';

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg relative overflow-hidden backdrop-blur-md group h-full flex flex-col justify-between metallic-border hover:border-cyan-500/50 transition-all duration-300 min-h-0">
            {/* Corner Industrial Accent */}
            <div className={`absolute top-0 right-0 w-12 h-12 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity`}>
                <svg viewBox="0 0 100 100" className={`w-full h-full ${isAmber ? 'fill-amber-500' : 'fill-cyan-500'}`}>
                    <path d="M0 0 L100 0 L100 100 L80 100 L0 20 Z" />
                </svg>
            </div>

            <div className="relative z-10 w-full min-h-0">
                <h3 className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <div className={`w-1 h-3 ${isAmber ? 'bg-amber-500' : 'bg-cyan-500'} rounded-full`} />
                    {title}
                </h3>

                <div className="flex flex-col gap-0.5 min-h-0">
                    <div className="flex items-baseline gap-1">
                        <span className={`text-[clamp(1.2rem,2.5vh,2rem)] font-black font-mono tracking-tighter ${accentColor} ${glowClass} truncate leading-none`}>
                            {value}
                        </span>
                        <span className="text-[clamp(8px,0.8vh,10px)] font-black text-slate-500 uppercase tracking-widest">
                            {unit}
                        </span>
                    </div>
                    <div className="text-[clamp(7px,0.8vh,9px)] text-slate-400 font-mono font-bold uppercase tracking-wider opacity-60 truncate">
                        {subtitle}
                    </div>
                </div>
            </div>

            {chart && (
                <div className="mt-4 h-12 w-full relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                    {chart}
                </div>
            )}

            {/* Bottom Glow Stripe */}
            <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${isAmber ? 'bg-amber-500/30' : 'bg-cyan-500/30'} ${glowClass}`} />
        </div>
    );
};
