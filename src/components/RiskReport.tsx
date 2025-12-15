import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from './AssetPicker.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { generateMasterDossier, generateMasterDossierBlob } from '../utils/pdfGenerator.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

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

    // --- 1. FETCH DATA FROM CLOUD ---
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedAsset) {
                setRiskData(null);
                setDesignData(null);
                return;
            }

            setLoading(true);
            try {
                // Dohvati zadnji Risk Assessment
                const { data: risk } = await supabase
                    .from('risk_assessments')
                    .select('*')
                    .eq('asset_id', selectedAsset.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Dohvati zadnji Design
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
                // Ignore error if just no rows found
                console.log('Status check:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedAsset]);

    // --- 2. HANDLER: LOCAL DOWNLOAD ---
    const handleDownload = () => {
        if (!selectedAsset) return;
        try {
            generateMasterDossier(
                selectedAsset.name,
                riskData,
                designData,
                user?.email || 'AnoHUB Engineer'
            );
            showToast(t('questionnaire.pdfDownloaded', 'PDF Downloaded successfully.'), 'success');
        } catch (err) {
            showToast('Error generating PDF', 'error');
        }
    };

    // --- 3. HANDLER: UPLOAD TO CLOUD (ENTERPRISE) ---
    const handleUploadToHQ = async () => {
        if (!selectedAsset || !user) return;
        setUploading(true);

        try {
            // A) Generiraj PDF Blob
            const pdfBlob = generateMasterDossierBlob(
                selectedAsset.name,
                riskData,
                designData,
                user.email || 'Engineer'
            );

            // B) Kreiraj putanju fajla: reports/USER_ID/ASSET_NAME_TIMESTAMP.pdf
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeAssetName = selectedAsset.name.replace(/\s+/g, '_');
            const fileName = `${safeAssetName}_${timestamp}.pdf`;
            const filePath = `${user.id}/${fileName}`;

            // C) Upload na Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('reports') // Mora postojati bucket 'reports'
                .upload(filePath, pdfBlob, {
                    contentType: 'application/pdf',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            showToast('Dossier successfully archived to HQ Cloud.', 'success');

        } catch (error: any) {
            console.error('Upload failed:', error);
            showToast(`Archive failed: ${error.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    // Helper za boje
    const getRiskColor = (level: string) => {
        if (level === 'High') return 'text-red-500 border-red-500';
        if (level === 'Medium') return 'text-yellow-400 border-yellow-400';
        return 'text-green-400 border-green-400';
    };

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
            <BackButton text={t('actions.back', 'Back to Hub')} />
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-700 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {t('riskReport.title')} <span className="text-cyan-400">{t('riskReport.dossier')}</span>
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-xl">
                        {t('riskReport.subtitle')}
                    </p>
                </div>
                
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                        {t('riskReport.activeContext')}
                    </div>
                    <div className="text-lg font-mono font-bold text-white bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
                        {selectedAsset ? (
                            <>
                                <span className={`w-2 h-2 rounded-full ${selectedAsset.status === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {selectedAsset.name}
                            </>
                        ) : (
                            <span className="text-slate-500 italic">{t('riskReport.noAsset')}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* EMPTY STATE */}
            {!selectedAsset ? (
                <div className="p-16 text-center border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/30">
                    <span className="text-6xl block mb-6 opacity-30">📂</span>
                    <h3 className="text-xl font-bold text-white mb-2">{t('riskReport.selectPromptTitle')}</h3>
                    <p className="text-slate-400">{t('riskReport.selectPromptDesc')}</p>
                </div>
            ) : loading ? (
                <div className="p-20 text-center">
                    <span className="animate-spin text-4xl block mb-4">⚙️</span>
                    <p className="text-cyan-400 font-mono animate-pulse">{t('riskReport.loading')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* RISK CARD */}
                    <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col h-full bg-slate-800 border border-slate-700 hover:border-cyan-500/30 transition-all shadow-lg">
                        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <span>🛡️</span> {t('riskReport.riskDiagnostic')}
                            </h3>
                            {riskData ? (
                                <span className="text-[10px] bg-slate-800 border border-slate-600 px-2 py-1 rounded text-slate-400 font-mono">
                                    ID: {riskData.id.toString().slice(0,4)}
                                </span>
                            ) : (
                                <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-1 rounded font-bold">{t('riskReport.missing')}</span>
                            )}
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col justify-center">
                            {riskData ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">{t('riskReport.riskLevel')}</span>
                                        <span className={`text-xl font-black uppercase ${getRiskColor(riskData.risk_level)}`}>
                                            {riskData.risk_level}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${riskData.risk_score > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${Math.min(riskData.risk_score * 2, 100)}%` }} 
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">{t('riskReport.gapScore')}</span>
                                        <span className="text-2xl font-mono text-white">{riskData.risk_score}/100</span>
                                    </div>
                                    <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700 text-xs text-slate-400 italic line-clamp-2">
                                        "{riskData.description || 'No additional notes provided.'}"
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-slate-500 text-sm mb-4">{t('riskReport.noRiskData')}</p>
                                    <button 
                                        onClick={() => navigateTo('riskAssessment')}
                                        className="text-xs bg-slate-700 hover:bg-cyan-600 text-white px-4 py-2 rounded transition-colors"
                                    >
                                        {t('riskReport.runDiagnostics')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESIGN CARD */}
                    <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col h-full bg-slate-800 border border-slate-700 hover:border-purple-500/30 transition-all shadow-lg">
                        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <span>⚙️</span> {t('riskReport.technicalDesign')}
                            </h3>
                            {designData ? (
                                <span className="text-[10px] bg-slate-800 border border-slate-600 px-2 py-1 rounded text-slate-400 font-mono">
                                    VER: {designData.created_at.slice(0,10)}
                                </span>
                            ) : (
                                <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-1 rounded font-bold">{t('riskReport.missing')}</span>
                            )}
                        </div>

                        <div className="p-6 flex-grow flex flex-col justify-center">
                            {designData ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                                            <div className="text-[10px] text-slate-500 uppercase">{t('riskReport.configuration')}</div>
                                            <div className="text-white font-bold truncate">{designData.design_name}</div>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                                            <div className="text-[10px] text-slate-500 uppercase">{t('riskReport.turbine')}</div>
                                            <div className="text-cyan-400 font-bold">{designData.recommended_turbine}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-700/50 pt-4">
                                        <div>
                                            <span className="text-slate-400 text-xs block">{t('riskReport.calcOutput')}</span>
                                            <span className="text-3xl font-black text-white">{designData.calculations?.powerMW} <span className="text-lg font-normal text-slate-500">MW</span></span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-400 text-xs block">{t('riskReport.annualEnergy')}</span>
                                            <span className="text-xl font-bold text-green-400">{designData.calculations?.energyGWh || designData.calculations?.annualGWh} <span className="text-xs text-slate-500">GWh</span></span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-slate-500 text-sm mb-4">{t('riskReport.noDesignData')}</p>
                                    <button 
                                        onClick={() => navigateTo('hppBuilder')}
                                        className="text-xs bg-slate-700 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                                    >
                                        {t('riskReport.openStudio')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTION AREA (Enterprise Features) */}
                    <div className="md:col-span-2 mt-6">
                        <div className="p-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-xl shadow-2xl">
                            <div className="bg-slate-900 rounded-lg p-8 text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">{t('riskReport.compileTitle')}</h3>
                                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                                    {t('riskReport.compileDesc')}
                                </p>
                                
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    {/* BUTTON 1: LOCAL DOWNLOAD */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={!riskData && !designData}
                                        className="px-6 py-3 rounded-xl font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>⬇️</span> {t('questionnaire.downloadPDF', 'Download Local Copy')}
                                    </button>

                                    {/* BUTTON 2: CLOUD ARCHIVE */}
                                    <button
                                        onClick={handleUploadToHQ}
                                        disabled={(!riskData && !designData) || uploading}
                                        className={`
                                            px-8 py-3 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3
                                            ${(!riskData && !designData) 
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                                                : uploading
                                                    ? 'bg-cyan-900 text-cyan-200 cursor-wait'
                                                    : 'bg-white text-slate-900 hover:bg-cyan-50 hover:scale-105'
                                            }
                                        `}
                                    >
                                        {(!riskData && !designData) ? (
                                            <><span>🚫</span> {t('riskReport.noDataButton')}</>
                                        ) : uploading ? (
                                            <><span>☁️</span> {t('questionnaire.uploading', 'Archiving...')}</>
                                        ) : (
                                            <><span>🚀</span> Submit to HQ Archive</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};