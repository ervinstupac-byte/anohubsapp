import React, { useEffect, Suspense } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSovereignSync } from '../hooks/useSovereignSync';
const ScadaCore = React.lazy(() => import('./dashboard/ScadaCore').then(m => ({ default: m.ScadaCore })));
const ExecutiveWarRoom = React.lazy(() => import('./dashboard/ExecutiveWarRoom').then(m => ({ default: m.ExecutiveWarRoom })));
const FinancialHealthPanel = React.lazy(() => import('./dashboard/FinancialHealthPanel').then(m => ({ default: m.FinancialHealthPanel })));
const ForensicDashboard = React.lazy(() => import('./forensics/ForensicDashboard').then(m => ({ default: m.ForensicDashboard })));
import { EmergencyOverlay } from './ui/EmergencyOverlay';
import { ResonanceAudioSystem } from './ui/ResonanceAudioSystem';
import { Target } from 'lucide-react';

export const DetachedModuleLayout: React.FC = () => {
    const { moduleId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isFocusMode = searchParams.get('focus') === 'true';
    
    // NC-9000: Activate Sync Listener
    const { lastSync } = useSovereignSync(true);

    // NC-9100: Context-Aware Titles & Persistence
    useEffect(() => {
        if (!moduleId) return;
        
        // 1. Title
        document.title = `COMMAND | ${moduleId.toUpperCase()} X-RAY`;

        // 2. Persistence (Restore)
        const saved = localStorage.getItem(`detach_layout_${moduleId}`);
        if (saved) {
            try {
                const { width, height, left, top } = JSON.parse(saved);
                if (window.opener && width && height) {
                    window.resizeTo(width, height);
                    window.moveTo(left, top);
                }
            } catch (e) { /* Ignore corruption */ }
        }

        // 3. Persistence (Save)
        const saveState = () => {
            const state = {
                width: window.outerWidth,
                height: window.outerHeight,
                left: window.screenX,
                top: window.screenY
            };
            localStorage.setItem(`detach_layout_${moduleId}`, JSON.stringify(state));
        };

        window.addEventListener('beforeunload', saveState);
        // Periodic save (every 5s) to capture moves without close
        const interval = setInterval(saveState, 5000);

        return () => {
            window.removeEventListener('beforeunload', saveState);
            clearInterval(interval);
            saveState();
        };
    }, [moduleId]);

    // Minimalist container - Glassmorphism intact but isolated
    return (
        <div className="w-screen h-screen bg-slate-950 text-slate-200 overflow-auto flex flex-col relative">
             {/* NC-9100: Sync Heartbeat & NC-9300: Commander Focus */}
             <div className="fixed top-4 right-4 z-50 flex items-center gap-3 pointer-events-auto opacity-90 hover:opacity-100 transition-opacity">
                 {/* Commander Focus */}
                 <button
                    onClick={() => window.opener?.focus()}
                    className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 transition-all"
                    title="Pull Focus to Commander"
                 >
                    <Target className="w-4 h-4" />
                 </button>

                 {/* Sync Indicator */}
                 <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-sm">
                     <div key={lastSync} className={`w-2 h-2 rounded-full ${lastSync > 0 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-700'}`} />
                     <span className="text-[10px] font-mono text-slate-500">
                         SYNC: {lastSync > 0 ? 'LINKED' : 'WAITING'}
                     </span>
                 </div>
             </div>

             {/* NC-9300: Global Emergency Overlay */}
             <EmergencyOverlay />
             <ResonanceAudioSystem />

             <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Initializing Module Link...</div>}>
                 {moduleId === 'scada' && (
                     <div className="flex-1 p-4">
                         <ScadaCore focusMode={isFocusMode} />
                     </div>
                 )}
                 {moduleId === 'war-room' && (
                     <div className="flex-1 p-4">
                         <ExecutiveWarRoom />
                     </div>
                 )}
                 {moduleId === 'financial' && (
                     <div className="flex-1 p-4">
                         <FinancialHealthPanel />
                     </div>
                 )}
                 {moduleId === 'forensics' && (
                     <div className="flex-1 p-4">
                         <ForensicDashboard />
                     </div>
                 )}
             </Suspense>
             
             {/* 404 / Loading */}
             {!['scada', 'war-room', 'financial', 'forensics'].includes(moduleId || '') && (
                 <div className="flex items-center justify-center h-full text-red-500 font-mono animate-pulse">
                     [SYSTEM ERROR]: MODULE '{moduleId}' NOT DETACHABLE
                 </div>
             )}
        </div>
    );
};
