import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { Asset } from '../types.ts';

interface AssetRegistrationWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = ['identity', 'specs', 'risk'];

export const AssetRegistrationWizard: React.FC<AssetRegistrationWizardProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { addAsset } = useAssetContext();
    const { showToast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        type: 'HPP' as Asset['type'],
        location: '',
        capacity: '',
        units: '',
        criticalKpi: 'Availability'
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const capacityValue = parseFloat(formData.capacity);

        if (!formData.name || !formData.location || isNaN(capacityValue) || capacityValue <= 0) {
            // Basic validation for final submit
            // Ideally we validate step by step, but this is a fail-safe
            return;
        }

        setIsSubmitting(true);
        try {
            await addAsset({
                name: formData.name,
                type: formData.type,
                location: formData.location,
                coordinates: [45.0 + Math.random(), 16.0 + Math.random()], // Simulation
                capacity: capacityValue,
                status: 'Operational' // Default to "Initialization" logic could be here if supported
            });

            showToast(t('assetWizard.success', 'Asset registered successfully.'), 'success');
            onClose();
            // Reset form could go here if we didn't unmount
        } catch (error) {
            console.error(error);
            showToast(t('assetPicker.failToast'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Identity
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernInput
                            label={t('assetWizard.fields.name', 'Asset Name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. HEPP Mostar"
                            fullWidth
                        />
                        <ModernInput
                            label={t('assetWizard.fields.location', 'Location')}
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="River, Country"
                            fullWidth
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                {t('assetWizard.fields.type', 'Asset Type')}
                            </label>
                            <div className="flex gap-2">
                                {(['HPP', 'Solar', 'Wind'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${formData.type === type
                                                ? 'bg-cyan-500 text-white border-cyan-400'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 1: // Specs
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernInput
                            label={t('assetWizard.fields.capacity', 'Capacity (MW)')}
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            placeholder="0.0"
                            fullWidth
                        />
                        <ModernInput
                            label={t('assetWizard.fields.units', 'Number of Units')}
                            type="number"
                            value={formData.units}
                            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                            placeholder="1"
                            fullWidth
                        />
                    </div>
                );
            case 2: // Risk / KPI (Conceptual)
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h4 className="text-white font-bold mb-2">{t('assetWizard.fields.kpi', 'Critical KPI')}</h4>
                            <select
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                value={formData.criticalKpi}
                                onChange={(e) => setFormData({ ...formData, criticalKpi: e.target.value })}
                            >
                                <option value="Availability">Availability Factor</option>
                                <option value="Efficiency">Water-to-Wire Efficiency</option>
                                <option value="Vibration">Vibration Aggregate</option>
                            </select>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                            * {t('assetWizard.steps.risk')} will establish the baseline Execution Gap.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <GlassCard className="w-full max-w-lg border-t-4 border-t-cyan-500">
                {/* HEAD */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white">{t('assetWizard.title')}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                </div>

                {/* PROGRESS BAR */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -z-10"></div>
                    {STEPS.map((s, idx) => (
                        <div key={s} className="flex flex-col items-center gap-2 bg-slate-900 px-2 z-10">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                                ${idx <= currentStep ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 'border-slate-700 bg-slate-800 text-slate-500'}
                            `}>
                                {idx + 1}
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${idx <= currentStep ? 'text-cyan-400' : 'text-slate-600'}`}>
                                {t(`assetWizard.steps.${s}`)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* BODY */}
                <div className="min-h-[250px]">
                    {renderStepContent()}
                </div>

                {/* FOOTER */}
                <div className="flex justify-between gap-4 mt-6 pt-6 border-t border-white/5">
                    <ModernButton
                        onClick={currentStep === 0 ? onClose : handlePrev}
                        variant="ghost"
                    >
                        {currentStep === 0 ? t('actions.cancel', 'Cancel') : t('assetWizard.buttons.prev', 'Previous')}
                    </ModernButton>

                    {currentStep === STEPS.length - 1 ? (
                        <ModernButton
                            onClick={handleSubmit}
                            variant="primary"
                            isLoading={isSubmitting}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        >
                            {t('assetWizard.buttons.register', 'Register Asset')}
                        </ModernButton>
                    ) : (
                        <ModernButton
                            onClick={handleNext}
                            variant="secondary"
                        >
                            {t('assetWizard.buttons.next', 'Next Step')}
                        </ModernButton>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
