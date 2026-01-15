import React from 'react';
import { Bell, User, Settings } from 'lucide-react';

export const AnohubHeader: React.FC = () => {
    return (
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-40">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tighter text-white">
                    ANO<span className="text-cyan-400">HUB</span>
                </h1>
                <div className="h-6 w-px bg-slate-800 mx-4" />
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-500/80 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    COMMAND CENTER
                </div>
            </div>

            <div className="flex items-center gap-4">
                <IconButton icon={Bell} />
                <IconButton icon={User} />
                <IconButton icon={Settings} />
            </div>
        </header>
    );
};

const IconButton: React.FC<{ icon: React.ElementType }> = ({ icon: Icon }) => (
    <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors hover:bg-slate-900 rounded-lg">
        <Icon className="w-5 h-5" />
    </button>
);
