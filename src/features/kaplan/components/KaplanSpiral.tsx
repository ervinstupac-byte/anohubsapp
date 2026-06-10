import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const KaplanSpiral: React.FC = () => {
  // Using main dash as a placeholder until specific Kaplan image is provided
  const backgroundImage = '/assets/pic.s_Background/main dash.jpg';

  const [bladeCount, setBladeCount] = useState<number>(5);
  const [spiralMaterial, setSpiralMaterial] = useState<'CONCRETE' | 'METAL'>('CONCRETE');

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden flex flex-col p-6 md:p-12 w-full">
      {/* Background Image Layer */}
      <div 
        key={backgroundImage}
        className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat transition-transform duration-1000 scale-105 animate-subtle-zoom" 
        style={{ backgroundImage: `url('${backgroundImage}')` }} 
      />
      {/* GLOBAL BLUR & OPAQUE EFFECT (over the whole screen) */}
      <div className="absolute inset-0 z-0 backdrop-blur-sm bg-slate-950/30 pointer-events-none" />
      
      {/* Dark Gradient Overlay for readability - weakened */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

      {/* Top Configuration Menu */}
      <div className="relative z-20 w-full flex flex-col items-center gap-4 mb-8">
        {/* Spiral Material Selection */}
        <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 p-1.5 rounded-xl flex gap-1">
            <button
                onClick={() => setSpiralMaterial('CONCRETE')}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-all ${
                    spiralMaterial === 'CONCRETE' 
                    ? 'bg-cyan-500/80 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)] border border-cyan-400' 
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
            >
                Concrete Spiral (Betonska)
            </button>
            <button
                onClick={() => setSpiralMaterial('METAL')}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-all ${
                    spiralMaterial === 'METAL' 
                    ? 'bg-amber-500/80 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)] border border-amber-400' 
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
            >
                Metal Spiral (Metalna)
            </button>
        </div>

        {/* Blade Count Selection */}
        <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex gap-2">
            {[3, 4, 5, 6, 7, 8].map(num => (
                <button
                    key={num}
                    onClick={() => setBladeCount(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
                        bladeCount === num 
                        ? 'bg-cyan-500/80 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105 border border-cyan-400' 
                        : 'bg-slate-900/30 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                >
                    {num} Blades
                </button>
            ))}
        </div>
      </div>

      {/* Content Container - Full Width, No Box Background */}
      <motion.div 
        key={`content-${bladeCount}-${spiralMaterial}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full flex-grow flex flex-col mt-4"
      >
        <h2 className="text-3xl md:text-4xl font-black mb-10 text-white tracking-widest uppercase text-center shadow-black drop-shadow-md">
          Kaplan — <span className="text-cyan-400">Spiral</span> 
          <span className="block text-sm font-mono text-slate-400 tracking-normal mt-2">({bladeCount}-Blade / {spiralMaterial} Casing)</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full flex-grow">
          <div className="space-y-6">
            <h3 className="font-bold text-amber-400 uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-3">Rated Parameters ({spiralMaterial})</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Rated Power</span>
                <span className="font-black text-white text-lg">{spiralMaterial === 'CONCRETE' ? '35.0' : '22.5'} <span className="text-cyan-500 text-sm">MW</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Rated Net Head</span>
                <span className="font-black text-white text-lg">{spiralMaterial === 'CONCRETE' ? '25.0' : '40.0'} <span className="text-cyan-500 text-sm">m</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Rated Flow Rate</span>
                <span className="font-black text-white text-lg">{spiralMaterial === 'CONCRETE' ? '150.0' : '65.0'} <span className="text-cyan-500 text-sm">m³/s</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Casing Weight</span>
                <span className="font-black text-white text-lg">{spiralMaterial === 'CONCRETE' ? 'N/A' : '45,000'} <span className="text-cyan-500 text-sm">kg</span></span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-bold text-amber-400 uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-3">Key Components ({bladeCount} Blades)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Runner Hub Assembly</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">28,500 <span className="text-sm text-slate-500">kg</span></div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Adjustable Blades</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">{bladeCount} <span className="text-sm text-slate-500">units</span></div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Guide Vanes</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">24 <span className="text-sm text-slate-500">units</span></div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Spiral Material Specs</div>
                <div className="font-black text-white text-[15px] leading-tight group-hover:text-cyan-400 transition-colors">{spiralMaterial === 'CONCRETE' ? 'Reinforced Concrete Structure' : 'Welded Steel Plates'}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KaplanSpiral;
