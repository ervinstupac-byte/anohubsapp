import React from 'react';
import { BackButton } from './BackButton';

const RevitalizationStrategy: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-8">
            <BackButton text="Back to HUB" />
            <div className='text-center'>
                <h2 className="text-3xl font-bold text-white mb-2">HPP Asset Revitalization & Obsolescence Strategy</h2>
                <p className="text-slate-400 mb-8 max-w-3xl mx-auto">A data-driven framework for deciding between life extension and full replacement, minimizing risk and ensuring LCC Optimization by closing the M-E Synergy Gap.</p>
            </div>

            <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">1. Life Extension Analysis (LEA): The Repair vs. Replace Decision</h3>
                    <p className="text-slate-300 mb-4">Introduce the **Systemic Degradation Score**. This score integrates RCFA data, Vibration Baseline deviations, and Historical Outage Costs to determine if a component is truly at its End-of-Life (EOL) or if strategic refurbishment (e.g., advanced welding, material upgrade) is still viable.</p>
                    <div className="p-4 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-lg">
                        <h4 className="font-bold text-cyan-300">Hydro-Prijatelj View:</h4>
                        <p className="text-slate-300 mt-1 text-sm">A full replacement is only acceptable when systemic risk dictates it, not when the market demands it. Our Postulate of Ethics requires a rigorous LCC Optimization analysis before any major CAPEX decision.</p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">2. Obsolescence Risk Matrix (Control Systems)</h3>
                    <p className="text-slate-300 mb-4">A mandatory audit for tracking technological obsolescence is required, focusing primarily on: **SCADA, Governor, and Protection Relays.** The goal is to preemptively close the M-E Synergy Gap caused by outdated technology.</p>
                    <div className="p-4 bg-slate-900/50 border-l-4 border-red-500 rounded-r-lg">
                        <h4 className="font-bold text-red-400">CRITICAL Risk Factor:</h4>
                        <p className="text-slate-300 mt-1 text-sm">The biggest risk is **Documentation Obsolescence**—when the original vendor no longer supports the software or hardware, and the critical knowledge has not been transferred into a living Digital Twin, creating a massive Execution Gap.</p>
                    </div>
                </div>
                
                {/* Section 3 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">3. The Digital Twin Integration for Legacy Assets</h3>
                    <p className="text-slate-300 mb-4">Define the procedure for creating a **"Retrospective Digital Twin"**—using 3D scanning, thermal imaging, and historical documentation to map a Legacy Asset. This is key for accurately modeling hydraulic improvements during revitalization (e.g., installing new runners) and ensuring true LCC Optimization.</p>
                </div>
            </div>

            <div className="mt-10 text-center p-6 bg-cyan-900/50 border border-cyan-500 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-3">Is Your HPP Ready for Retirement or Reinvention?</h3>
                <a href="mailto:info@anohubs.com?subject=Inquiry: Obsolescence Audit" className="inline-block px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors transform hover:scale-105">
                    Schedule an Obsolescence Audit
                </a>
            </div>
        </div>
    );
};

export default RevitalizationStrategy;