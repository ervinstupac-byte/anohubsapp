import React, { useMemo } from 'react';
import { QUESTIONS } from '../../constants.ts';

interface AlarmBarProps {
    answers: Record<string, string>;
}

export const AlarmBar: React.FC<AlarmBarProps> = React.memo(({ answers }) => {
    // Calculate risk level from answers
    const riskStatus = useMemo(() => {
        const answerCount = Object.keys(answers).length;
        const totalQuestions = QUESTIONS.length;

        // Only show if questionnaire is complete
        if (answerCount < totalQuestions) {
            return null; // Don't show alarm bar
        }

        // Calculate risk score (same logic as Questionnaire)
        let totalScore = 0;
        Object.entries(answers).forEach(([, answer]) => {
            if (answer === 'A') totalScore += 10;
            else if (answer === 'B') totalScore += 5;
            else if (answer === 'C') totalScore += 2;
            else if (answer === 'D') totalScore += 0;
        });

        const riskScore = (totalScore / (totalQuestions * 10)) * 100;

        // Determine risk level
        if (riskScore >= 70) return { level: 'HIGH', color: 'red', message: 'HIGH RISK - INTERVENTION REQUIRED' };
        if (riskScore >= 40) return { level: 'MEDIUM', color: 'yellow', message: 'MEDIUM RISK - REVIEW RECOMMENDED' };
        return { level: 'LOW', color: 'green', message: 'LOW RISK - SYSTEM OPTIMAL' };
    }, [answers]);

    // Don't render if questionnaire not complete
    if (!riskStatus) return null;

    const colorClasses = {
        red: 'bg-red-950/50 border-red-600/50 text-red-400',
        yellow: 'bg-yellow-950/50 border-yellow-600/50 text-yellow-400',
        green: 'bg-emerald-950/50 border-emerald-600/50 text-emerald-400'
    };

    return (
        <div className={`
            fixed bottom-0 left-0 lg:left-[280px] right-0 h-10 flex items-center justify-center 
            border-t text-[10px] sm:text-xs font-bold tracking-wider transition-all duration-500 z-50 px-2
            ${colorClasses[riskStatus.color as keyof typeof colorClasses]}
        `}>
            <span className="flex items-center gap-2 truncate max-w-full">
                <span className={`w-2 h-2 rounded-full shrink-0 ${riskStatus.color === 'red' ? 'bg-red-500 animate-pulse' : riskStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                <span className="truncate">{riskStatus.message}</span>
            </span>
        </div>
    );
});
