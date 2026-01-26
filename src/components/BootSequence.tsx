import React, { useEffect, useState } from 'react';

export type BootSequenceProps = {
    onComplete?: () => void;
    speed?: number;
};

const DEFAULT_MESSAGES = [
    'INITIALIZING ANOHUB PROTOCOL v35.0...',
    'CALIBRATING CEREBRO AI CORE...',
    'CHECKING PENSTOCK PRESSURE...',
    'SERVO OIL PUMPS: ONLINE...',
    'GUIDE VANE LOCKS: RELEASED...',
    'TURBINE BEARING TEMP: NOMINAL...',
    'SYNCHRONIZING WITH GRID...',
    'FREQUENCY LOCK: 50.00 Hz',
    'ACCESS GRANTED.'
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, speed = 150 }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        let idx = 0;
        const t = setInterval(() => {
            setLines(prev => [...prev, DEFAULT_MESSAGES[idx]]);
            idx++;
            if (idx >= DEFAULT_MESSAGES.length) {
                clearInterval(t);
                setTimeout(() => {
                    setFinished(true);
                    onComplete && onComplete();
                }, 800);
            }
        }, speed);
        return () => clearInterval(t);
    }, [onComplete, speed]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-h-dark text-white font-sans">
            <div className="w-full max-w-2xl p-8 border border-h-border bg-h-panel/50 backdrop-blur-md rounded-xl shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-h-dark border border-h-gold/30 flex items-center justify-center overflow-hidden">
                        <img src="/assets/images/logo.svg" alt="AnoHUB Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-h-gold tracking-tighter uppercase">CEREBRO System Boot</h2>
                        <p className="text-xs font-mono text-slate-400">AnoHUB Intelligence Layer Initialization</p>
                    </div>
                </div>
                <div className="bg-black/40 border border-h-border rounded-lg p-5 font-mono text-sm text-cyan-400/90 h-64 overflow-hidden shadow-inner">
                    {lines.map((line, i) => (
                        <div key={i} className="mb-1 animate-fade-in-up">
                            <span className="text-h-gold/50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {`> ${line}`}
                        </div>
                    ))}
                    {finished && (
                        <div className="mt-4 text-h-green font-bold animate-pulse">SYSTEM READY. PROCEEDING TO DASHBOARD...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BootSequence;
