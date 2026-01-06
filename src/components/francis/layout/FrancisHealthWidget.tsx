import React from 'react';
import { Award } from 'lucide-react';
import { MaturityBadge } from '../../dashboard/MaturityBadge';

interface FrancisHealthWidgetProps {
    t: any;
    healthScore: number;
    dialColor: string;
    techState: any; // Using any for simplicity as we are moving existing logic, ideally strictly typed
}

export const FrancisHealthWidget: React.FC<FrancisHealthWidgetProps> = ({ t, healthScore, dialColor, techState }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <MaturityBadge state={techState} />

            <div className="flex items-center gap-6 bg-slate-900/70 p-4 rounded-lg border border-slate-700/50 shadow-xl">
                <div
                    className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(0,0,0,0.5)] animate-[pulse-glow_3s_ease-in-out_infinite]"
                    style={{
                        background: `conic-gradient(from 180deg, ${dialColor} 0%, ${dialColor} ${healthScore}%, #334155 ${healthScore}%, #334155 100%)`
                    }}
                >
                    <div className="bg-h-dark w-[80%] h-[80%] rounded-full flex flex-col items-center justify-center relative">
                        <span className="text-2xl font-black text-white">{healthScore}%</span>
                        <span className="text-sm text-slate-500 uppercase">{t('francis.health.label')}</span>
                        {healthScore > 90 && (
                            <div className="absolute -top-1 right-0 text-amber-500 animate-pulse">
                                <Award size={16} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
