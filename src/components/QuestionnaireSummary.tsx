import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { ForensicReportService } from '../services/ForensicReportService';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { QUESTIONS } from '../constants.ts';
import type { Question } from '../types.ts';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';

// --- RISK LOGIC MAP ---
export const riskKeywords: Record<string, { high: string[], medium: string[] }> = {
    q1: { high: ['no'], medium: ['not documented'] },
    q2: { high: ['no'], medium: ['partially'] },
    q4: { high: ['no'], medium: ['sometimes'] },
    q5: { high: ['frequently'], medium: ['occasionally'] },
    q6: { high: ['not maintained'], medium: ['partially filled'] },
    q7: { high: ['often we only fix the symptom'], medium: ['sometimes we only fix the symptom'] },
    q8: { high: ['no'], medium: ['in testing phase'] },
    q9: { high: ['no'], medium: ['limited access'] },
    q10: { high: ['not monitored'], medium: ['monitored periodically'] },
    q11: { high: ['no', 'do not measure'], medium: [] },
    q12: { high: ['only replacement', 'no, only replacement is offered'], medium: ['sometimes'] },
    q13: { high: ['no'], medium: ['periodically'] },
    q14: { high: ['not installed/functional'], medium: ['some require checking'] },
    q15: { high: ['no'], medium: ['outdated'] },
    q16: { high: ['manual'], medium: ['semi-automatic'] },
    q17: { high: ['major service needed'], medium: ['requires minor maintenance'] },
};

