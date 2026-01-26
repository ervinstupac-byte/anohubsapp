// Visual Inspection Hub
// Interface for uploading blade photos and viewing AI diagnostics

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, ScanEye, AlertTriangle, FileCheck, Search } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { VisualInspectionService, InspectionResult, DamageType } from '../services/VisualInspectionService';

export const VisualInspectionHub: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<InspectionResult | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setSelectedImage(e.target?.result as string);
        reader.readAsDataURL(file);

        // Analysis
        setIsAnalyzing(true);
        setResult(null);

        try {
            const data = await VisualInspectionService.analyzeImage(file);
            setResult(data);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <ScanEye className="text-purple-400" />
                Blade Vision <span className="text-slate-500 text-sm normal-case border-l border-slate-700 pl-3">Gemini Powered Inspection</span>
            </h2>

            <div className="grid grid-cols-12 gap-6 flex-1">

                {/* 1. IMAGE AREA */}
                <div className="col-span-12 lg:col-span-7 flex flex-col">
                    <GlassCard className="flex-1 relative overflow-hidden bg-black/40 flex items-center justify-center border-dashed border-2 border-slate-700 min-h-[400px]">

                        {!selectedImage && (
                            <div className="text-center p-8">
                                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-white font-bold text-lg mb-2">Upload Blade Photo</h3>
                                <p className="text-slate-400 text-sm mb-6">Support for macro shots of Kaplan blades, Francis runners, and Pelton buckets.</p>
                                <label className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded cursor-pointer transition-colors">
                                    <Camera className="w-4 h-4" />
                                    <span>Select Image</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            </div>
                        )}

                        {selectedImage && (
                            <>
                                <img src={selectedImage} alt="Analysis Target" className="max-h-full max-w-full object-contain opacity-50 transition-opacity duration-1000" style={{ opacity: isAnalyzing ? 0.3 : 0.8 }} />

                                {/* SCANNING EFFECT */}
                                {isAnalyzing && (
                                    <div className="absolute inset-0 z-10 overflow-hidden">
                                        <motion.div
                                            className="w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                                            animate={{ top: ['0%', '100%'] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="px-4 py-2 bg-slate-900/80 rounded border border-cyan-500 text-cyan-400 font-mono text-xs animate-pulse">
                                                ANALYZING SURFACE TOPOLOGY...
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* OVERLAYS - BOUNDING BOXES */}
                                {!isAnalyzing && result && result.detectedDamage.map((dmg) => (
                                    <motion.div
                                        key={dmg.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute border-2 border-red-500 bg-red-500/10 z-20"
                                        style={{
                                            left: `${dmg.rect.x * 100}%`,
                                            top: `${dmg.rect.y * 100}%`,
                                            width: `${dmg.rect.w * 100}%`,
                                            height: `${dmg.rect.h * 100}%`
                                        }}
                                    >
                                        <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold uppercase whitespace-nowrap">
                                            {dmg.type.replace('_', ' ')} ({(dmg.severity * 100).toFixed(0)}%)
                                        </div>
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </GlassCard>
                </div>

                {/* 2. DIAGNOSTICS PANEL */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Status Card */}
                    <GlassCard className="p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Inspection Summary</h3>

                        {!result ? (
                            <div className="h-32 flex items-center justify-center text-slate-600 text-sm italic">
                                Waiting for analysis...
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* EFFICIENCY IMPACT */}
                                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-red-400 uppercase">Est. Efficiency Loss</span>
                                        <span className="text-2xl font-black text-white">
                                            -{result.estimatedEfficiencyLoss.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-full" style={{ width: `${result.estimatedEfficiencyLoss * 20}%` }}></div>
                                    </div>
                                </div>

                                {/* FINDINGS LIST */}
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Detected Anomalies</div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {result.detectedDamage.length === 0 ? (
                                            <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                                <FileCheck className="w-4 h-4" />
                                                No significant surface defects.
                                            </div>
                                        ) : (
                                            result.detectedDamage.map((d) => (
                                                <div key={d.id} className="p-3 bg-slate-800/50 rounded border-l-2 border-red-500">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-white text-sm">{d.type}</span>
                                                        <span className="text-xs text-slate-500">Severity: {d.severity.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">{d.description}</p>
                                                    <div className="text-[10px] text-cyan-400 mt-2 font-mono">
                                                        Roughness: {VisualInspectionService.estimateHydraulicRoughness(d.severity, d.type)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* RECOMMENDATIONS */}
                                <div className="pt-4 border-t border-slate-700/50">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Recommendations</div>
                                    <ul className="space-y-1">
                                        {result.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                <span className="text-cyan-500 mt-1">▸</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
