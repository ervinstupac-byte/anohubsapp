import React from 'react';

interface LoadingShimmerProps {
    className?: string;
}

export const LoadingShimmer: React.FC<LoadingShimmerProps> = ({ className = '' }) => {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-950 p-12 ${className}`}>
            <div className="w-full max-w-4xl space-y-8">
                {/* Header Shimmer */}
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-3">
                        <div className="h-10 w-64 bg-slate-900 border border-white/5 rounded-none shimmer-overlay"></div>
                        <div className="h-4 w-48 bg-slate-900/50 rounded-none shimmer-overlay opacity-50"></div>
                    </div>
                    <div className="h-12 w-12 bg-slate-900 border border-white/5 rounded-none shimmer-overlay"></div>
                </div>

                {/* Grid Shimmer */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 bg-slate-900/40 border border-white/5 rounded-none p-6 space-y-4 shimmer-overlay">
                            <div className="h-6 w-1/3 bg-slate-800 rounded-none"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-slate-800/50 rounded-none"></div>
                                <div className="h-3 w-4/5 bg-slate-800/50 rounded-none"></div>
                            </div>
                            <div className="pt-4 flex gap-2">
                                <div className="h-8 w-20 bg-slate-800 rounded-none"></div>
                                <div className="h-8 w-20 bg-slate-800 rounded-none"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Shimmer */}
                <div className="mt-12 flex justify-center">
                    <div className="h-4 w-32 bg-slate-900/50 rounded-none shimmer-overlay"></div>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
                <div className="text-[10px] font-mono font-black text-cyan-500 tracking-[0.5em]">
                    SYNCHRONIZING NEURAL ASSET DATA
                </div>
                <div className="w-64 h-1 bg-slate-900 rounded-none overflow-hidden">
                    <div className="h-full bg-cyan-500/50 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
    );
};
