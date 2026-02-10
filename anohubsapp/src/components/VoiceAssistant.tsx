import React from 'react';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext.tsx';

export const VoiceAssistant: React.FC = () => {
    const { isListening, isProcessing, startAssistant, stopAssistant } = useVoiceAssistant();

    if (!isListening) {
        return (
            <button
                onClick={startAssistant}
                className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 transition-all z-50 group"
            >
                <span className="text-2xl group-hover:animate-pulse">🎙️</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative">
                {/* Pulsing Visualizer */}
                <div className={`absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-[2000ms] ${isProcessing ? 'bg-cyan-500/40' : ''}`}></div>
                <div className={`w-32 h-32 rounded-full border-4 ${isProcessing ? 'border-cyan-500 animate-pulse' : 'border-emerald-500'} flex items-center justify-center relative z-10 bg-slate-900 shadow-[0_0_50px_rgba(16,185,129,0.3)]`}>
                    <div className="flex gap-1.5 items-end h-8">
                        {[0.4, 0.7, 1, 0.6, 0.8].map((h, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full ${isProcessing ? 'bg-cyan-500' : 'bg-emerald-500'} animate-bounce`}
                                style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center space-y-4">
                <h3 className={`text-2xl font-black uppercase tracking-widest ${isProcessing ? 'text-cyan-400' : 'text-white'}`}>
                    {isProcessing ? 'MISAONI PROCES...' : 'ANO AGENT SLUŠA'}
                </h3>
                <p className="text-slate-400 font-mono text-sm tracking-tight max-w-xs mx-auto italic">
                    "Recite komandu nakon wake-worda: ANO AGENT"
                </p>

                <button
                    onClick={stopAssistant}
                    className="mt-8 px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/20"
                >
                    DEAKTIVIRAJ
                </button>
            </div>

            {/* Hint Box (Mobile optimized) */}
            <div className="absolute bottom-12 left-6 right-6 p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Primjeri komandi:</p>
                <ul className="text-xs text-slate-300 space-y-2 font-light">
                    <li>• "Ano Agent, zabilježi vibraciju na ležaju A od 0.05"</li>
                    <li>• "Ano Agent, koja je zadnja mjera ekscentriciteta?"</li>
                </ul>
            </div>
        </div>
    );
};
