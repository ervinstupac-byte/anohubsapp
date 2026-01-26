/**
 * ServiceCountdown Component
 * Visual countdown bars for maintenance items
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ServiceItem {
    name: string;
    hoursRemaining: number;
    maxHours: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ServiceCountdownProps {
    items: ServiceItem[];
}

export const ServiceCountdown: React.FC<ServiceCountdownProps> = ({ items }) => {
    const getUrgencyColor = (urgency: string): string => {
        switch (urgency) {
            case 'CRITICAL': return 'bg-red-500';
            case 'HIGH': return 'bg-orange-500';
            case 'MEDIUM': return 'bg-yellow-500';
            default: return 'bg-emerald-500';
        }
    };

    const getUrgencyBorder = (urgency: string): string => {
        switch (urgency) {
            case 'CRITICAL': return 'border-red-500/30';
            case 'HIGH': return 'border-orange-500/30';
            case 'MEDIUM': return 'border-yellow-500/30';
            default: return 'border-emerald-500/30';
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-6">Service Countdown</h3>

            <div className="space-y-4">
                {items.map((item, idx) => {
                    const percentage = (item.hoursRemaining / item.maxHours) * 100;

                    return (
                        <motion.div
                            key={idx}
                            className={`bg-slate-800 border ${getUrgencyBorder(item.urgency)} rounded-lg p-4`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="flex justify-between mb-3">
                                <span className="text-white font-bold">{item.name}</span>
                                <span className="text-slate-400 font-mono text-sm">
                                    {item.hoursRemaining}h / {item.maxHours}h
                                </span>
                            </div>

                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${getUrgencyColor(item.urgency)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                                />
                            </div>

                            {item.urgency === 'CRITICAL' && (
                                <div className="mt-3 text-xs text-red-400 flex items-center gap-1">
                                    <span>🚨</span>
                                    <span>URGENT: Schedule maintenance immediately</span>
                                </div>
                            )}

                            {item.urgency === 'HIGH' && (
                                <div className="mt-3 text-xs text-orange-400 flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>HIGH: Plan maintenance within 2 weeks</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
