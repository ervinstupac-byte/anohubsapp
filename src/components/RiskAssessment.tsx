import React, { useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx'; // <--- NOVO: AssetPicker & Context
import { QUESTIONS } from '../constants.ts';
import type { Question } from '../types.ts';

// Glavna komponenta za Risk Assessment
export const RiskAssessment: React.FC<{ onShowSummary: () => void }> = ({ onShowSummary }) => {
    const { navigateToHub } = useNavigation();
    const { answers, setAnswer, operationalData, setOperationalData, description, setDescription } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk } = useRisk();
    const { showToast } = useToast();
    const { user } = useAuth();
    
    // --- NOVO: Asset Context ---
    const { selectedAsset, loading: assetsLoading } = useAssetContext(); 

    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        // Obavezno provjeri Asset prije pokretanja ankete
        if (!selectedAsset) {
            showToast('Please select a Target Asset before proceeding.', 'warning');
            return;
        }

        if (currentStep < QUESTIONS.length + 1) { // +1 za Operational Data
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            navigateToHub(); // Ako se vrati s prvog koraka, ide na Hub
        }
    };

    // Glavni submit - vodi na Summary (koji će se pobrinuti za slanje u bazu)
    const handleComplete = () => {
        if (!selectedAsset) {
            showToast('Asset selection is required to finalize assessment.', 'error');
            return;
        }
        
        calculateAndSetQuestionnaireRisk(answers);
        showToast('Assessment Complete! Generating Analysis...', 'success');
        onShowSummary();
    };

    const isQuestionStep = currentStep >= 0 && currentStep < QUESTIONS.length;
    const isOperationalStep = currentStep === QUESTIONS.length;
    const isDescriptionStep = currentStep === QUESTIONS.length + 1;

    const currentQuestion = isQuestionStep ? QUESTIONS[currentStep] : null;
    const progress = Math.round((currentStep / (QUESTIONS.length + 1)) * 100);

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            
            {/* 1. ASSET PICKER (NOVO) */}
            <AssetPicker />

            {/* 2. HEADER */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Execution Gap Diagnostic</h2>
                <div className="text-xl font-mono text-cyan-400">
                    {isQuestionStep && `QUESTION ${currentStep + 1} / ${QUESTIONS.length}`}
                    {isOperationalStep && 'OPERATIONAL DATA'}
                    {isDescriptionStep && 'FINAL NOTES'}
                </div>
            </div>

            {/* 3. PROGRESS BAR */}
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            {/* 4. CONTENT */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700 min-h-[300px] flex flex-col justify-between">
                
                {/* A. QUESTION STEP */}
                {isQuestionStep && currentQuestion && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-white leading-relaxed">{currentQuestion.text}</h3>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => setAnswer(currentQuestion.id, option)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-3 ${answers[currentQuestion.id] === option ? 'bg-cyan-700/50 border-cyan-500 shadow-lg' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 ${answers[currentQuestion.id] === option ? 'border-white bg-cyan-500' : 'border-slate-500'}`}></span>
                                    <span className="text-white">{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* B. OPERATIONAL DATA STEP */}
                {isOperationalStep && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-white">Operational Data (For Context)</h3>
                        <p className="text-slate-400">These inputs are crucial for the AI analysis model.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Commissioning Year</label>
                                <input type="number" value={operationalData.commissioningYear} onChange={e => setOperationalData('commissioningYear', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" placeholder="2005" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Maintenance Cycle (Years)</label>
                                <input type="number" value={operationalData.maintenanceCycle} onChange={e => setOperationalData('maintenanceCycle', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" placeholder="5" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Power Output (MW)</label>
                                <input type="number" value={operationalData.powerOutput} onChange={e => setOperationalData('powerOutput', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white" placeholder="120" />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Turbine Type</label>
                                <select value={operationalData.turbineType} onChange={e => setOperationalData('turbineType', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white">
                                    <option>Francis</option><option>Kaplan</option><option>Pelton</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* C. DESCRIPTION STEP */}
                 {isDescriptionStep && (
                    <div className="space-y-6 animate-fade-in">
                         <h3 className="text-xl font-bold text-white">Field Engineer Notes</h3>
                         <p className="text-slate-400">Add any critical observations or context not covered by the questions.</p>
                         <textarea 
                             value={description} 
                             onChange={e => setDescription(e.target.value)} 
                             rows={6}
                             className="w-full bg-slate-900 border border-slate-600 rounded p-4 text-white resize-none"
                             placeholder="Observed high vibration on Unit 2 guide bearing, likely related to recent flooding."
                         ></textarea>
                         <p className="text-xs text-slate-500">Certified by: {user?.email || 'Guest'}</p>
                    </div>
                 )}

                {/* 5. NAVIGATION BUTTONS */}
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-700">
                    <button onClick={handlePrev} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors">
                        ← {currentStep === 0 ? 'Exit' : 'Previous'}
                    </button>
                    
                    {isDescriptionStep ? (
                        <button onClick={handleComplete} className={`px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transition-all ${Object.keys(answers).length < QUESTIONS.length ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={Object.keys(answers).length < QUESTIONS.length}>
                            Finalize & Analyze
                        </button>
                    ) : (
                        <button onClick={handleNext} className={`px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all ${isQuestionStep && !answers[currentQuestion?.id || ''] ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isQuestionStep && !answers[currentQuestion?.id || '']}>
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskAssessment;