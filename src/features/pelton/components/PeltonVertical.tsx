import React from 'react';

export const PeltonVertical: React.FC = () => {
  return (
    <div className="p-6 bg-[#071017] rounded border border-slate-800">
      <h2 className="text-xl font-bold mb-6 text-white">Pelton — Vertical (2x PTV6 - 1187 - 396-I)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-amber-400 uppercase tracking-wider text-sm">Rated Parameters</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Rated Net Head (Hₙ)</span>
              <span className="font-mono text-white">159.70 m</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Rated Discharge (Qₙ)</span>
              <span className="font-mono text-white">3.335 m³/s</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Rated Turbine Output (Pₜ)</span>
              <span className="font-mono text-white">4758 kW</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Rated Speed (nₜ)</span>
              <span className="font-mono text-white">428.57 rpm</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Jet Circle Diameter (D₁)</span>
              <span className="font-mono text-white">1187 mm</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-amber-400 uppercase tracking-wider text-sm">Component Weights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Turbine</span>
              <span className="font-mono text-white">~12 000 kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Runner</span>
              <span className="font-mono text-white">~1 800 kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Generator</span>
              <span className="font-mono text-white">~30 000 kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
              <span className="text-slate-400 text-sm">Butterfly Valve</span>
              <span className="font-mono text-white">~6 000 kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeltonVertical;
