import React from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

interface Alarm {
    id: string;
    description: string;
    severity: string;
}

interface AlarmAckPanelProps {
    alarms: Alarm[];
    onAck: (id: string) => void;
}

export const AlarmAckPanel: React.FC<AlarmAckPanelProps> = ({ alarms, onAck }) => {
    if (alarms.length === 0) return null;

    return (
        <div className="fixed bottom-16 right-6 z-[60] w-80 max-w-[calc(100vw-3rem)] space-y-2">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 animate-pulse" />
                <span>Active Critical Alarms ({alarms.length})</span>
            </div>
            {alarms.map(alarm => (
                <div key={alarm.id} className="bg-red-950/90 backdrop-blur-xl border border-red-500/30 rounded-lg p-5 shadow-2xl animate-in slide-in-from-right-4">
                    <div className="text-[11px] font-bold text-red-400 mb-4 leading-tight">
                        {alarm.description.toUpperCase()}
                    </div>
                    <button
                        onClick={() => onAck(alarm.id)}
                        className="w-full py-4 bg-red-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                        data-testid={`ack-button-${alarm.id}`}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge (ACK)
                    </button>
                </div>
            ))}
        </div>
    );
};
