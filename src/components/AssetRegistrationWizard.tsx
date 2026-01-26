import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Orbit, Fan, Droplets, CircleDotDashed, Zap, RefreshCcw, Sun, Wind } from 'lucide-react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { GlassCard } from '../shared/components/ui/GlassCard';
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
    const [specificType, setSpecificType] = useState<string>('Kaplan');
    const [formData, setFormData] = useState({
        name: '',
        type: 'HPP' as Asset['type'],
        location: '',
        capacity: '',
        units: '',
        criticalKpi: 'Availability',
        specs: {} as any
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
                status: 'Operational',
                specs: formData.specs
            });

            showToast(t('assetWizard.success'), 'success');
            onClose();
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
                            label={t('assetWizard.fields.name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. HEPP Mostar"
                            fullWidth
                        />
                        <ModernInput
                            label={t('assetWizard.fields.location')}
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="River, Country"
                            fullWidth
                        />
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                {t('assetWizard.fields.type')}
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {(['Kaplan', 'Francis', 'Pelton', 'Bulb', 'Pumping', 'Solar', 'Wind'] as const).map((label) => {
                                    const isSelected = specificType === label;

                                    // Icon Mapping
                                    let Icon = Zap; // Default

                                    switch (label) {
                                        case 'Francis': Icon = Orbit; break;
                                        case 'Pelton': Icon = Droplets; break;
                                        case 'Kaplan': Icon = Fan; break;
                                        case 'Bulb': Icon = CircleDotDashed; break;
                                        case 'Pumping': Icon = RefreshCcw; break;
                                        case 'Solar': Icon = Sun; break;
                                        case 'Wind': Icon = Wind; break;
                                    }

                                    return (
                                        <div
                                            key={label}
                                            onClick={() => {
                                                const isHpp = ['Kaplan', 'Francis', 'Pelton', 'Bulb', 'Pumping'].includes(label);
                                                setSpecificType(label);
                                                setFormData({ ...formData, type: isHpp ? 'HPP' : (label as Asset['type']) });
                                            }}
                                            className={`
                                                relative group cursor-pointer p-3 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2
                                                ${isSelected
                                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                                    : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-800'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                p-2 rounded-full transition-colors duration-300
                                                ${isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-700'}
                                            `}>
                                                <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                                            </div>

                                            <div className="text-center">
                                                <span className={`block text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                                    {label}
                                                </span>
                                                <span className="block text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
                                                    {t(`assetWizard.types.${label.toLowerCase()}Desc`)}
                                                </span>
                                            </div>

                                            {/* Active Indicator Dot */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)] animate-pulse" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            case 1: // Specs
                return (
                    <div className="space-y-4 animate-fade-in">
                        <ModernInput
                            label={t('assetWizard.fields.capacity')}
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            placeholder="0.0"
                            fullWidth
                        />
                        <ModernInput
                            label={t('assetWizard.fields.units')}
                            type="number"
                            value={formData.units}
                            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                            placeholder="1"
                            fullWidth
                        />

                        {/* FRANCIS HORIZONTAL SPECIFIC FIELDS */}
                        {specificType === 'Francis' && (
                            <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-900/50 space-y-4 animate-in slide-in-from-right-4">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-cyan-900/30 pb-2">
                                    Francis Horizontal Specs
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <ModernInput
                                        label={t('assetWizard.specs.spiralCasePressure')}
                                        type="number"
                                        placeholder="e.g. 16.5"
                                        className="bg-slate-900"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            specs: { ...prev.specs, spiralCasePressure: parseFloat(e.target.value) }
                                        }))}
                                    />
                                    <ModernInput
                                        label={t('assetWizard.specs.guideVaneCount')}
                                        type="number"
                                        placeholder="e.g. 12"
                                        className="bg-slate-900"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            specs: { ...prev.specs, guideVaneCount: parseInt(e.target.value) }
                                        }))}
                                    />
                                    <ModernInput
                                        label={t('assetWizard.specs.runnerDiameter')}
                                        type="number"
                                        placeholder="e.g. 850"
                                        className="bg-slate-900"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            specs: { ...prev.specs, runnerDiameter: parseFloat(e.target.value) }
                                        }))}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-400">{t('assetWizard.specs.draftTubeVacuum')}</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="-0.3"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                specs: { ...prev.specs, draftTubeVacuum: parseFloat(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400">{t('assetWizard.specs.bearingType')}</label>
                                    <div className="flex gap-2">
                                        {['Roller', 'Slide'].map(bt => (
                                            <button
                                                key={bt}
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    specs: { ...prev.specs, bearingType: bt }
                                                }))}
                                                className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${formData.specs?.bearingType === bt ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500'}`}
                                            >
                                                {bt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2: // Risk / KPI (Conceptual)
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h4 className="text-white font-bold mb-2">{t('assetWizard.fields.kpi')}</h4>
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
