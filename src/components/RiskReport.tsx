import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useHPPDesign } from '../contexts/HPPDesignContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
// ZAMJENA IMPORTA: Koristimo standardizirane funkcije za Blob i helper za otvaranje
import { ForensicReportService } from '../services/ForensicReportService';
import idAdapter from '../utils/idAdapter';
import { aiPredictionService } from '../services/AIPredictionService';
import { fetchForecastForAsset, forecastExcludingDates } from '../services/DashboardDataService';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../stores/useAppStore';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { Skeleton } from '../shared/components/ui/Skeleton';
import { ModernButton } from '../shared/components/ui/ModernButton';
// Spinner removed as it's replaced by Skeleton
import { QUESTIONS } from '../constants.ts';

export const RiskReport: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { user } = useAuth();
    const { navigateTo } = useNavigation();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { answers, description } = useQuestionnaire();
    const { currentDesign } = useHPPDesign(); // ✅ Read HPP Design from context

    const [cloudRiskData, setCloudRiskData] = useState<any>(null);
    const [cloudDesignData, setCloudDesignData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [forecast, setForecast] = useState<any | null>(null);
    const [sampleCount, setSampleCount] = useState<number | null>(null);
    const [residualStd, setResidualStd] = useState<number | null>(null);
    const [dec25Present, setDec25Present] = useState<boolean>(false);
    const [dec25DeltaWeeks, setDec25DeltaWeeks] = useState<number | null>(null);

    // --- CALCULATE LOCAL RISK DATA FROM CONTEXT ---
    const localRiskData = useMemo(() => {
        const answerCount = Object.keys(answers).length;
        if (answerCount === 0) return null;

        // Calculate risk score using same logic as Questionnaire
        let calculatedScore = 0;
        let criticalCount = 0;

        QUESTIONS.forEach((q) => {
            const answer = answers[q.id];
            if (answer && answer === q.critical) {
                calculatedScore += 20;
                criticalCount++;
            } else if (answer && (answer.includes('No') || answer.includes('Unknown') || answer.includes('Partial'))) {
                calculatedScore += 10;
            }
        });

        // Determine risk level
        const totalScore = criticalCount * 2 + (answerCount - criticalCount);
        let risk_level: 'High' | 'Medium' | 'Low' = 'Low';
        if (totalScore > 10) risk_level = 'High';
        else if (totalScore > 5) risk_level = 'Medium';

        return {
            id: 'LOCAL_DRAFT',
            risk_score: calculatedScore,
            risk_level: risk_level,
            answers: answers,
            description: description || 'No notes provided.',
            asset_id: selectedAsset ? idAdapter.toStorage(selectedAsset.id) : undefined,
            created_at: new Date().toISOString(),
            isDraft: true // Flag to identify local data
        };
    }, [answers, description, selectedAsset]);

    // --- 1. FETCH DATA FROM CLOUD (LOGIKA OSTAJE ISTA) ---
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!selectedAsset) { setForecast(null); return; }
            try {
                const res = await fetchForecastForAsset(selectedAsset);
                if (!mounted) return;
                setForecast(res?.forecast ?? null);
                setSampleCount(res?.sampleCount ?? null);
                setResidualStd(res?.residualStd ?? null);
                setDec25Present(!!res?.dec25Present);

                if (res?.dec25Present) {
                    // compute forecast excluding Dec25 via DashboardDataService wrapper
                    const excludeDates: string[] = []; // service already detected presence; for exact dates we'd need cache details
                    const fEx = await forecastExcludingDates(selectedAsset, excludeDates);
                    if (fEx && res?.forecast && typeof fEx.weeksUntil === 'number' && typeof res.forecast.weeksUntil === 'number') {
                        setDec25DeltaWeeks(res.forecast.weeksUntil - fEx.weeksUntil);
                    }
                } else {
                    setDec25DeltaWeeks(null);
                }
            } catch (e) {
                console.warn('Forecast fetch failed', e);
                if (mounted) setForecast(null);
            }
        })();
        return () => { mounted = false; };
    }, [selectedAsset]);

        useEffect(() => {
        const fetchData = async () => {
            if (!selectedAsset) {
                setCloudRiskData(null);
                setCloudDesignData(null);
                return;
            }

            setLoading(true);
            try {
                // Fetch latest Risk Assessment
                const numeric = selectedAsset ? idAdapter.toNumber(selectedAsset.id) : null;
                const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : undefined;

                const { data: risk } = await supabase
                    .from('risk_assessments')
                    .select('*')
                    .eq('asset_id', assetDbId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Fetch latest Design
                const { data: design } = await supabase
                    .from('turbine_designs')
                    .select('*')
                    .eq('asset_id', assetDbId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                setCloudRiskData(risk);
                setCloudDesignData(design);
            } catch (error) {
                console.log('Status check:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedAsset]);

    // --- MERGE LOCAL AND CLOUD DATA (Prioritize local if exists) ---
    const riskData = localRiskData || cloudRiskData;
    const riskDataStatus = localRiskData ? 'draft' : (cloudRiskData ? 'synced' : 'none');

    // Design data merge (local from context > cloud from Supabase)
    const designData = currentDesign || cloudDesignData;
    const designDataStatus = currentDesign ? 'draft' : (cloudDesignData ? 'synced' : 'none');

    // --- 2. HANDLER: GENERATE AND ACTION (DOWNLOAD or PREVIEW) ---
    const handleGenerateDossier = (openPreview: boolean) => {
        if (!selectedAsset) return;

        // Provjeri da li postoji bilo kakav podatak za generisanje
        if (!riskData && !designData) {
            showToast(t('riskReport.noDataToGenerate', 'No data to generate Dossier.'), 'warning');
            return;
        }

        try {
            // Generišemo Blob koristeći novu preimenovanu funkciju
            const pdfBlob = ForensicReportService.generateMasterDossier({
                assetName: selectedAsset.name,
                riskData,
                designData,
                engineerEmail: user?.email || 'AnoHUB Engineer',
                t
            });

            const filename = `${selectedAsset.name.replace(/\s+/g, '_')}_Master_Dossier.pdf`;

            // Koristimo helper funkciju koja otvara Preview ili skida fajl
            ForensicReportService.openAndDownloadBlob(pdfBlob, filename, openPreview, {
                assetId: selectedAsset ? idAdapter.toDb(selectedAsset.id) : undefined,
                reportType: 'MASTER_DOSSIER',
                metadata: { preview: !!openPreview }
            });

            if (openPreview) {
                showToast(t('riskReport.previewOpened', 'Dossier opened in new window.'), 'success');
            } else {
                showToast(t('riskReport.pdfDownloaded', 'PDF successfully downloaded.'), 'success');
            }

        } catch (err) {
            console.error(err);
            showToast(t('riskReport.generateError', 'Error generating PDF'), 'error');
        }
    };

    // --- 3. HANDLER: UPLOAD TO CLOUD (LOGIKA OSTAJE SKORO ISTA, koristi createMasterDossierBlob) ---
    const handleUploadToHQ = async () => {
        if (!selectedAsset || !user) return;
        setUploading(true);

        // Provjeri da li postoji bilo kakav podatak za upload
        if (!riskData && !designData) {
            showToast(t('riskReport.noDataToArchive', 'No data to archive.'), 'warning');
            setUploading(false);
            return;
        }

        try {
            // Ista Blob funkcija se koristi i za upload
            const pdfBlob = ForensicReportService.generateMasterDossier({
                assetName: selectedAsset.name,
                riskData,
                designData,
                engineerEmail: user.email || 'Engineer',
                t
            });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeAssetName = selectedAsset.name.replace(/\s+/g, '_');
            const fileName = `${safeAssetName}_${timestamp}.pdf`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('reports')
                .upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: false });

            if (uploadError) throw uploadError;

            showToast(t('riskReport.archiveSuccess', 'Dossier successfully archived to HQ Cloud.'), 'success');
        } catch (error: any) {
            console.error('Upload failed:', error);
            showToast(t('riskReport.archiveError', { defaultValue: `Archiving failed: ${error.message}`, error: error.message }), 'error');
        } finally {
            setUploading(false);
        }
    };

    // Helper for risk colors
    const getRiskColor = (level: string) => {
        if (level === 'High') return 'text-red-400 border-red-500/50 bg-red-500/10';
        if (level === 'Medium') return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    };

    // Helper for status badge
    const getStatusBadge = (status: 'draft' | 'synced' | 'none') => {
        if (status === 'draft') {
            return <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] font-bold text-amber-400 uppercase tracking-wider">🟡 Local Draft</span>;
        } else if (status === 'synced') {
            return <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-wider">🟢 Synced</span>;
        }
        return null;
    };

    const hasData = riskData || designData;

    // Normal CDF helper
    const normalCDF = (x: number) => {
        // Abramowitz & Stegun approximation
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        prob = 1 - prob;
        return x < 0 ? 1 - prob : prob;
    };

    // Compute Probability of Failure from residual std (process sigma)
    const computePfFromSigma = (sigma: number | null) => {
        if (sigma === null) return null;
        const acceptableSigma = 0.5; // 0.5% efficiency std as operational baseline
        const z = sigma / acceptableSigma; // higher z -> higher Pf
        const pf = Math.min(99.99, Math.max(0.01, normalCDF(z) * 100));
        return pf;
    };

    return (
        <div className="animate-fade-in pb-12 space-y-8 max-w-7xl mx-auto">

            {/* ... TOP BAR and HEADER ostaju isti ... */}

            {/* TOP BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <BackButton text={t('actions.back', 'Return to Hub')} />

                {/* Context Badge */}
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-full px-4 py-1.5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('riskReport.activeContext', 'Active Context')}</span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    {selectedAsset ? (
                        <div className="flex items-center gap-2 text-sm font-mono text-cyan-400">
                            <span className={`w-2 h-2 rounded-full ${selectedAsset.status === 'Operational' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {selectedAsset.name}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-500 italic">{t('riskReport.noAsset', 'No Asset Selected')}</span>
                    )}
                </div>
            </div>

            {/* HEADER */}
            <div className="text-center py-6 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                    {t('riskReport.title', 'Project')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('riskReport.dossier', 'Master Dossier')}</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                    {t('riskReport.subtitle', 'Comprehensive risk and design summary for enterprise archiving.')}
                </p>
            </div>

            {/* CONTENT AREA */}
            {!selectedAsset ? (
                <GlassCard className="text-center py-20 border-dashed border-slate-700">
                    <div className="text-6xl mb-6 opacity-20 grayscale">📂</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t('riskReport.assetNotLoaded', 'Asset Not Loaded')}</h3>
                    <p className="text-slate-400 mb-8">{t('riskReport.selectAssetPrompt', 'Please select an asset to generate its Dossier.')}</p>
                    <ModernButton onClick={() => navigateTo('globalMap')} variant="secondary">{t('hub.operationalModules', 'Select Asset')}</ModernButton>
                </GlassCard>
            ) : loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GlassCard className="h-64 space-y-4">
                        <Skeleton height="1.5rem" width="60%" />
                        <Skeleton height="4rem" />
                        <Skeleton height="1rem" width="40%" />
                    </GlassCard>
                    <GlassCard className="h-64 space-y-4">
                        <Skeleton height="1.5rem" width="60%" />
                        <Skeleton height="4rem" />
                        <Skeleton height="1rem" width="40%" />
                    </GlassCard>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">

                    {/* LEFT COLUMN: RISK DIAGNOSTIC */}
                    <GlassCard
                        title={t('riskReport.riskDiagnostic', 'Risk Diagnostic')}
                        subtitle={riskData ? `ID: ${riskData.id.toString().slice(0, 8)}` : 'NO DATA'}
                        className="h-full flex flex-col"
                        action={<span className="text-2xl">🛡️</span>}
                    >
                        {riskData ? (
                            <div className="space-y-6">
                                {/* STATUS BADGE */}
                                <div className="flex justify-end">
                                    {getStatusBadge(riskDataStatus)}
                                </div>

                                {/* ... (prikaz Risk Level, Gap Score, Engineer Notes) ... */}
                                <div className="flex justify-between items-center p-4 rounded-xl border bg-slate-900/50 border-slate-700">
                                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{t('riskReport.riskLevel', 'Risk Level')}</span>
                                    {(() => {
                                        const pf = computePfFromSigma(residualStd);
                                        if (pf !== null) {
                                            return (
                                                <span className={`text-xl font-black uppercase px-3 py-1 rounded border text-red-400 border-red-500/50 bg-red-500/10`}>
                                                    {`P_f: ${pf.toFixed(1)}%`}
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className={`text-xl font-black uppercase px-3 py-1 rounded border ${getRiskColor(riskData.risk_level)}`}>
                                                {riskData.risk_level}
                                            </span>
                                        );
                                    })()}
                                </div>

                                {/* Predicted efficiency breach (90%) */}
                                <div className="mt-3 text-sm text-slate-400 space-y-2">
                                    {forecast && forecast.predictedTimestamp ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-wider font-bold">Predicted Efficiency Breach (90%):</span>
                                            <span className="font-mono text-sm text-amber-300">{new Date(forecast.predictedTimestamp).toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic">No predicted breach within forecast window.</div>
                                    )}

                                    {/* Confidence injection next to risk score */}
                                    {forecast ? (
                                        (forecast.confidence < 0.85) ? (
                                            <div className="text-sm text-rose-300 font-bold uppercase">Risk Evaluation: Data Insufficient (confidence {(forecast.confidence||0).toFixed(3)})</div>
                                        ) : (
                                            <div className="text-sm text-slate-400">Forecast confidence: {(forecast.confidence||0).toFixed(3)} — samples: {sampleCount ?? 'N/A'}</div>
                                        )
                                    ) : null}

                                    {/* Anomaly Impact Note */}
                                    {dec25Present ? (
                                        <div className="mt-2 p-3 rounded bg-red-900/10 border border-red-600/20 text-red-300 text-sm font-mono">
                                            <div className="font-bold uppercase">Model-Distorting Anomaly — Dec 25 Flow Surge</div>
                                            <div>Current risk / forecast is heavily influenced by a Dec 25 hourly outlier.</div>
                                            {dec25DeltaWeeks !== null ? (
                                                <div>Estimated forecast change due to Dec 25: {dec25DeltaWeeks.toFixed(0)} weeks (approx).</div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wide font-bold">
                                        <span>{t('riskReport.gapScoreAnalysis', 'Gap Score Analysis')}</span>
                                        <span>{riskData.risk_score}/100</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                                        <div
                                            className={`h-full relative overflow-hidden ${riskData.risk_score > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(riskData.risk_score * 2, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shine_1s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
                                    <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-widest">{t('riskReport.engineerNotes', 'Engineer Notes')}</p>
                                    <p className="text-sm text-slate-300 italic">
                                        "{riskData.description || t('riskReport.noNotes', 'No additional notes provided.')}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <p className="text-slate-500 mb-6">{t('riskReport.noLatestRisk', 'No latest risk assessment found.')}</p>
                                <ModernButton onClick={() => navigateTo('riskAssessment')} variant="secondary" icon={<span>🩺</span>}>
                                    {t('riskReport.runDiagnostics', 'Run Diagnostics')}
                                </ModernButton>
                            </div>
                        )}
                    </GlassCard>

                    {/* RIGHT COLUMN: TECHNICAL DESIGN */}
                    <GlassCard
                        title={t('riskReport.technicalDesign', 'Technical Design')}
                        subtitle={designData ? `REV: ${designData.created_at ? designData.created_at.slice(0, 10) : 'DRAFT'}` : 'NO DATA'}
                        className="h-full flex flex-col"
                        action={<span className="text-2xl">⚙️</span>}
                    >
                        {designData ? (
                            <div className="space-y-6">
                                {/* STATUS BADGE */}
                                <div className="flex justify-end">
                                    {getStatusBadge(designDataStatus)}
                                </div>

                                {/* ... (prikaz Configuration, Turbine, Power Output/Annual Energy) ... */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t('riskReport.configuration', 'Configuration')}</div>
                                        <div className="text-white font-bold truncate">{designData.design_name}</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t('riskReport.turbine', 'Turbine')}</div>
                                        <div className="text-cyan-400 font-bold">{designData.recommended_turbine}</div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex justify-between items-end">
                                    <div>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t('riskReport.ratedPower', 'Rated Power Output')}</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">{designData.calculations?.powerMW} <span className="text-lg font-medium text-slate-500">MW</span></span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t('riskReport.annualGen', 'Annual Energy Gen.')}</span>
                                        <span className="text-2xl font-bold text-emerald-400">{designData.calculations?.energyGWh || designData.calculations?.annualGWh} <span className="text-sm text-slate-500">GWh</span></span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <p className="text-slate-500 mb-6">{t('riskReport.noLatestDesign', 'No latest technical design found.')}</p>
                                <ModernButton onClick={() => navigateTo('hppBuilder')} variant="secondary" icon={<span>📐</span>}>
                                    {t('riskReport.openStudio', 'Open Design Studio')}
                                </ModernButton>
                            </div>
                        )}
                    </GlassCard>

                    {/* BOTTOM ACTION BAR (FULL WIDTH) - DODANE FUNKCIONALNOSTI ZA PREVIEW */}
                    <div className="lg:col-span-2 mt-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600">
                            <div className="bg-slate-900 rounded-[15px] p-8 text-center relative overflow-hidden">
                                {/* Background Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{t('riskReport.compileTitle', 'Compile Master Dossier')}</h3>
                                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-sm">
                                        {t('riskReport.compileDesc', 'Combine the latest Risk Diagnostic and Technical Design into a single, comprehensive PDF document for official use.')}
                                    </p>

                                    <div className="flex flex-col sm:flex-row justify-center gap-4">

                                        {/* NOVO DUGME: PREVIEW & PRINT */}
                                        <ModernButton
                                            onClick={() => handleGenerateDossier(true)} // true = otvori preview
                                            disabled={!hasData}
                                            variant="secondary"
                                            icon={<span>👁️</span>}
                                            className="min-w-[200px]"
                                        >
                                            {t('actions.previewPrint', 'Preview & Print')}
                                        </ModernButton>

                                        {/* AŽURIRANO DUGME: DOWNLOAD (Sada koristi novu funkciju) */}
                                        <ModernButton
                                            onClick={() => handleGenerateDossier(false)} // false = skini direktno
                                            disabled={!hasData}
                                            variant="secondary"
                                            icon={<span>⬇️</span>}
                                            className="min-w-[200px]"
                                        >
                                            {t('riskReport.downloadButton', 'Download Master Project Dossier')}
                                        </ModernButton>

                                        {/* DUGME: UPLOAD TO HQ */}
                                        <ModernButton
                                            onClick={handleUploadToHQ}
                                            disabled={!hasData || uploading}
                                            variant="primary"
                                            isLoading={uploading}
                                            icon={<span>🚀</span>}
                                            className="min-w-[240px] shadow-cyan-500/20"
                                        >
                                            {!hasData ? t('riskReport.noDataButton', 'No Data') : t('riskReport.submitArchive', 'Submit to HQ Archive')}
                                        </ModernButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};
