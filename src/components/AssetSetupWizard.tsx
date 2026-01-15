import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, ChevronRight, CheckCircle,
    Activity, Wind, Droplets, Zap,
    ArrowRight, Layout, Disc
} from 'lucide-react';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { Z_INDEX } from '../shared/design-tokens';
import { TurbineProfile } from '../types';

interface AssetSetupWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (assetDetails: any) => void;
}

type WizardStep = 'basics' | 'type' | 'config' | 'details';

export const AssetSetupWizard: React.FC<AssetSetupWizardProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState<WizardStep>('basics');
    const [assetData, setAssetData] = useState({
        name: '',
        capacity: 0,
        location: 'Plant A', // Default
        type: 'HPP' as const
    });
    const [profile, setProfile] = useState<Partial<TurbineProfile>>({
        specificParams: {}
    });

    const handleBasicsSubmit = () => {
        if (assetData.name && assetData.capacity > 0) {
            setStep('type');
        }
    };

    const handleTypeSelect = (type: 'francis' | 'kaplan' | 'pelton') => {
        setProfile(prev => ({ ...prev, type }));
        setStep('config');
    };

    const handleConfigSelect = (config: 'horizontal' | 'vertical') => {
        setProfile(prev => ({ ...prev, configuration: config }));
        setStep('details');
    };

    const handleDetailsSubmit = () => {
        if (profile.type && profile.configuration && profile.rpmNominal) {
            onComplete({
                ...assetData,
                turbineProfile: profile
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 ${Z_INDEX.modal} flex items-center justify-center p-4 bg-black/80 backdrop-blur-md`}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-slate-800/50 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-cyan-400" />
                                {step === 'basics' ? 'New Asset Registration' : 'Turbine Configuration'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {step === 'basics' && 'Step 1: Identity & Capacity'}
                                {step === 'type' && 'Step 2: Select Turbine Type'}
                                {step === 'config' && 'Step 3: Orientation & Layout'}
                                {step === 'details' && 'Step 4: Engineering Parameters'}
                            </p>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex gap-2">
                            {['basics', 'type', 'config', 'details'].map((s, idx) => (
                                <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full ${['basics', 'type', 'config', 'details'].indexOf(step) >= idx
                                            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                            : 'bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-8 min-h-[400px]">
                        {/* STEP 1: BASICS */}
                        {step === 'basics' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Asset Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                        placeholder="e.g. Unit G1 - Iron Gate"
                                        value={assetData.name}
                                        onChange={(e) => setAssetData(prev => ({ ...prev, name: e.target.value }))}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Rated Capacity (MW)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                        placeholder="e.g. 150"
                                        value={assetData.capacity || ''}
                                        onChange={(e) => setAssetData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                        value={assetData.location}
                                        onChange={(e) => setAssetData(prev => ({ ...prev, location: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: TYPE SELECTION */}
                        {step === 'type' && (
                            <div className="grid grid-cols-3 gap-4 h-full">
                                <SelectionCard
                                    title="Francis"
                                    description="Medium head, mixed flow reaction turbine."
                                    icon={<Disc className="w-8 h-8" />}
                                    onClick={() => handleTypeSelect('francis')}
                                    color="text-cyan-400"
                                />
                                <SelectionCard
                                    title="Kaplan"
                                    description="Low head, adjustable blade propeller."
                                    icon={<Wind className="w-8 h-8" />} // Visual metaphor
                                    onClick={() => handleTypeSelect('kaplan')}
                                    color="text-emerald-400"
                                />
                                <SelectionCard
                                    title="Pelton"
                                    description="High head, impulse bucket turbine."
                                    icon={<Droplets className="w-8 h-8" />}
                                    onClick={() => handleTypeSelect('pelton')}
                                    color="text-amber-400"
                                />
                            </div>
                        )}

                        {/* STEP 3: CONFIGURATION */}
                        {step === 'config' && (
                            <div className="grid grid-cols-2 gap-6 h-full">
                                <SelectionCard
                                    title="Vertical Axis"
                                    description="Typical for large hydro generators."
                                    icon={<Layout className="w-8 h-8 rotate-90" />}
                                    onClick={() => handleConfigSelect('vertical')}
                                    color="text-purple-400"
                                />
                                <SelectionCard
                                    title="Horizontal Axis"
                                    description="Common for Pelton and small Francis."
                                    icon={<Layout className="w-8 h-8" />}
                                    onClick={() => handleConfigSelect('horizontal')}
                                    color="text-blue-400"
                                />
                            </div>
                        )}

                        {/* STEP 4: SPECIFIC DETAILS */}
                        {step === 'details' && (
                            <div className="space-y-6">
                                {/* RPM Input (Common) */}
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Nominal RPM
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                        placeholder="e.g. 500"
                                        value={profile.rpmNominal || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, rpmNominal: Number(e.target.value) }))}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Used for ISO 10816 vibration threshold adjustment.
                                    </p>
                                </div>

                                {/* Dynamic Fields based on Type */}
                                {profile.type === 'francis' && (
                                    <>
                                        <div>
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Labyrinth Seal Type
                                            </label>
                                            <select
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                                onChange={(e) => setProfile(prev => ({
                                                    ...prev,
                                                    specificParams: { ...prev.specificParams, labyrinthType: e.target.value as any }
                                                }))}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="stepped">Stepped</option>
                                                <option value="smooth">Smooth</option>
                                                <option value="grooved">Grooved</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Guide Vane Count
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                                onChange={(e) => setProfile(prev => ({
                                                    ...prev,
                                                    specificParams: { ...prev.specificParams, guideVaneCount: Number(e.target.value) }
                                                }))}
                                            />
                                        </div>
                                    </>
                                )}

                                {profile.type === 'pelton' && (
                                    <>
                                        <div>
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Number of Nozzles
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                                onChange={(e) => setProfile(prev => ({
                                                    ...prev,
                                                    specificParams: { ...prev.specificParams, needleCount: Number(e.target.value) }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Nominal Needle Gap (mm)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                                onChange={(e) => setProfile(prev => ({
                                                    ...prev,
                                                    specificParams: { ...prev.specificParams, needleGap: Number(e.target.value) }
                                                }))}
                                            />
                                        </div>
                                    </>
                                )}

                                {profile.type === 'kaplan' && (
                                    <div>
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                            Number of Blades
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                specificParams: { ...prev.specificParams, bladeCount: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-6 border-t border-white/5 flex justify-between">
                        {step !== 'basics' && (
                            <ModernButton variant="ghost" onClick={() => setStep(prev =>
                                prev === 'details' ? 'config' :
                                    prev === 'config' ? 'type' :
                                        'basics'
                            )}>
                                Back
                            </ModernButton>
                        )}
                        <div className="flex-1" />
                        {step === 'basics' && (
                            <ModernButton variant="primary" onClick={handleBasicsSubmit} disabled={!assetData.name || assetData.capacity <= 0}>
                                Next Step
                            </ModernButton>
                        )}
                        {step === 'details' && (
                            <ModernButton variant="primary" onClick={handleDetailsSubmit} disabled={!profile.rpmNominal}>
                                Create Asset
                            </ModernButton>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const SelectionCard = ({ title, description, icon, onClick, color }: any) => (
    <div
        onClick={onClick}
        className="group relative p-6 bg-slate-800/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all hover:scale-[1.02] hover:shadow-xl hover:border-cyan-500/30"
    >
        <div className={`mb-4 ${color}`}>{icon}</div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
        </div>
    </div>
);
