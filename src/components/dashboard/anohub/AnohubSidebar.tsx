import React from 'react';
import { Settings, AlertTriangle, Activity, BookOpen, ChevronRight, Target } from 'lucide-react';
import { DiagnosticRCA } from '../../automation/DiagnosticRCA';

export const AnohubSidebar: React.FC = () => {
    return (
        <div className="w-20 bg-gradient-to-br from-[#dfe4ea] via-[#a2a8b1] to-[#747d8c] border-r border-slate-500/40 flex flex-col items-center py-6 gap-8 relative z-40 shadow-[8px_0_24px_rgba(0,0,0,0.5)]">
            {/* BRUSHED METAL TEXTURE */}
            <div className="absolute inset-0 opacity-60 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] pointer-events-none mix-blend-overlay" />

            {/* SIDE SHINE */}
            <div className="absolute inset-y-0 left-0 w-[2px] bg-white/40 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-[1px] bg-black/20 pointer-events-none" />

            {/* COLLAPSE TRIGGER */}
            <button className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#f1f2f6] to-[#a4b0be] border-b-4 border-r-4 border-slate-600 shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:from-cyan-400 hover:to-cyan-600 hover:border-cyan-800 transition-all active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 flex items-center justify-center group z-10">
                <ChevronRight className="text-slate-700 group-hover:text-white drop-shadow-md" />
            </button>

            <div className="flex flex-col gap-8 w-full items-center z-10">
                <NavButton icon={Target} color="text-red-500" glow="bloom-glow-red" />
                <NavButton icon={Settings} active color="text-cyan-500" glow="bloom-glow-cyan" />
                <NavButton icon={AlertTriangle} color="text-amber-500" glow="bloom-glow-amber" />
                <NavButton icon={Activity} color="text-emerald-500" glow="bloom-glow-emerald" />
                <NavButton icon={BookOpen} color="text-blue-500" glow="bloom-glow-cyan" />
            </div>

            {/* NC-140 DIAGNOSTIC ENGINE (Pops out when needed) */}
            <div className="absolute left-full top-20 ml-4 w-64 z-50 pointer-events-none">
                {/* Wrapper to allow pointer events on the diagnostic card itself */}
                <div className="pointer-events-auto">
                    <DiagnosticRCA />
                </div>
            </div>

            {/* DECORATIVE ETCHED PLATE */}
            <div className="mt-auto mb-4 opacity-20 pointer-events-none">
                <div className="w-8 h-px bg-black mb-1" />
                <div className="w-4 h-px bg-black ml-auto" />
            </div>
        </div>
    );
};

const NavButton: React.FC<{ icon: React.ElementType, active?: boolean, color?: string, glow?: string }> = ({ icon: Icon, active, color = "text-slate-600", glow = "bloom-glow-cyan" }) => (
    <button className={`relative p-3 transition-all active:scale-90 group pointer-events-auto`}>
        {/* ETCHED BACKDROP */}
        <div className={`absolute inset-0 rounded bg-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-white/10 ${active ? 'bg-cyan-500/5' : ''}`} />

        {/* ICON WITH NEON GLOW */}
        <Icon className={`w-6 h-6 relative z-10 transition-all duration-300 ${active ? `${color} ${glow} drop-shadow-[0_0_8px_currentColor]` : 'text-slate-700 hover:text-slate-900 group-hover:drop-shadow-[0_0_4px_rgba(0,0,0,0.2)]'}`} />

        {/* ACTIVE INDICATOR LAMP */}
        {active && (
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-cyan-400 rounded-r shadow-[4px_0_12px_rgba(34,211,238,0.8)] z-20 bloom-glow-cyan" />
        )}

        {/* TOOLTIP (MOCKED) */}
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-cyan-500/30 z-50">
            SYSTEM_ACCESS_NODE
        </div>
    </button>
);
