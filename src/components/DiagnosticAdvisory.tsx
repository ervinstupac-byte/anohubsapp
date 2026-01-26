import React from 'react';

export default function DiagnosticAdvisory({ title, message, etaFormula = true }: { title: string; message: string; etaFormula?: boolean }) {
  return (
    <div className="diagnostic-advisory fixed right-6 bottom-6 w-72 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded p-3 text-sm text-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-slate-100">{title}</div>
        <div className="text-xs text-slate-400">Advisory</div>
      </div>
      <div className="mt-2 text-slate-300">{message}</div>
      {etaFormula && (
        <div className="mt-3 text-xs text-slate-400 font-mono bg-black/10 p-2 rounded">
          η = P / (ρ · g · Q · H)  <br />
          ρ = 1000 kg/m³, g = 9.81 m/s²
        </div>
      )}
    </div>
  );
}
