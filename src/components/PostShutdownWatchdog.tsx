// Post-Shutdown Watchdog
// Monitors thermal inertia after stop to prevent bearing seizure

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Bell, ThermometerSnowflake } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';

export const PostShutdownWatchdog: React.FC = () => {
    // Simulated State
    const [isActive, setIsActive] = useState(false);
    const [machineStatus, setMachineStatus] = useState<'RUNNING' | 'STOPPED'>('RUNNING');
    const [currentTemp, setCurrentTemp] = useState(55); // Operating temp
    const [tempHistory, setTempHistory] = useState<number[]>([55]);
    const [alarmTriggered, setAlarmTriggered] = useState(false);

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (machineStatus === 'STOPPED') {
                setIsActive(true);

                // Simulate "Thermal Surge" scenario (Example 3 from user)
                // Temp starts rising AFTER stop due to heat soak / lack of cooling flow
                setTempHistory(prev => {
                    const last = prev[prev.length - 1];
                    // Simulate dangerous rise: +3 degrees per tick (demo speed)
                    // In real life, >2 deg/min is dangerous
                    const newTemp = (!alarmTriggered && prev.length > 5) ? last + 3 : last - 0.5;
                    return [...prev.slice(-10), newTemp];
                });

                setCurrentTemp(prev => {
                    // Trigger logic
                    const rateOfRise = tempHistory.length > 2 ? tempHistory[tempHistory.length - 1] - tempHistory[tempHistory.length - 2] : 0;
                    if (rateOfRise > 2) {
                        setAlarmTriggered(true);
                        playAlarmSound();
                    }
                    return tempHistory[tempHistory.length - 1];
                });
            }
        }, 2000); // 2 sec ticks for demo

        return () => clearInterval(interval);
    }, [machineStatus, tempHistory, alarmTriggered]);

    const playAlarmSound = () => {
        // Simple browser beep simulation
        console.log("🚨 BEEP! BEEP! THERMAL INERTIA ALARM! 🚨");
    };

    const handleStopMachine = () => {
        setMachineStatus('STOPPED');
        setTempHistory([55, 55, 55]); // Reset baseline
        setAlarmTriggered(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                    >
                        <GlassCard className={`p-4 w-80 border-l-4 shadow-2xl backdrop-blur-xl ${alarmTriggered ? 'border-red-500 bg-red-950/80' : 'border-emerald-500 bg-slate-900/80'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`text-xs font-black uppercase flex items-center gap-2 ${alarmTriggered ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                                    {alarmTriggered ? <Flame className="w-4 h-4" /> : <ThermometerSnowflake className="w-4 h-4" />}
                                    Post-Shutdown Watchdog
                                </h4>
                                <div className="text-[10px] font-mono text-slate-400">T+12 min</div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-black text-white">{currentTemp.toFixed(1)}°C</div>
                                    <div className="text-[10px] text-slate-400">Bearing Temp</div>
                                </div>

                                {alarmTriggered ? (
                                    <div className="p-2 bg-red-600 rounded-full animate-ping">
                                        <Bell className="text-white w-6 h-6" />
                                    </div>
                                ) : (
                                    <div className="text-xs text-emerald-400 font-bold">COOLING ACTIVE</div>
                                )}
                            </div>

                            {alarmTriggered && (
                                <div className="mt-2 text-xs font-bold text-red-200 bg-red-900/50 p-2 rounded border border-red-500/50">
                                    HITNO: Termička inercija raste (&gt;2°C/min)! Moguća devastacija osovine.
                                </div>
                            )}

                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DEMO CONTROL */}
            {!isActive && (
                <button
                    onClick={handleStopMachine}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow-lg text-xs font-bold hover:bg-red-500 transition-colors"
                >
                    SIMULATE STOP & THERMAL SURGE
                </button>
            )}
        </div>
    );
};
