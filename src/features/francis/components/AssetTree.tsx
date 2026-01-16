import React from 'react';
import { motion } from 'framer-motion';
import { useFrancisStore, FrancisComponentId } from '../store/useFrancisStore';
import { Activity, Zap, Droplets, ShieldCheck, Settings, Wind, Disc } from 'lucide-react';

interface AssetNode {
    id: FrancisComponentId;
    label: string;
    surgicalId: string;
    icon: React.ReactNode;
}

const assets: AssetNode[] = [
    { id: 'generator', surgicalId: 'group-generator', label: 'Generator', icon: <Zap className="w-4 h-4" /> },
    { id: 'miv', surgicalId: 'group-miv', label: 'Main Inlet Valve', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'spiral_case', surgicalId: 'group-spiral-case', label: 'Spiral Case', icon: <Droplets className="w-4 h-4" /> },
    { id: 'runner', surgicalId: 'group-runner', label: 'Francis Runner', icon: <Disc className="w-4 h-4" /> },
    { id: 'shaft_seal', surgicalId: 'group-seal', label: 'Shaft Seal', icon: <Activity className="w-4 h-4" /> },
    { id: 'hpu', surgicalId: 'group-hpu', label: 'HPU System', icon: <Settings className="w-4 h-4" /> },
    // DRAFT TUBE NOT IN REQUESTED LIST BUT KEEPING FOR COMPLETENESS, MAPPED TO NULL OR PLACEHOLDER IF NEEDED
];

export const AssetTree: React.FC = () => {
    const { activeAssetId, setActiveAsset } = useFrancisStore();

    const handleAssetClick = (asset: AssetNode) => {
        console.log(`Active ID: ${asset.surgicalId}`); // Mandatory Verification Log
        setActiveAsset(asset.id);
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-slate-900/40 backdrop-blur-md border-r border-white/5 h-full overflow-y-auto">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/50 mb-4 px-2">Surgical Index</h3>

            <div className="space-y-1">
                {assets.map((asset) => {
                    const isActive = activeAssetId === asset.id;
                    return (
                        <motion.button
                            key={asset.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAssetClick(asset)}
                            className={`w-full flex items-center justify-between p-3 rounded-md transition-all border group ${isActive
                                ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                                : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600 group-hover:bg-slate-400'}`} />
                                <span className="text-xs font-bold tracking-tight uppercase">{asset.label}</span>
                            </div>
                            <span className="text-[10px] font-mono opacity-30 group-hover:opacity-60 transition-opacity">{asset.surgicalId}</span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-auto pt-6 px-2">
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
                    <p className="text-[9px] text-cyan-500/60 font-mono leading-relaxed">
                        MANUAL_OVERRIDE: ACTIVE<br />
                        PROTOCOL: NC-4.6
                    </p>
                </div>
            </div>
        </div>
    );
};
