import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Settings,
    Zap,
    Activity,
    Anchor,
    Cpu,
    Info,
    ChevronRight
} from 'lucide-react';

interface GeneratorDetailProps {
    onBack: () => void;
}

const SUB_COMPONENTS = [
    {
        id: 'gen-detail-stator',
        name: 'Stator Core',
        param: 'Air Gap (Zračnost)',
        heritage: 'Odstupanje magnetskog polja ne smije prelaziti 10% kako bi se izbjeglo "struganje" rotora.',
        icon: Cpu
    },
    {
        id: 'gen-detail-excitation',
        name: 'Excitation Box',
        param: 'Voltage Stability',
        heritage: 'Kako čista pobuda osigurava stabilnost mreže bez termičkog preopterećenja namotaja.',
        icon: Zap
    },
    {
        id: 'gen-detail-bearing-de',
        name: 'Bearing (DE)',
        param: 'Vibration Spectrum',
        heritage: 'Razlikovanje mehaničke neuravnoteženosti od električnog debalansa magnetskog polja.',
        icon: Activity
    },
    {
        id: 'gen-detail-foundation',
        name: 'Foundation',
        param: 'Bolt Pre-load',
        heritage: 'Moment pritezanja mora biti uniforman da se spriječi distorzija kućišta generatora.',
        icon: Anchor
    }
];

