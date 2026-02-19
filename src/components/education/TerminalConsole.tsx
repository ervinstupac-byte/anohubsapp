import React, { useRef, useEffect } from 'react';
import { useConsoleMonitor } from '../../hooks/useConsoleMonitor';
import { Terminal, AlertTriangle, Info, Bug, Server } from 'lucide-react';

export const TerminalConsole: React.FC = () => {
    const logs = useConsoleMonitor();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic (optional, disabled for now as logs are prepended)
    // useEffect(() => {
    //     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    // }, [logs]);

    return (
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs h-full flex flex-col">
            <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Terminal className="w-4 h-4" /> System Output
            </h3>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 bg-black/50 p-2 rounded border border-slate-900 font-mono text-[10px]">
                {logs.length === 0 && (
                    <div className="text-slate-600 italic">No logs captured yet...</div>
                )}
                
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2 items-start hover:bg-white/5 p-0.5 rounded">
                        <span className="text-slate-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                            <span className="text-slate-600">.{String(new Date(log.timestamp).getMilliseconds()).padStart(3, '0')}</span>
                        </span>
                        
                        <span className={`shrink-0 font-bold w-12 text-right ${
                            log.level === 'ERROR' ? 'text-red-500' :
                            log.level === 'WARN' ? 'text-amber-500' :
                            log.level === 'SYSTEM' ? 'text-purple-400' :
                            log.level === 'DEBUG' ? 'text-slate-500' :
                            'text-emerald-400'
                        }`}>
                            {log.level}
                        </span>

                        <span className="text-slate-300 break-all">
                            {log.source && <span className="text-slate-500 mr-1">[{log.source}]</span>}
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-600">
                <span>BUFFER: {logs.length}/200</span>
                <span>TTY: /dev/pts/0</span>
            </div>
        </div>
    );
};
