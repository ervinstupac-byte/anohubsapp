/**
 * ServiceChecklistUI - Framer Motion Interactive Checklist
 * Tablet-optimized sliding interface for field technicians
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Camera, Mic, MicOff } from 'lucide-react';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { ServiceChecklistEngine } from '../../services/ServiceChecklistEngine';
import { ChecklistItem } from '../../types/checklist';
import { PrecisionInput } from '../precision/PrecisionInput';
import { HistoricalMeasurement, PrecisionMeasurement } from '../../types/trends';

export const ServiceChecklistUI: React.FC = () => {
    const { activeChecklist, updateChecklistItem, addFieldNote } = useMaintenance();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);

    if (!activeChecklist) {
        return <div className="text-white">No active checklist</div>;
    }

    const template = ServiceChecklistEngine.getTemplateForTurbine(activeChecklist.turbineType);
    const allItems = ServiceChecklistEngine.getAllItems(template);
    const currentItem = allItems[currentIndex];
    const response = activeChecklist.items.find(r => r.itemId === currentItem.id);



    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleMeasurementChange = (value: number) => {
        updateChecklistItem(currentItem.id, value);
    };

    const commitMeasurementToHistory = () => {
        if (!response || response.measurementValue === undefined) return;
        if (!activeChecklist) return;

        // Create standard historical measurement
        const measurement: HistoricalMeasurement = {
            timestamp: new Date().toISOString(),
            value: response.measurementValue,
            technicianName: "Service Technician", // Placeholder or from auth context
            checklistId: activeChecklist.id
        };

        // NC-300: Use ServiceChecklistEngine directly
        if (currentItem.measurementConfig) {
            const minValue = currentItem.measurementConfig.nominalValue - (currentItem.measurementConfig.tolerance * 3);
            const maxValue = currentItem.measurementConfig.nominalValue + (currentItem.measurementConfig.tolerance * 3);
            
            ServiceChecklistEngine.addMeasurement(
                activeChecklist.assetId,
                currentItem.id,
                response.measurementValue,
                (currentItem.measurementConfig.unit as 'mm' | 'bar' | 'rpm' | 'celsius') || 'mm',
                currentItem.measurementConfig.nominalValue,
                minValue,
                maxValue,
                currentItem.measurementConfig.tolerance
            );
        }

        // 2. If it's a precision item or explicitly marked, add to Engineering Log
        // Assuming tolerance < 0.1mm implies precision requirement
        const isPrecision = currentItem.measurementConfig && currentItem.measurementConfig.tolerance < 0.1;

        if (isPrecision) {
            // Calculate display strings properly
            const val = response.measurementValue;
            const hundredths = Math.round(val * 100);

            const precisionMeasurement: PrecisionMeasurement = {
                id: `pm_${Date.now()}_${currentItem.id}`,
                parameterId: currentItem.id,
                parameterName: currentItem.label,
                valueMM: val,
                displayValue: `${val.toFixed(2)}${currentItem.measurementConfig?.unit}`,
                precisionValue: `${hundredths} hundredths`,

                measuredAt: new Date().toISOString(),
                measuredBy: "Service Technician",

                // Digital Signature Placeholder
                signature: {
                    engineerName: "Service Technician",
                    engineerLicense: "PENDING",
                    signedAt: new Date().toISOString(),
                    signatureHash: "PENDING_HASH"
                },

                // Context
                temperature: 20, // Default or ideally from sensor context
                measurementMethod: 'MICROMETER'
            };

            // NC-300: Log precision measurement (would be persisted in a future enhancement)
            console.log('[ServiceChecklistUI] Precision measurement recorded:', precisionMeasurement);
        }
    };

    const handleNext = () => {
        // Sync measurement when moving to next item
        if (currentItem.type === 'MEASUREMENT') {
            commitMeasurementToHistory();
        }

        if (currentIndex < allItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleBooleanChange = (value: boolean) => {
        updateChecklistItem(currentItem.id, value);
    };

    const handleVoiceNote = () => {
        // Simple placeholder for speech recognition
        if (!isRecording) {
            setIsRecording(true);
            // In production, use Web Speech API here
            setTimeout(() => {
                const simulatedTranscript = "Uređaj provjeren, sve u redu.";
                addFieldNote(currentItem.id, simulatedTranscript);
                setIsRecording(false);
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span>{activeChecklist.progress.completedItems} / {activeChecklist.progress.totalItems} Items</span>
                    <span>{Math.round((activeChecklist.progress.completedItems / activeChecklist.progress.totalItems) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#2dd4bf]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(activeChecklist.progress.completedItems / activeChecklist.progress.totalItems) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#2dd4bf]">{activeChecklist.turbineType} Service</h2>
                <p className="text-slate-400">{activeChecklist.assetName}</p>
            </div>

            {/* Checklist Item Slider */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentItem.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6"
                >
                    {/* Item Label */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-1">{currentItem.label}</h3>
                        <p className="text-sm text-slate-400">{currentItem.labelDE}</p>
                    </div>

                    {/* Item Input based on type */}
                    {currentItem.type === 'MEASUREMENT' && currentItem.measurementConfig && (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-6">
                                <PrecisionInput
                                    value={response?.measurementValue || currentItem.measurementConfig.nominalValue}
                                    onChange={handleMeasurementChange}
                                    unit={currentItem.measurementConfig.unit as 'mm'}
                                    min={currentItem.measurementConfig.minValue}
                                    max={currentItem.measurementConfig.maxValue}
                                    label={`Measured Value (${currentItem.measurementConfig.unit})`}
                                />
                            </div>

                            {/* Validation Feedback */}
                            {response && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded border ${response.validationResult.severity === 'OK'
                                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                                        : response.validationResult.severity === 'WARNING'
                                            ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                                            : 'bg-red-950/30 border-red-500/50 text-red-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {response.validationResult.severity === 'CRITICAL' && <AlertTriangle className="w-5 h-5" />}
                                        {response.validationResult.severity === 'OK' && <CheckCircle className="w-5 h-5" />}
                                        <span className="font-bold">{response.validationResult.severity}</span>
                                    </div>
                                    <p className="text-sm">{response.validationResult.message}</p>
                                    {response.validationResult.deviation !== undefined && (
                                        <p className="text-xs mt-2">
                                            Deviation: {response.validationResult.deviation.toFixed(3)} {currentItem.measurementConfig.unit}
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            <div className="text-xs text-slate-500 p-3 bg-slate-950 rounded">
                                <strong>Tolerance:</strong> ± {currentItem.measurementConfig.tolerance} {currentItem.measurementConfig.unit}
                                <br />
                                <strong>Range:</strong> {currentItem.measurementConfig.minValue} - {currentItem.measurementConfig.maxValue} {currentItem.measurementConfig.unit}
                            </div>
                        </div>
                    )}

                    {currentItem.type === 'BOOLEAN' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleBooleanChange(true)}
                                className={`flex-1 py-4 rounded font-bold transition-all ${response?.booleanValue === true
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                ✓ YES / JA
                            </button>
                            <button
                                onClick={() => handleBooleanChange(false)}
                                className={`flex-1 py-4 rounded font-bold transition-all ${response?.booleanValue === false
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                ✗ NO / NEIN
                            </button>
                        </div>
                    )}

                    {currentItem.type === 'PHOTO' && (
                        <div>
                            <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center gap-2">
                                <Camera className="w-5 h-5" />
                                Take Photo ({currentItem.photoConfig?.minPhotos} required)
                            </button>
                        </div>
                    )}

                    {/* Expert Notes */}
                    {currentItem.expertNotes && (
                        <div className="mt-4 p-3 bg-blue-950/20 border border-blue-500/30 rounded text-sm text-blue-200">
                            <strong>💡 Expert Note:</strong> {currentItem.expertNotes}
                        </div>
                    )}

                    {/* Voice Note Button */}
                    <button
                        onClick={handleVoiceNote}
                        disabled={isRecording}
                        className={`mt-4 w-full py-3 rounded flex items-center justify-center gap-2 transition-all ${isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                    >
                        {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        {isRecording ? 'Recording...' : 'Add Voice Note'}
                    </button>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === allItems.length - 1}
                    className="flex-1 py-4 bg-[#2dd4bf] hover:bg-emerald-400 text-black disabled:opacity-30 disabled:cursor-not-allowed rounded flex items-center justify-center gap-2 font-bold"
                >
                    Next
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Item Counter */}
            <div className="text-center text-slate-500 text-sm mt-4">
                Item {currentIndex + 1} of {allItems.length}
            </div>
        </div>
    );
};
