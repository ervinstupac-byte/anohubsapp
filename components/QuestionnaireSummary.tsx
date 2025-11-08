import React, { useEffect } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import { QUESTIONS } from '../constants';
import type { Question } from '../types';
import { useNavigation } from '../contexts/NavigationContext';
import { useRisk } from '../contexts/RiskContext';

export const riskKeywords: Record<string, { high: string[], medium: string[] }> = {
    q1: { high: ['no'], medium: ['not documented'] }, q2: { high: ['no'], medium: ['partially'] },
    q4: { high: ['no'], medium: ['sometimes'] }, q5: { high: ['frequently'], medium: ['occasionally'] },
    q6: { high: ['not maintained'], medium: ['partially filled'] },
    q7: { high: ['often we only fix the symptom'], medium: ['sometimes we only fix the symptom'] },
    q8: { high: ['no'], medium: ['in testing phase'] }, q9: { high: ['no'], medium: ['limited access'] },
    q10: { high: ['not monitored'], medium: ['monitored periodically'] },
    q11: { high: ['no', 'do not measure'], medium: [] }, q12: { high: ['only replacement', 'no, only replacement is offered'], medium: ['sometimes'] },
    q13: { high: ['no'], medium: ['periodically'] }, q14: { high: ['not installed/functional'], medium: ['some require checking'] },
    q15: { high: ['no'], medium: ['outdated'] }, q16: { high: ['manual'], medium: ['semi-automatic'] },
    q17: { high: ['major service needed'], medium: ['requires minor maintenance'] },
};

const QuestionnaireSummary: React.FC = () => {
    const { navigateToHub } = useNavigation();
    const { answers, resetQuestionnaire } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk } = useRisk();

    const analysis = React.useMemo(() => {
        const highRisk: Question[] = [];
        const mediumRisk: Question[] = [];

        QUESTIONS.forEach(q => {
            const answer = answers[q.id]?.toLowerCase();
            if (!answer) return;
            const riskDef = riskKeywords[q.id];
            if (!riskDef) return;

            if (riskDef.high.some(keyword => answer.includes(keyword))) highRisk.push(q);
            else if (riskDef.medium.some(keyword => answer.includes(keyword))) mediumRisk.push(q);
        });
        return { highRisk, mediumRisk };
    }, [answers]);

    useEffect(() => {
        calculateAndSetQuestionnaireRisk(answers);
    }, [answers, calculateAndSetQuestionnaireRisk]);


    const getRiskLevelIndicator = (highCount: number, mediumCount: number) => {
        const totalScore = highCount * 2 + mediumCount;
        if (totalScore > 10) return { text: 'High Risk', color: 'text-red-400', bgColor: 'bg-red-500/20' };
        if (totalScore > 5) return { text: 'Medium Risk', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
        return { text: 'Low Risk', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    };
    
    const riskLevel = getRiskLevelIndicator(analysis.highRisk.length, analysis.mediumRisk.length);

    const handleReturn = () => {
        resetQuestionnaire();
        navigateToHub();
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-2">Overall Assessment</h2>
                <p className={`text-3xl font-bold ${riskLevel.color} ${riskLevel.bgColor} inline-block px-4 py-2 rounded-lg`}>{riskLevel.text}</p>
                 <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                    This automated analysis identifies potential indicators of a widening Execution Gap based on your responses.
                </p>
            </div>
            
            <div className="p-6 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-lg">
                <h3 className="text-xl font-bold text-cyan-300">What is the Execution Gap?</h3>
                <p className="text-slate-300 mt-2">The Execution Gap is the primary source of operational risk. It represents the critical difference between a flawless engineering plan and the inconsistent reality of on-site implementation. It is indicated by failures in discipline and documentation against non-negotiable standards like the **0.05 mm/m precision mandate**, and it directly compromises system integrity, LCC, and can void manufacturer warranties.</p>
            </div>
            
            {analysis.highRisk.length > 0 && (
                 <div className="bg-red-900/30 border border-red-500/50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-red-300 mb-4">High-Priority Indicators ({analysis.highRisk.length})</h3>
                    <p className="text-sm text-red-200 mb-4">These responses suggest a significant deviation from the Standard of Excellence and a wide Execution Gap.</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {analysis.highRisk.map(q => <li key={q.id}>{q.text}</li>)}
                    </ul>
                </div>
            )}
            
            {analysis.mediumRisk.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-500/50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-yellow-300 mb-4">Indicators for Review ({analysis.mediumRisk.length})</h3>
                     <p className="text-sm text-yellow-200 mb-4">These responses point to potential gaps in discipline or documentation that require further investigation.</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {analysis.mediumRisk.map(q => <li key={q.id}>{q.text}</li>)}
                    </ul>
                </div>
            )}
            
             <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-300 mb-4">Thank you for completing the assessment. Your full submission has been sent for expert review.</p>
                <button
                    onClick={handleReturn}
                    className="px-8 py-3 text-lg font-bold rounded-lg transition-colors bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                    Return to HUB
                </button>
            </div>
        </div>
    );
};

export default QuestionnaireSummary;