const GeneratorDetailView: React.FC<GeneratorDetailProps> = ({ onBack }) => {
    const [activeSub, setActiveSub] = useState<string | null>(null);

    const activeData = SUB_COMPONENTS.find(c => c.id === activeSub);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-full bg-[#030708] rounded-3xl border border-cyan-500/20 overflow-hidden flex flex-col"
        >
            {/* HUD Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-b from-cyan-950/20 to-transparent border-b border-cyan-500/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">
                            Generator Unit <span className="text-cyan-500">Drill-Down</span>
                        </h2>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter opacity-70">
                            NC-4.2 Technical Analysis // Horizontal Francis &lt; 5MW
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">System Active</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                {/* SVG Blueprint Area */}
                <div className="flex-[2] relative bg-black/40 rounded-2xl border border-cyan-500/10 p-8 flex items-center justify-center">
                    <svg viewBox="0 0 800 500" className="w-full h-full max-h-[600px]">
                        <defs>
                            <filter id="detail-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        <g fill="none" stroke="#22D3EE" strokeLinecap="round" strokeLinejoin="round">
                            {/* Foundation */}
                            <g
                                onClick={() => setActiveSub('gen-detail-foundation')}
                                onMouseEnter={() => setActiveSub('gen-detail-foundation')}
                                className="cursor-pointer"
                            >
                                <path d="M100 420 L700 420 L720 450 L80 450 Z" strokeWidth={1.5} className="transition-all duration-300" />
                                <path d="M150 420 L150 460 M250 420 L250 460 M550 420 L550 460 M650 420 L650 460" strokeWidth={0.75} />
                                <rect x="100" y="420" width="600" height="30" fill={activeSub === 'gen-detail-foundation' ? '#22D3EE' : 'transparent'} fillOpacity={0.1} className="transition-all duration-300" />
                            </g>

                            {/* Bearing DE */}
                            <g
                                onClick={() => setActiveSub('gen-detail-bearing-de')}
                                onMouseEnter={() => setActiveSub('gen-detail-bearing-de')}
                                className="cursor-pointer"
                            >
                                <rect x="580" y="320" width="80" height="100" strokeWidth={1.5} stroke={activeSub === 'gen-detail-bearing-de' ? '#22D3EE' : '#22D3EE'} />
                                <circle cx="620" cy="370" r="15" strokeWidth={0.75} />
                                <path d="M660 360 L700 360 L710 330 L710 410 L700 380 L660 380" strokeWidth={1.5} />
                                <rect x="580" y="320" width="130" height="100" fill={activeSub === 'gen-detail-bearing-de' ? '#22D3EE' : 'transparent'} fillOpacity={0.1} />
                            </g>

                            {/* Main Stator */}
                            <g
                                onClick={() => setActiveSub('gen-detail-stator')}
                                onMouseEnter={() => setActiveSub('gen-detail-stator')}
                                className="cursor-pointer"
                            >
                                <path d="M200 150 C200 120 600 120 600 150 L600 420 L200 420 Z" strokeWidth={1.5} />
                                <path d="M200 150 L600 150" strokeWidth={0.75} strokeDasharray="4 2" />
                                <path d="M230 180 L570 180 M230 220 L570 220 M230 260 L570 260 M230 300 L570 300 M230 340 L570 340" strokeWidth={0.75} opacity={0.3} />
                                <circle cx="400" cy="285" r="80" strokeWidth={0.75} strokeDasharray="10 5" opacity={0.2} />
                                <rect x="200" y="130" width="400" height="290" fill={activeSub === 'gen-detail-stator' ? '#22D3EE' : 'transparent'} fillOpacity={0.1} />
                            </g>

                            {/* Excitation */}
                            <g
                                onClick={() => setActiveSub('gen-detail-excitation')}
                                onMouseEnter={() => setActiveSub('gen-detail-excitation')}
                                className="cursor-pointer"
                            >
                                <rect x="120" y="240" width="100" height="140" strokeWidth={1.5} />
                                <rect x="135" y="260" width="30" height="5" strokeWidth={0.75} />
                                <rect x="135" y="275" width="30" height="5" strokeWidth={0.75} />
                                <rect x="135" y="290" width="30" height="5" strokeWidth={0.75} />
                                <path d="M120 280 L80 280 L80 340 L120 340" strokeWidth={0.75} strokeDasharray="2 2" />
                                <rect x="120" y="240" width="100" height="140" fill={activeSub === 'gen-detail-excitation' ? '#22D3EE' : 'transparent'} fillOpacity={0.1} />
                            </g>

                            {/* Shaft */}
                            <path d="M150 370 L200 370 M600 370 L580 370" strokeWidth={1.5} strokeDasharray="20 10" opacity={0.5} />
                        </g>
                    </svg>

                    {/* Legend HUD overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-cyan-500/60 font-black tracking-widest uppercase">
                            <div className="w-3 h-[1.5px] bg-cyan-500" /> Main Contours (1.5px)
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-cyan-500/60 font-black tracking-widest uppercase">
                            <div className="w-3 h-[0.75px] bg-cyan-500" /> System Details (0.75px)
                        </div>
                    </div>
                </div>

                {/* Data Card Column */}
                <div className="flex-1 flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        {activeData ? (
                            <motion.div
                                key={activeData.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                                        <activeData.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">{activeData.name}</h3>
                                        <p className="text-xs text-cyan-400 font-bold uppercase tracking-tighter">{activeData.param}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest">
                                            <Settings className="w-3 h-3" />
                                            Engineering Target
                                        </div>
                                        <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                            {activeData.id === 'gen-detail-foundation' && "Uniform foundation bolt torque factor of 850Nm required for structural integrity."}
                                            {activeData.id === 'gen-detail-stator' && "Magnetic Center axial alignment within ±0.05mm to avoid bearing wear."}
                                            {activeData.id === 'gen-detail-excitation' && "Digital excitation curve mapping with 0.1s response latency."}
                                            {activeData.id === 'gen-detail-bearing-de' && "Peak-to-Peak vibration threshold &lt; 2.8mm/s RMS."}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-20">
                                            <Info className="w-8 h-8 text-cyan-400" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2 text-white font-black text-[10px] uppercase tracking-widest">
                                            Heritage Insight
                                        </div>
                                        <p className="text-xs text-cyan-100 italic relative z-10">
                                            "{activeData.heritage}"
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-cyan-500/10">
                                    <button className="w-full flex items-center justify-between p-3 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-tighter rounded-lg hover:bg-cyan-400 transition-all group">
                                        <span>Initiate Diagnostic Scan</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cyan-500/5 border border-dashed border-cyan-500/20 rounded-2xl text-center">
                                <Activity className="w-12 h-12 text-cyan-500/20 mb-4" />
                                <h3 className="text-cyan-500/60 font-black text-sm uppercase tracking-widest">Select Component</h3>
                                <p className="text-[10px] text-cyan-500/40 font-bold mt-2 uppercase">Hover blueprint for detailed telemetry</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="h-10 bg-black/60 border-t border-cyan-500/10 flex items-center px-6 overflow-hidden">
                <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                    {[1, 2, 3].map(i => (
                        <span key={i} className="text-[8px] font-bold text-cyan-500/40 uppercase tracking-[0.2em]">
                            STATOR TEMPERATURE: 42.5°C // BEARING VIB: 1.2mm/s // EXCITATION: 120V DC // LOAD FACTOR: 88% // NC-4.2 COMPLIANT
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default GeneratorDetailView;