// --- MODERN RISK GAUGE COMPONENT ---
const RiskGauge: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const { t } = useTranslation();
    let color = '';
    let percentage = 0;
    let text = '';

    switch (level) {
        case 'High':
            color = 'text-red-500';
            percentage = 90;
            text = t('common.critical', 'CRITICAL');
            break;
        case 'Medium':
            color = 'text-amber-400';
            percentage = 50;
            text = t('common.moderate', 'MODERATE');
            break;
        case 'Low':
            color = 'text-emerald-400';
            percentage = 15;
            text = t('common.stable', 'STABLE');
            break;
    }

    return (
        <div className="relative flex flex-col items-center justify-center py-8">
            <div className="w-48 h-48 rounded-full relative flex items-center justify-center bg-slate-900/50 shadow-inner border border-slate-700">
                {/* Background Track */}
                <svg className="absolute inset-0 transform -rotate-90 w-full h-full p-2" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
                    {/* Progress Circle */}
                    <circle
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray="283" strokeDashoffset={283 - (283 * percentage) / 100}
                        className={`${color} transition-all duration-1000 ease-out drop-shadow-[0_0_10px_currentColor]`}
                    />
                </svg>

                {/* Center Content */}
                <div className="text-center z-10">
                    <div className={`text-4xl font-black ${color} tracking-tighter drop-shadow-md mb-1`}>{text}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{t('common.riskLevel', 'Risk Level')}</div>
                </div>

                {/* Inner Glow */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-${color.split('-')[1]}-500/10 opacity-50`}></div>
            </div>
        </div>
    );
};

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const QuestionnaireSummary: React.FC = () => {
    const { navigateToHub } = useNavigation();
    const { answers, resetQuestionnaire, operationalData, description } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk, disciplineRiskScore } = useRisk();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    const { t } = useTranslation();

    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);

    // Analyze Answers
    const analysis = useMemo(() => {
        const highRisk: Question[] = [];
        const mediumRisk: Question[] = [];

        if (!Array.isArray(QUESTIONS)) return { highRisk: [], mediumRisk: [] };

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

    const getRiskLevel = (highCount: number, mediumCount: number) => {
        const totalScore = highCount * 2 + mediumCount;
        if (totalScore > 10) return { text: 'High Risk', color: 'text-red-400', level: 'High' as const };
        if (totalScore > 5) return { text: 'Medium Risk', color: 'text-amber-400', level: 'Medium' as const };
        return { text: 'Low Risk', color: 'text-emerald-400', level: 'Low' as const };
    };

    const riskIndicator = getRiskLevel(analysis.highRisk.length, analysis.mediumRisk.length);

    // --- GENERATE CONSULTATION / ADVICE ---
    const consultationText = useMemo(() => {
        if (riskIndicator.level === 'High') {
            return t('consultation.high', 'URGENT: Your asset shows signs of critical "Execution Gap". Immediate alignment verification (<0.05mm/m) and vibration spectral analysis (ISO 10816) are recommended to prevent catastrophic failure. Review MIV and Guide Vane protocols immediately.');
        } else if (riskIndicator.level === 'Medium') {
            return t('consultation.medium', 'WARNING: Deviations detected. While immediate failure is unlikely, efficiency losses are accruing. Schedule a comprehensive "Ownership Maintenance" audit and verify sensor calibration within the next maintenance window.');
        } else {
            return t('consultation.low', 'OPTIMAL: Asset is operating within the Standard of Excellence. Continue predictive maintenance logging and ensure annual "Digital Twin" calibration to maintain this status.');
        }
    }, [riskIndicator.level, t]);

    // --- CLOUD SUBMISSION ---
    const handleSubmitToCloud = async () => {
        if (Object.keys(answers).length === 0) {
            showToast(t('questionnaire.noDataToSubmit'), 'warning');
            return;
        }

        setIsUploading(true);

        try {
            const payload = {
                asset_name: selectedAsset ? selectedAsset.name : `HPP-${operationalData.turbineType || 'Unspecified'}`,
                asset_id: selectedAsset?.id,
                engineer_id: user?.email || 'Anonymous Engineer',
                answers: answers,
                operational_data: operationalData,
                risk_score: disciplineRiskScore,
                risk_level: riskIndicator.level,
                description: description,
                consultation: consultationText // <--- Added Consultation to Payload
            };

            const { error } = await supabase.from('risk_assessments').insert([payload]);

            if (error) throw error;

            showToast(t('questionnaire.diagnosisSynced', { email: user?.email || 'User' }), 'success');
            setIsUploaded(true);

        } catch (error: any) {
            console.error('Upload failed:', error);
            showToast(t('questionnaire.cloudSyncFailed', { error: error.message }), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // --- PDF GENERATION ---
    const handleDownloadPDF = () => {
        if (Object.keys(answers).length === 0) {
            showToast(t('questionnaire.noDataAvailable'), 'warning');
            return;
        }

        const riskDataForPDF = {
            id: 'DRAFT',
            risk_score: disciplineRiskScore,
            risk_level: riskIndicator.level,
            answers: answers,
            assetName: selectedAsset?.name || 'Unspecified Asset',
            consultation: consultationText // <--- Added Consultation to PDF Data
        };

        const blob = ForensicReportService.generateRiskReport({
            riskData: riskDataForPDF,
            engineerEmail: user?.email || 'AnoHUB Engineer',
            assetName: riskDataForPDF.assetName,
            t,
            description
        });

        ForensicReportService.openAndDownloadBlob(blob, 'risk_report.pdf');

        showToast(t('questionnaire.pdfDownloaded'), 'success');
    };

    const handleReturn = () => {
        resetQuestionnaire();
        navigateToHub();
    };

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">

            {/* HERO HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up pt-6">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    {t('questionnaire.title', 'Execution Gap').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('questionnaire.title', 'Execution Gap Analysis').split(' ').slice(1).join(' ')}</span>
                </h2>

                <div className="flex justify-center gap-6 text-xs uppercase tracking-widest text-slate-500 font-bold">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('questionnaire.liveAnalysis')}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span> {t('questionnaire.aiReady')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: EXECUTIVE SUMMARY */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="border-t-4 border-t-cyan-500">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">{t('questionnaire.overallAssessment')}</h3>
                        <RiskGauge level={riskIndicator.level} />

                        <div className="mt-4 pt-6 border-t border-slate-700/50 space-y-3">
                            <div className="flex justify-between items-center p-3 bg-red-900/10 rounded-lg border border-red-500/10">
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{t('questionnaire.highPriorityAlerts')}</span>
                                <span className="text-xl font-black text-red-400">{analysis.highRisk.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-amber-900/10 rounded-lg border border-amber-500/10">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t('questionnaire.warnings')}</span>
                                <span className="text-xl font-black text-amber-400">{analysis.mediumRisk.length}</span>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="mt-8 space-y-3">
                            <ModernButton
                                onClick={handleDownloadPDF}
                                variant="secondary"
                                fullWidth
                                icon={<span>📄</span>}
                            >
                                {t('questionnaire.downloadPDF')}
                            </ModernButton>

                            <ModernButton
                                onClick={handleSubmitToCloud}
                                disabled={isUploading || isUploaded}
                                variant={isUploaded ? 'secondary' : 'primary'}
                                fullWidth
                                isLoading={isUploading}
                                icon={!isUploading && (isUploaded ? <span>✓</span> : <span>☁️</span>)}
                            >
                                {isUploaded ? t('questionnaire.syncedToCloud') : t('questionnaire.submitToHQ')}
                            </ModernButton>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-cyan-900/10 border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">🧠</span>
                            <h4 className="font-bold text-cyan-300 text-sm uppercase tracking-wide">{t('questionnaire.conceptTitle')}</h4>
                        </div>
                        <p className="text-xs text-cyan-100/70 leading-relaxed font-medium">
                            {t('questionnaire.conceptDesc')}
                        </p>
                    </GlassCard>

                    {/* AI CONSULTATION CARD */}
                    <GlassCard className="bg-teal-900/20 border-teal-500/30">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">💡</span>
                            <h4 className="font-bold text-teal-300 text-sm uppercase tracking-wide">
                                {t('consultation.title', 'Expert Consultation')}
                            </h4>
                        </div>
                        <p className="text-sm text-teal-100/80 leading-relaxed font-medium border-l-4 border-teal-400 pl-4">
                            {consultationText}
                        </p>
                    </GlassCard>
                </div>

                {/* RIGHT COLUMN: DETAILED FINDINGS */}
                <div className="lg:col-span-2 space-y-6">

                    {/* High Risk Section */}
                    {analysis.highRisk.length > 0 && (
                        <GlassCard className="border-l-4 border-l-red-500 animate-scale-in" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{t('questionnaire.criticalIndicators')}</h3>
                                    <p className="text-xs text-red-300 font-medium mt-1">{t('questionnaire.criticalIndicatorsDesc')}</p>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {analysis.highRisk.map(q => (
                                    <li key={q.id} className="flex items-start gap-3 p-4 rounded-xl bg-red-950/30 border border-red-500/10 hover:border-red-500/30 transition-colors">
                                        <span className="text-red-500 mt-0.5 text-lg">•</span>
                                        <span className="text-sm text-slate-300 font-medium">{t(`questions.${q.id}.text`, q.text)}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    )}

                    {/* Medium Risk Section */}
                    {analysis.mediumRisk.length > 0 && (
                        <GlassCard className="border-l-4 border-l-amber-500 animate-scale-in" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{t('questionnaire.operationalWarnings')}</h3>
                                    <p className="text-xs text-amber-200/70 font-medium mt-1">{t('questionnaire.operationalWarningsDesc')}</p>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {analysis.mediumRisk.map(q => (
                                    <li key={q.id} className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/20 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                                        <span className="text-amber-500 mt-0.5 text-lg">•</span>
                                        <span className="text-sm text-slate-300 font-medium">{t(`questions.${q.id}.text`, q.text)}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    )}

                    {/* Clean State */}
                    {analysis.highRisk.length === 0 && analysis.mediumRisk.length === 0 && (
                        <GlassCard className="border-emerald-500/30 text-center py-12">
                            <div className="text-6xl mb-6 opacity-80">✅</div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('questionnaire.systemOptimal')}</h3>
                            <p className="text-slate-400 max-w-md mx-auto">{t('questionnaire.systemOptimalDesc')}</p>
                        </GlassCard>
                    )}

                    <div className="text-center pt-8">
                        <ModernButton
                            onClick={handleReturn}
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                        >
                            {t('questionnaire.returnToDashboard')}
                        </ModernButton>
                    </div>
                </div>
            </div>
        </div>
    );
};