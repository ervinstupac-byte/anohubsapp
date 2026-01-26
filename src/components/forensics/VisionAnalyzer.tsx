import React, { useState } from 'react';
import { Upload, Info, CheckCircle, AlertTriangle, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';

export const VisionAnalyzer: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Mock Simulation Logic
    const simulateAnalysis = (type: 'PITTED' | 'POLISHED') => {
        setIsAnalyzing(true);
        setTimeout(() => {
            if (type === 'PITTED') {
                setAnalysisResult({
                    diagnosis: 'CAVITATION',
                    confidence: 94,
                    texture: 'Rough, Pitted surface detected',
                    advice: 'Critical: Surface micro-jets have removed material. Recommended: Stellite Welding overlay immediately.'
                });
            } else {
                setAnalysisResult({
                    diagnosis: 'ABRASIVE EROSION',
                    confidence: 89,
                    texture: 'Smooth, Wavy pattern detected',
                    advice: 'Warning: Sand particles polishing the surface. Recommended: Apply Ceramic Coating (Tungsten Carbide).'
                });
            }
            setIsAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-[#2dd4bf]" /> Texture Forensics
            </h3>

            {/* Upload Area / Simulation Controls */}
            <div className="flex-1 bg-black/20 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center p-8 relative">
                {!image ? (
                    <div className="text-center space-y-4">
                        <Upload className="w-12 h-12 text-slate-500 mx-auto" />
                        <p className="text-slate-400 text-sm">Drag drop damage photos to analyze texture.</p>
                        <div className="flex gap-2 justify-center mt-4">
                            <button onClick={() => { setImage('pitted'); simulateAnalysis('PITTED'); }} className="px-3 py-1 bg-slate-800 text-xs rounded border border-slate-700 hover:bg-slate-700">Simulate: Pitted</button>
                            <button onClick={() => { setImage('polished'); simulateAnalysis('POLISHED'); }} className="px-3 py-1 bg-slate-800 text-xs rounded border border-slate-700 hover:bg-slate-700">Simulate: Polished</button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center">
                        <div className="w-full h-48 bg-slate-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                            {/* Visual Placeholder for the "Image" */}
                            <div className={`w-32 h-32 rounded-full ${image === 'pitted' ? 'bg-gradient-to-br from-slate-700 to-black opacity-80 backdrop-filter backdrop-blur-sm border-4 border-slate-600 border-dashed' : 'bg-gradient-to-r from-blue-900 via-slate-800 to-blue-900 opacity-90'}`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isAnalyzing && <span className="animate-pulse text-[#2dd4bf] font-mono font-bold">SCANNING TEXTURE...</span>}
                            </div>
                        </div>

                        {analysisResult && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full bg-slate-900/50 p-4 rounded-lg border border-white/10"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className={`text-xl font-black uppercase ${analysisResult.diagnosis === 'CAVITATION' ? 'text-red-500' : 'text-amber-500'}`}>
                                            {analysisResult.diagnosis}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-mono">Confidence: {analysisResult.confidence}%</p>
                                    </div>
                                    {analysisResult.diagnosis === 'CAVITATION' ? <AlertTriangle className="text-red-500" /> : <Info className="text-amber-500" />}
                                </div>
                                <p className="text-sm text-slate-300 mb-3 border-l-2 border-slate-600 pl-2 italic">
                                    "{analysisResult.texture}"
                                </p>
                                <div className="bg-[#2dd4bf]/10 p-3 rounded border border-[#2dd4bf]/20">
                                    <p className="text-xs text-[#2dd4bf] font-bold uppercase mb-1">Actionable Advice:</p>
                                    <p className="text-sm text-white">{analysisResult.advice}</p>
                                </div>

                                <button onClick={() => { setImage(null); setAnalysisResult(null); }} className="mt-4 text-xs text-slate-500 hover:text-white underline w-full text-center">Reset Analysis</button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
