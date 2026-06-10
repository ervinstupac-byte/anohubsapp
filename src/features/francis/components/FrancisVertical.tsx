import React from 'react';
import { motion } from 'framer-motion';

export const FrancisVertical: React.FC = () => {
  const backgroundImage = '/assets/pic.s_Background/VerticalFrancis.png';

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

      {/* Content Container - Full Width, No Box Background */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full flex-grow flex flex-col mt-4"
      >
        <h2 className="text-3xl md:text-4xl font-black mb-10 text-white tracking-widest uppercase text-center shadow-black drop-shadow-md">
          Francis — <span className="text-cyan-400">Vertical</span> 
          <span className="block text-sm font-mono text-slate-400 tracking-normal mt-2">(Reaction Turbine Configuration)</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full flex-grow">
          <div className="space-y-6">
            <h3 className="font-bold text-amber-400 uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-3">Rated Parameters</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Rated Power</span>
                <span className="font-black text-white text-lg">50.8 <span className="text-cyan-500 text-sm">MW</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Rated Net Head</span>
                <span className="font-black text-white text-lg">112 <span className="text-cyan-500 text-sm">m</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Rated Flow Rate</span>
                <span className="font-black text-white text-lg">45.5 <span className="text-cyan-500 text-sm">m³/s</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors rounded-xl border border-white/5 shadow-lg">
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Nominal Speed</span>
                <span className="font-black text-white text-lg">300 <span className="text-cyan-500 text-sm">rpm</span></span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-bold text-amber-400 uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-3">Key Components</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Runner Assembly</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">15,400 <span className="text-sm text-slate-500">kg</span></div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Spiral Case</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">28,500 <span className="text-sm text-slate-500">kg</span></div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Guide Vanes</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">24 <span className="text-sm text-slate-500">units</span></div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5 shadow-lg hover:border-cyan-500/50 transition-all group">
                <div className="text-cyan-500 font-mono text-[10px] uppercase mb-1">Draft Tube</div>
                <div className="font-black text-white text-xl group-hover:text-cyan-400 transition-colors">12,200 <span className="text-sm text-slate-500">kg</span></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FrancisVertical;
