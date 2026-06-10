import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const PeltonVertical: React.FC = () => {
  // Injector state: 2, 3, 4, 5, 6
  const [injectorCount, setInjectorCount] = useState<number>(6);

  // Determine background based on injector count
  const backgroundImage = injectorCount === 6 
    ? '/assets/pic.s_Background/PeltonVertical_6nozzles.png'
    : '/assets/pic.s_Background/pelton%20Vertikal_x2T.png';

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
      
      {/* Top Injector Menu */}
      <div className="relative z-20 w-full flex justify-center mb-8">
        <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex gap-2">
            {[2, 3, 4, 5, 6].map(num => (
                <button
                    key={num}
                    onClick={() => setInjectorCount(num)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all ${
                        injectorCount === num 
                        ? 'bg-cyan-500/80 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105 border border-cyan-400' 
                        : 'bg-slate-900/30 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                >
                    {num} Injectors
                </button>
            ))}
        </div>
      </div>

      {/* Content Container - Full Width, No Box Background */}
      <motion.div 
        key={`content-${injectorCount}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full flex-grow flex flex-col"
      >
        <h2 className="text-3xl md:text-4xl font-black mb-10 text-white tracking-widest uppercase text-center shadow-black drop-shadow-md">
          Pelton — <span className="text-cyan-400">Vertical</span> 
          <span className="block text-sm font-mono text-slate-400 tracking-normal mt-2">({injectorCount}x Injector Configuration)</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full flex-grow">
          <div className="space-y-6">
            <h3 className="font-bold text-amber-400 uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-3">Rated Parameters ({injectorCount} Jets)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Rated Net Head (Hₙ)</span>
                <span className="font-mono text-white font-bold text-lg">159.70 m</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Rated Discharge (Qₙ)</span>
                <span className="font-mono text-white font-bold text-lg">{(3.335 * (injectorCount / 6)).toFixed(3)} m³/s</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Turbine Output (Pₜ)</span>
                <span className="font-mono text-cyan-400 font-bold text-2xl">{(4758 * (injectorCount / 6)).toFixed(0)} kW</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Rated Speed (nₜ)</span>
                <span className="font-mono text-white font-bold text-lg">428.57 rpm</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Jet Circle (D₁)</span>
                <span className="font-mono text-white font-bold text-lg">1187 mm</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-amber-400 uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-3">Component Weights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Turbine</span>
                <span className="font-mono text-slate-300 text-lg">~12 000 kg</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Runner</span>
                <span className="font-mono text-slate-300 text-lg">~1 800 kg</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Generator</span>
                <span className="font-mono text-slate-300 text-lg">~{(30000 * (injectorCount/6)).toFixed(0)} kg</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Butterfly Valve</span>
                <span className="font-mono text-slate-300 text-lg">~6 000 kg</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PeltonVertical;
