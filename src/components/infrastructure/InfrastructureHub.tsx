import React from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
const PlantMaster = React.lazy(() => import('./PlantMaster.tsx').then(m => ({ default: m.PlantMaster })));
const BidEvaluator = React.lazy(() => import('./BidEvaluator.tsx').then(m => ({ default: m.BidEvaluator })));
const HydrologyLab = React.lazy(() => import('./HydrologyLab.tsx').then(m => ({ default: m.HydrologyLab })));
import { Spinner } from '../../shared/components/ui/Spinner';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { ModuleFallback } from '../../shared/components/ui/ModuleFallback';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { Database, Factory, Droplets, HardHat } from 'lucide-react';

export const InfrastructureHub: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const tabs = [
        { path: 'plant-master', label: 'Plant Master', icon: <Database /> },
        { path: 'bid-evaluator', label: 'Bid Evaluator', icon: <Factory /> },
        { path: 'hydrology-lab', label: 'Hydrology Lab', icon: <Droplets /> },
    ];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                    Infrastructure <span className="text-cyan-400">Command</span>
                    <HardHat className="text-cyan-400 w-10 h-10" />
                </h1>
                <p className="text-slate-500 font-mono text-xs tracking-[0.3em] uppercase">Genesis Configuration & Multi-Site Management</p>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex gap-4 border-b border-white/5 pb-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname.includes(tab.path);
                    return (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all ${isActive
                                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                                }`}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { className: 'w-4 h-4' })}
                            <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8">
                <ErrorBoundary fallback={<ModuleFallback title="Infrastructure Module Error" icon="Ban" />}>
                    <React.Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
                        <Routes>
                            <Route path="/" element={<PlantMaster />} />
                            <Route path="plant-master" element={<PlantMaster />} />
                            <Route path="bid-evaluator" element={<BidEvaluator />} />
                            <Route path="hydrology-lab" element={<HydrologyLab />} />
                        </Routes>
                    </React.Suspense>
                </ErrorBoundary>
            </div>
        </div>
    );
};
