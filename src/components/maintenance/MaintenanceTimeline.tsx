import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { useMaintenancePrediction, MaintenanceEvent } from '../../features/maintenance/hooks/useMaintenancePrediction';

export const MaintenanceTimeline: React.FC = () => {
    const events = useMaintenancePrediction();

    return (
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Predictive Maintenance Timeline</h3>
            </div>

            <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-cyan-500/50 via-slate-700/30 to-transparent"></div>

                {events.map((event, index) => {
                    const isUrgent = event.urgency === 'CRITICAL' || event.urgency === 'HIGH';
                    const colorClass = isUrgent ? 'text-red-400' : 'text-cyan-400';
                    const bgClass = isUrgent ? 'bg-red-500' : 'bg-cyan-500';

                    return (
                        <div key={event.id} className="relative flex gap-6 group">
                            {/* Dot */}
                            <div className={`
                                z-10 w-10 h-10 rounded-full border-4 border-slate-900 flex items-center justify-center shrink-0 shadow-xl transition-all duration-500
                                ${isUrgent ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-800 border-slate-700 group-hover:bg-cyan-600'}
                            `}>
                                <Wrench className={`w-4 h-4 ${isUrgent ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            </div>

                            {/* Content Card */}
                            <div className={`
                                flex-1 rounded-xl border p-4 transition-all duration-300
                                ${isUrgent
                                    ? 'bg-red-950/20 border-red-500/30 hover:bg-red-900/30'
                                    : 'bg-slate-800/40 border-white/5 hover:border-cyan-500/30 hover:bg-slate-700/40'}
                            `}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-white font-bold text-lg leading-none mb-1">{event.componentName}</h4>
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                            <span className="bg-slate-950/50 px-2 py-0.5 rounded text-[10px] uppercase">{event.reason}</span>
                                            <span>•</span>
                                            <span>Confidence: {event.confidence}%</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-2xl font-black tabular-nums ${colorClass}`}>
                                            {event.daysRemaining} <span className="text-xs font-medium text-slate-500">days</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                            {format(event.predictedDate, 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar / Urgency Indicator */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">
                                        <span>Wear Accumulation</span>
                                        <span className={colorClass}>{event.urgency} Priority</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${bgClass} ${isUrgent ? 'animate-pulse' : ''}`}
                                            style={{ width: `${Math.max(5, 100 - (event.daysRemaining / (event.daysRemaining + 30)) * 100)}%` }} // Rough accumulation viz
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
