import React from 'react';
import { motion } from 'framer-motion';
import { useFrancisStore } from '../store/useFrancisStore';
import { ChevronRight, Home, Layers } from 'lucide-react';

export const AssetBreadcrumbs: React.FC = () => {
    const { activeAssetId, resetView } = useFrancisStore();

    const getLabel = (id: string | null) => {
        if (!id) return null;
        return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <nav className="flex items-center gap-2 px-6 py-3 bg-slate-900/30 backdrop-blur-md border-b border-white/5 relative z-30">
            <button
                onClick={resetView}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
            >
                <Home className="w-3 h-3" />
                <span>Francis Hub</span>
            </button>

            <ChevronRight className="w-3 h-3 text-slate-700" />

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Layers className="w-3 h-3" />
                <span>Machine Hall NC-4.4</span>
            </div>

            {activeAssetId && (
                <>
                    <ChevronRight className="w-3 h-3 text-slate-700" />
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400"
                    >
                        <span className="px-2 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/20">
                            {getLabel(activeAssetId)}
                        </span>
                    </motion.div>
                </>
            )}
        </nav>
    );
};
