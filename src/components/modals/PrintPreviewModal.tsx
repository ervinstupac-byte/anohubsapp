import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ShieldCheck, Activity, Droplets, Zap, Ruler, Settings, Loader2, Check, Printer, FileBarChart, Layers, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { TechnicalProjectState, DEFAULT_TECHNICAL_STATE } from '../../core/TechnicalSchema';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { ActionEngine } from '../../features/business/logic/ActionEngine';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { DossierRegistryService } from '../../services/DossierRegistryService';
import { saveLog } from '../../services/PersistenceService';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const telemetry = useTelemetryStore();

    // Construct state for report service from Telemetry Store
    const state: TechnicalProjectState = {
        ...DEFAULT_TECHNICAL_STATE,
        identity: telemetry.identity,
        hydraulic: telemetry.hydraulic,
        mechanical: telemetry.mechanical,
        physics: {
            ...DEFAULT_TECHNICAL_STATE.physics,
            ...telemetry.physics
        } as any, // Cast to any to avoid strict partial checks, or use defaults
        site: telemetry.site,
        penstock: telemetry.penstock,
        specializedState: telemetry.specializedState,
        fluidIntelligence: telemetry.fluidIntelligence,
        governor: telemetry.governor,
        diagnosis: telemetry.diagnosis || undefined,
        // riskScore is in TechnicalProjectState, checking if it is in telemetry
        riskScore: telemetry.riskScore || 0,
        lastRecalculation: telemetry.lastUpdate,
        demoMode: { 
            active: telemetry.activeScenario !== null, 
            scenario: telemetry.activeScenario 
        },
        structural: telemetry.structural,
        manualRules: telemetry.manualRules,
        appliedMitigations: telemetry.appliedMitigations,
        financials: telemetry.financials,
        images: telemetry.images
    };

    // NC-85.2: Dynamic dossier count from registry
    const [dossierCount, setDossierCount] = useState<number>(854); // Fallback to 854
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Print Settings Simulation
    const [settings, setSettings] = useState({
        orientation: 'PORTRAIT',
        colorMode: 'COLOR',
        paperSize: 'A4',
        includeCover: true
    });

    useEffect(() => {
        const loadDossierCount = async () => {
            try {
                const registry = DossierRegistryService.getInstance();
                const registryData = await registry.loadRegistry();
                if (registryData?.dossiers?.length) {
                    setDossierCount(registryData.dossiers.length);
                }
            } catch (e) {
                console.warn('[NC-85.2] Failed to load dossier count, using fallback');
            }
        };
        if (isOpen) loadDossierCount();
    }, [isOpen]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const { ForensicReportService } = await import('../../services/ForensicReportService');
            // Simulate processing delay for effect
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const blob = await ForensicReportService.generateProjectDossier({ state, t });
            ForensicReportService.openAndDownloadBlob(blob, `AnoHUB_Audit_${state.identity.assetName}_${new Date().toISOString().split('T')[0]}.pdf`, true, {
                assetId: state?.identity?.assetId || state?.selectedAsset?.id || null,
                projectState: state,
                reportType: 'PROJECT_DOSSIER'
            });

            // NC-25100: Log audit export
            saveLog({
                event_type: 'AUDIT_REPORT_GENERATED',
                reason: `Generated project dossier for ${state.identity.assetName}`,
                active_protection: 'NONE',
                details: {
                    settings,
                    assetName: state.identity.assetName || (state.identity as any).name || 'Unknown Asset',
                    dossierCount
                }
            });
        } catch (e) {
            console.warn('Print preview generate failed', e);
        } finally {
            setIsGenerating(false);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/95"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-7xl h-[90vh] flex shadow-none rounded-none overflow-hidden border border-slate-700"
                    >
                        {/* Sidebar: Settings */}
                        <div className="w-80 bg-slate-900 border-r border-white/10 p-6 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <button 
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-slate-800 rounded-none text-slate-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Print Configuration
                                </h3>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Orientation</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setSettings(s => ({ ...s, orientation: 'PORTRAIT' }))}
                                            className={`p-3 rounded-none border text-xs font-bold transition-all ${settings.orientation === 'PORTRAIT' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                        >
                                            Portrait
                                        </button>
                                        <button 
                                            onClick={() => setSettings(s => ({ ...s, orientation: 'LANDSCAPE' }))}
                                            className={`p-3 rounded-none border text-xs font-bold transition-all ${settings.orientation === 'LANDSCAPE' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                        >
                                            Landscape
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Color Mode</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setSettings(s => ({ ...s, colorMode: 'COLOR' }))}
                                            className={`p-3 rounded-none border text-xs font-bold transition-all ${settings.colorMode === 'COLOR' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                        >
                                            RGB Color
                                        </button>
                                        <button 
                                            onClick={() => setSettings(s => ({ ...s, colorMode: 'GRAYSCALE' }))}
                                            className={`p-3 rounded-none border text-xs font-bold transition-all ${settings.colorMode === 'GRAYSCALE' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                        >
                                            Grayscale
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Options</label>
                                    <label className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-none cursor-pointer hover:bg-slate-800 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.includeCover} 
                                            onChange={(e) => setSettings(s => ({ ...s, includeCover: e.target.checked }))}
                                            className="rounded-none bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500/20" 
                                        />
                                        <span className="text-sm text-slate-300">Include Cover Page</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-none shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            GENERATING...
                                        </>
                                    ) : (
                                        <>
                                            <Printer className="w-5 h-5" />
                                            GENERATE PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Main Preview Area */}
                        <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
                            {/* Header */}
                            <div className="h-16 border-b border-white/10 bg-slate-900/50 flex items-center justify-between px-8">
                                <div className="flex items-center gap-3">
                                    <FileBarChart className="w-5 h-5 text-cyan-400" />
                                    <h2 className="text-lg font-bold text-white tracking-wide">Project Dossier Preview</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-none text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Preview Canvas */}
                            <div className="flex-1 overflow-y-auto bg-slate-900/30 p-8 flex justify-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`bg-white shadow-none border border-slate-200 transition-all duration-500 ${settings.orientation === 'LANDSCAPE' ? 'w-[842px] h-[595px]' : 'w-[595px] h-[842px]'}`}
                                >
                                    {/* Simulated Document Content */}
                                    <div className="w-full h-full p-12 flex flex-col relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-10">
                                            <Layers className="w-64 h-64 text-slate-900" />
                                        </div>

                                        <div className="flex-1 z-10">
                                            <div className="border-b-4 border-slate-900 pb-4 mb-8">
                                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Confidential Audit</h1>
                                                <p className="text-slate-500 font-mono mt-2">ID: {state.identity.assetId || 'UNKNOWN'} • {new Date().toLocaleDateString()}</p>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-400 uppercase">Asset Name</span>
                                                    <span className="text-xl font-bold text-slate-800">{state.identity.assetName}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-400 uppercase">Turbine Type</span>
                                                    <span className="text-xl font-bold text-slate-800">{state.identity.turbineType}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                                                    <span className="text-sm font-bold text-slate-400 uppercase">Rated Power</span>
                                                    <span className="text-xl font-bold text-slate-800">{state.identity.machineConfig.ratedPowerMW} MW</span>
                                                </div>
                                            </div>

                                            <div className="mt-12 p-6 bg-slate-100 rounded-none border border-slate-200">
                                                <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Executive Summary</h3>
                                                <div className="space-y-2">
                                                    <div className="h-2 bg-slate-300 rounded-none w-full" />
                                                    <div className="h-2 bg-slate-300 rounded-none w-11/12" />
                                                    <div className="h-2 bg-slate-300 rounded-none w-4/5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex justify-between items-center text-[10px] font-mono text-slate-400 z-10">
                                            <span>GENERATED VIA ANOHUBS SOVEREIGN CORE</span>
                                            <span>PAGE 1 OF {dossierCount}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
