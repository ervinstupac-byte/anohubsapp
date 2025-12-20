import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { ScadaMimic } from './scada/ScadaMimic.tsx';
import { GlobalMap } from './GlobalMap.tsx';
import { AlarmBar } from './scada/AlarmBar.tsx';

export const Hub: React.FC = () => {
    const { answers } = useQuestionnaire();
    const location = useLocation();
    const showMap = location.pathname === '/map';

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-950">
            {/* BOTTOM: Process Mimic / Map */}
            <div className="flex-1 relative overflow-hidden">
                {showMap ? <GlobalMap /> : <ScadaMimic />}
            </div>

            {/* BOTTOM: Alarm Bar */}
            <AlarmBar answers={answers} />
        </div>
    );
};
