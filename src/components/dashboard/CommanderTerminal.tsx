import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCerebro } from '../../contexts/ProjectContext';
import { Terminal, Shield, Zap, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { ExpertInference } from '../../services/ExpertInference';
import { MaintenanceEngine } from '../../services/MaintenanceEngine';

interface TerminalMessage {
    id: string;
    text: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    timestamp: string;
}

export const CommanderTerminal: React.FC = () => {
    const { state } = useCerebro();
    const [messages, setMessages] = useState<TerminalMessage[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const addMessage = (text: string, type: TerminalMessage['type'] = 'INFO') => {
        const newMessage: TerminalMessage = {
            id: Math.random().toString(36).substring(2, 9),
            text,
            type,
            timestamp: new Date().toLocaleTimeString([], { hour12: false })
        };
        setMessages(prev => [...prev.slice(-15), newMessage]);
    };

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const [cmdName, ...args] = input.trim().toLowerCase().split(' ');
        const param = args.join(' ');

        addMessage(`$ ${input}`, 'INFO');

        if (cmdName === '/explain') {
            if (param) {
                // Specific parameter explanation
                if (param.includes('vibration')) {
                    addMessage("VIBRATION ANALYSIS (ISO 10816-3):", 'SUCCESS');
                    addMessage("Machines < 15MW: Good < 1.1mm/s, Warning > 2.8mm/s, Critical > 4.5mm/s.");
                } else if (param.includes('insulation') || param.includes('megger')) {
                    addMessage("INSULATION RESISTANCE (Megger Law):", 'SUCCESS');
                    addMessage("Formula: R_{min} = kV + 1. For a 11kV machine, min is 12 MOhm.");
                } else if (param.includes('barlow') || param.includes('structural')) {
                    addMessage("BARLOW'S STRUCTURAL AUDIT:", 'SUCCESS');
                    addMessage("Formula: P = (2 * S * t) / D. Safety Factor = MAWP / P_{total}.");
                } else {
                    addMessage(`No specific analysis for: ${param}. Try 'vibration', 'insulation', or 'barlow'.`, 'WARNING');
                }
            } else {
                // General explanation
                const vibLimit = 4.5;
                const kv = state.identity.machineConfig?.ratedPowerMW ? 11 : 6.6;
                addMessage("DR. TURBINE ANALYSIS:", 'SUCCESS');
                addMessage(`1. VIBRATION: Standard ISO 10816-3 specifies Critical as >${vibLimit}mm/s.`);
                addMessage(`2. INSULATION: Megger Law R_{min} = kV + 1. Current required: >${kv + 1} MOhm.`);
                const inferences = ExpertInference.analyze(state);
                addMessage(`3. BARLOW'S LINK (Spiral): Stress = (P * D) / (2 * t). Current Margin: ${inferences.metrics.structuralSafetyMargin.toFixed(1)}%.`);
            }
        } else if (cmdName === '/sop') {
            if (!param) {
                addMessage("Usage: /sop [vibration|bearing|structural]", 'INFO');
            } else {
                const sopCode = param.toUpperCase().includes('VIB') ? 'VIBRATION_CRITICAL' :
                    param.toUpperCase().includes('BEAR') ? 'BEARING_TEMP_CRITICAL' :
                        param.toUpperCase().includes('STRUC') ? 'STRUCTURAL_RISK' : null;
                if (sopCode) {
                    const sop = MaintenanceEngine.getSOP(sopCode);
                    if (sop) {
                        addMessage(`SOP FOR ${sopCode}:`, 'SUCCESS');
                        addMessage(`ACTION: ${sop.action}`);
                        sop.steps.forEach(s => addMessage(`${s.step}. ${s.description}`));
                    } else {
                        addMessage(`SOP for ${sopCode} not found.`, 'WARNING');
                    }
                } else {
                    addMessage(`No SOP found for: ${param}`, 'WARNING');
                }
            }
        } else if (cmdName === '/standard') {
            if (param.includes('10816')) {
                addMessage("ISO 10816-3: Evaluation of machine vibration by measurements on non-rotating parts.", 'INFO');
            } else if (param.includes('60041')) {
                addMessage("IEC 60041: Field acceptance tests to determine the hydraulic performance of hydraulic turbines.", 'INFO');
            } else {
                addMessage("Available Standards: ISO 10816, IEC 60041.", 'INFO');
            }
        } else if (cmdName === '/help') {
            addMessage("AVAILABLE COMMANDS: /explain [param], /sop [type], /standard [code], /status, /clear", 'INFO');
        } else if (cmdName === '/status') {
            const status = (state as any).physics?.status || state.physics.leakageStatus || 'NOMINAL';
            addMessage(`System Status: ${status}. Critical Risks: ${state.specializedState?.activeRisks?.length || 0}`, 'INFO');
        } else if (cmdName === '/clear') {
            setMessages([]);
        } else {
            addMessage(`Unknown command: ${cmdName}. Type /help for assistance.`, 'WARNING');
        }

        setInput('');
    };

    // Proactive AI Logic
    useEffect(() => {
        const structuralLife = state.structural?.remainingLife || 100;
        const energyPrice = state.market?.energyPrice || 85;
        const gridFreq = state.specializedState?.sensors?.gridFrequency || 50;

        if (structuralLife < 85 && structuralLife > 80) {
            addMessage("Commander, Unit 01 is at 82% Health. Recommendation: Maximize output for 2 hours, then initiate cooldown.", 'WARNING');
        }

        if (energyPrice > 120) {
            addMessage(`Market anomaly detected: Energy prices at peak (€${energyPrice.toFixed(2)}/MWh). Optimize for max generation.`, 'SUCCESS');
        }

        if (Math.abs(50 - gridFreq) > 0.2) {
            addMessage(`Severe frequency deviation (${gridFreq.toFixed(2)}Hz). Grid services active. Material aging accelerated by 1.5x.`, 'CRITICAL');
        }
    }, [state.structural?.remainingLife, state.market?.energyPrice, state.specializedState?.sensors?.gridFrequency]);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-4 right-4 z-40 pointer-events-none flex flex-col items-end">
            {/* Toggle Button - Needs Auto Pointer Events */}
            <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    w-12 h-12 rounded-full 
                    bg-black/80 backdrop-blur-md 
                    border border-cyan-500/50 
                    shadow-[0_0_20px_rgba(6,182,212,0.3)]
                    flex items-center justify-center
                    text-cyan-400
                    transition-all duration-300
                    hover:bg-cyan-950/50 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]
                    ${isOpen ? 'bg-cyan-950 border-cyan-400' : ''}
                `}
            >
                <Terminal className="w-5 h-5" />
            </motion.button>

            {/* Terminal Window - Needs Auto Pointer Events */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: -16, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        className="pointer-events-auto w-96 h-80 bg-black/90 backdrop-blur-3xl border border-cyan-500/30 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="px-4 py-2.5 bg-cyan-500/10 border-b border-cyan-500/20 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Commander_Terminal_v4.2</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* LOG AREA */}
                        <div
                            ref={scrollRef}
                            className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar font-mono text-[10px]"
                        >
                            <AnimatePresence initial={false}>
                                {messages.length === 0 ? (
                                    <div className="text-slate-600 animate-pulse">Initializing Neural Link... type /help</div>
                                ) : (
                                    messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-2"
                                        >
                                            <span className="text-slate-500 shrink-0">[{msg.timestamp}]</span>
                                            <span className={`
                                                ${msg.type === 'CRITICAL' ? 'text-red-400' :
                                                    msg.type === 'WARNING' ? 'text-amber-400' :
                                                        msg.type === 'SUCCESS' ? 'text-emerald-400' : 'text-cyan-200'}
                                            `}>
                                                <ChevronRight className="w-2.5 h-2.5 inline mr-1" />
                                                {msg.text}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* COMMAND INPUT */}
                        <form onSubmit={handleCommand} className="p-2 px-4 bg-white/5 border-t border-white/10 flex items-center gap-2">
                            <span className="text-cyan-500 shrink-0">$</span>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-[10px] font-mono text-cyan-200 placeholder:text-cyan-500/30"
                                placeholder="Enter command (e.g. /explain)..."
                                autoFocus
                            />
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
