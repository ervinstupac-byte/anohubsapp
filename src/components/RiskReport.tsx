import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx'; 
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
// ZAMJENA IMPORTA: Koristimo standardizirane funkcije za Blob i helper za otvaranje
import { createMasterDossierBlob, openAndDownloadBlob } from '../utils/pdfGenerator.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { Spinner } from './Spinner.tsx';

export const RiskReport: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { user } = useAuth();
    const { navigateTo } = useNavigation();
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    const [riskData, setRiskData] = useState<any>(null);
    const [designData, setDesignData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // --- 1. FETCH DATA FROM CLOUD (LOGIKA OSTAJE ISTA) ---
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedAsset) {
                setRiskData(null);
                setDesignData(null);
                return;
            }

            setLoading(true);
            try {
                // Fetch latest Risk Assessment
                const { data: risk } = await supabase
                    .from('risk_assessments')
                    .select('*')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Fetch latest Design
                const { data: design } = await supabase
                    .from('turbine_designs')
                    .select('*')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                setRiskData(risk);
                setDesignData(design);
            } catch (error) {
                console.log('Status check:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedAsset]);

    // --- 2. HANDLER: GENERATE AND ACTION (DOWNLOAD or PREVIEW) ---
    const handleGenerateDossier = (openPreview: boolean) => {
        if (!selectedAsset) return;

        // Provjeri da li postoji bilo kakav podatak za generisanje
        if (!riskData && !designData) {
            showToast('Nema podataka za generisanje Dossiera.', 'warning');
            return;
        }

        try {
            // Generišemo Blob koristeći novu preimenovanu funkciju
            const pdfBlob = createMasterDossierBlob(
                selectedAsset.name,
                riskData,
                designData,
                user?.email || 'AnoHUB Engineer'
            );
            
            const filename = `${selectedAsset.name.replace(/\s+/g, '_')}_Master_Dossier.pdf`;

            // Koristimo helper funkciju koja otvara Preview ili skida fajl
            openAndDownloadBlob(pdfBlob, filename, openPreview);

            if (openPreview) {
                showToast(t('riskReport.previewOpened', 'Dossier je otvoren u novom prozoru.'), 'success');
            } else {
                showToast(t('questionnaire.pdfDownloaded', 'PDF uspješno preuzet.'), 'success');
            }

        } catch (err) {
            console.error(err);
            showToast('Greška pri generisanju PDF-a', 'error');
        }
    };

    // --- 3. HANDLER: UPLOAD TO CLOUD (LOGIKA OSTAJE SKORO ISTA, koristi createMasterDossierBlob) ---
    const handleUploadToHQ = async () => {
        if (!selectedAsset || !user) return;
        setUploading(true);

        // Provjeri da li postoji bilo kakav podatak za upload
        if (!riskData && !designData) {
             showToast('Nema podataka za arhiviranje.', 'warning');
             setUploading(false);
             return;
        }

        try {
            // Ista Blob funkcija se koristi i za upload
            const pdfBlob = createMasterDossierBlob(
                selectedAsset.name,
                riskData,
                designData,
                user.email || 'Engineer'
            );

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeAssetName = selectedAsset.name.replace(/\s+/g, '_');
            const fileName = `${safeAssetName}_${timestamp}.pdf`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('reports')
                .upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: false });

            if (uploadError) throw uploadError;

            showToast('Dossier uspješno arhiviran u HQ Cloud.', 'success');
        } catch (error: any) {
            console.error('Upload failed:', error);
            showToast(`Arhiviranje neuspješno: ${error.message}`, 'error');
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

    const hasData = riskData || designData;

    return (
        <div className="animate-fade-in pb-12 space-y-8 max-w-7xl mx-auto">
            
            {/* ... TOP BAR and HEADER ostaju isti ... */}

            {/* TOP BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <BackButton text={t('actions.back', 'Return to Hub')} />
                
                {/* Context Badge */}
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-full px-4 py-1.5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Context</span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    {selectedAsset ? (
                        <div className="flex items-center gap-2 text-sm font-mono text-cyan-400">
                             <span className={`w-2 h-2 rounded-full ${selectedAsset.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                             {selectedAsset.name}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-500 italic">No Asset Selected</span>
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
                     <h3 className="text-2xl font-bold text-white mb-2">{t('riskReport.selectPromptTitle', 'Asset Not Loaded')}</h3>
                     <p className="text-slate-400 mb-8">{t('riskReport.selectPromptDesc', 'Please select an asset to generate its Dossier.')}</p>
                     <ModernButton onClick={() => navigateTo('globalMap')} variant="secondary">Select Asset from Map</ModernButton>
                 </GlassCard>
            ) : loading ? (
                <div className="h-96 flex items-center justify-center">
                    <Spinner text="Compiling Data..." size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                    
                    {/* LEFT COLUMN: RISK DIAGNOSTIC */}
                    <GlassCard 
                        title={t('riskReport.riskDiagnostic', 'Risk Diagnostic')} 
                        subtitle={riskData ? `ID: ${riskData.id.slice(0,8)}` : 'NO DATA'}
                        className="h-full flex flex-col"
                        action={<span className="text-2xl">🛡️</span>}
                    >
                        {riskData ? (
                            <div className="space-y-6">
                                {/* ... (prikaz Risk Level, Gap Score, Engineer Notes) ... */}
                                <div className="flex justify-between items-center p-4 rounded-xl border bg-slate-900/50 border-slate-700">
                                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{t('riskReport.riskLevel')}</span>
                                    <span className={`text-xl font-black uppercase px-3 py-1 rounded border ${getRiskColor(riskData.risk_level)}`}>
                                        {riskData.risk_level}
                                    </span>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wide font-bold">
                                        <span>Gap Score Analysis</span>
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
                                    <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-widest">Engineer Notes</p>
                                    <p className="text-sm text-slate-300 italic">
                                        "{riskData.description || 'No additional notes provided.'}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <p className="text-slate-500 mb-6">{t('riskReport.noRiskData', 'No latest risk assessment found.')}</p>
                                <ModernButton onClick={() => navigateTo('riskAssessment')} variant="secondary" icon={<span>🩺</span>}>
                                    {t('riskReport.runDiagnostics', 'Run Diagnostics')}
                                </ModernButton>
                            </div>
                        )}
                    </GlassCard>

                    {/* RIGHT COLUMN: TECHNICAL DESIGN */}
                    <GlassCard 
                        title={t('riskReport.technicalDesign', 'Technical Design')}
                        subtitle={designData ? `REV: ${designData.created_at.slice(0,10)}` : 'NO DATA'}
                        className="h-full flex flex-col"
                        action={<span className="text-2xl">⚙️</span>}
                    >
                       {designData ? (
                            <div className="space-y-6">
                                {/* ... (prikaz Configuration, Turbine, Power Output/Annual Energy) ... */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t('riskReport.configuration')}</div>
                                        <div className="text-white font-bold truncate">{designData.design_name}</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t('riskReport.turbine')}</div>
                                        <div className="text-cyan-400 font-bold">{designData.recommended_turbine}</div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex justify-between items-end">
                                    <div>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t('riskReport.calcOutput', 'Rated Power Output')}</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">{designData.calculations?.powerMW} <span className="text-lg font-medium text-slate-500">MW</span></span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t('riskReport.annualEnergy', 'Annual Energy Gen.')}</span>
                                        <span className="text-2xl font-bold text-emerald-400">{designData.calculations?.energyGWh || designData.calculations?.annualGWh} <span className="text-sm text-slate-500">GWh</span></span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <p className="text-slate-500 mb-6">{t('riskReport.noDesignData', 'No latest technical design found.')}</p>
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
                                            {t('questionnaire.downloadPDF', 'Download Local Copy')}
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
                                            {!hasData ? t('riskReport.noDataButton', 'No Data') : 'Submit to HQ Archive'}
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