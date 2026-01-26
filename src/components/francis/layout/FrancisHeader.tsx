import React from 'react';
import { ArrowLeft, Award, Cpu } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface FrancisHeaderProps {
    t: any;
    navigate: NavigateFunction;
    healthScore: number;
}

export const FrancisHeader: React.FC<FrancisHeaderProps> = ({ t, navigate, healthScore }) => {
    return (
        <React.Fragment>
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                    <span className="text-sm font-bold">{t('common.back', 'Back to Turbine Selection')}</span>
                </button>
                {/* Golden Seal of Excellence */}
                {healthScore > 90 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 animate-fade-in-right">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-black uppercase text-amber-500 tracking-widest">Golden Seal Certified</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                    <Cpu className="text-cyan-400 w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                        {t('francis.title', 'FRANCIS UNIT • 01').split('•')[0]} <span className="text-cyan-400">{t('francis.title', 'FRANCIS UNIT • 01').split('•')[1] || 'UNIT 1'}</span>
                    </h1>
                    <p className="text-slate-500 text-xs tracking-widest mt-1">{t('francis.subtitle', 'Vertical Axis / 5MW / River Run')}</p>
                </div>
            </div>
        </React.Fragment>
    );
};
