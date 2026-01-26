import React from 'react';
import { Power, AlertTriangle, GitBranch } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';

interface FrancisQuickActionsProps {
    t: any;
    navigate: NavigateFunction;
}

export const FrancisQuickActions: React.FC<FrancisQuickActionsProps> = ({ t, navigate }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <button
                onClick={() => navigate(`/francis/${ROUTES.FRANCIS.MISSION_CONTROL}`)}
                className="px-5 py-3 bg-gradient-to-br from-orange-900/40 to-orange-950/60 border border-orange-500/50 rounded-lg flex items-center justify-center gap-3 hover:from-orange-800/50 hover:to-orange-900/70 hover:border-orange-400 transition-all group shadow-lg shadow-orange-900/20"
            >
                <Power className="text-red-400 w-5 h-5 group-hover:scale-110 transition" />
                <div className="text-left">
                    <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider">{t('francis.actions.missionControl')}</div>
                    <div className="text-white text-xs font-black tracking-widest">{t('francis.actions.startSequence')}</div>
                </div>
            </button>

            <button
                onClick={() => navigate(`/francis/${ROUTES.FRANCIS.EMERGENCY}`)}
                className="px-5 py-3 bg-gradient-to-br from-indigo-900/40 to-indigo-950/60 border border-indigo-500/50 rounded-lg flex items-center justify-center gap-3 hover:from-indigo-800/50 hover:to-indigo-900/70 hover:border-indigo-400 transition-all group shadow-lg shadow-indigo-900/20"
            >
                <AlertTriangle className="text-orange-400 w-5 h-5 group-hover:scale-110 transition" />
                <div className="text-left">
                    <div className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">{t('francis.actions.emergency')}</div>
                    <div className="text-white text-xs font-black tracking-widest">{t('francis.actions.protocols')}</div>
                </div>
            </button>

            <button
                onClick={() => navigate(`/francis/${ROUTES.FRANCIS.FLOWCHART_STARTUP}`)}
                className="px-5 py-3 bg-gradient-to-br from-green-900/40 to-green-950/60 border border-green-500/50 rounded-lg flex items-center justify-center gap-3 hover:from-green-800/50 hover:to-green-900/70 hover:border-green-400 transition-all group shadow-lg shadow-green-900/20"
            >
                <GitBranch className="text-green-400 w-5 h-5 group-hover:scale-110 transition" />
                <div className="text-left">
                    <div className="text-[9px] text-green-400 font-bold uppercase tracking-wider">{t('francis.actions.startup')}</div>
                    <div className="text-white text-xs font-black tracking-widest">{t('francis.actions.flowchart')}</div>
                </div>
            </button>
        </div>
    );
};
