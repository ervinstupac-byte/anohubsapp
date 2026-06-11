import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { AssetOnboardingWizard } from './digital-twin/AssetOnboardingWizard.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT KOMPONENTE AssetPicker
export const AssetPicker: React.FC = () => {
    const { assets, selectedAsset, selectAsset, loading, addAsset } = useAssetContext();
    const { t } = useTranslation();

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickName, setQuickName] = useState('');
    const [quickType, setQuickType] = useState<'FRANCIS'|'PELTON'|'KAPLAN'>('FRANCIS');
    const [quickCapacity, setQuickCapacity] = useState<number | string>('');
    const [quickTelemetry, setQuickTelemetry] = useState(false);
    const [isAddingQuick, setIsAddingQuick] = useState(false);

    if (loading) return <div className="h-10 w-48 bg-slate-800/50 animate-pulse rounded-lg"></div>;

    return (
        <div className="flex items-center gap-2 relative">
            {/* PICKER DROPDOWN */}
            <div className="relative group min-w-[180px]">
                <select
                    value={selectedAsset?.id ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        // Pass the raw value; AssetContext will handle numeric vs string ids
                        selectAsset(e.target.value);
                    }}
                    className="appearance-none w-full bg-slate-900/80 border border-slate-700 text-white text-xs font-semibold uppercase tracking-wider rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer hover:bg-slate-800"
                >
                    <option value="" disabled>{t('assetPicker.selectContext', 'Select Asset')}</option>
                    {assets.map((asset) => (
                        <option key={String(asset.id)} value={String(asset.id)}>
                            {asset.name} ({asset.type})
                        </option>
                    ))}
                </select>

                {/* Custom Arrow Icon */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* REGISTER BUTTON */}
            <button
                onClick={() => setShowQuickAdd((s) => !s)}
                className="
                    flex items-center justify-center w-8 h-8 rounded 
                    bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 
                    hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_cyan] 
                    transition-all duration-300 group
                "
                title={t('assetWizard.title', 'Register New Asset')}
            >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>

            {/* QUICK ADD POPOVER */}
            {showQuickAdd && (
                <div className="absolute mt-2 right-0 w-80 bg-slate-900/95 border border-slate-800 rounded-lg p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold">{t('assetPicker.quickAdd.title','Quick Add Asset')}</div>
                        <button onClick={() => setShowQuickAdd(false)} className="text-xs text-slate-500 hover:text-white">{t('common.reset','Close')}</button>
                    </div>

                    <div className="space-y-2">
                        <div>
                            <label className="text-[11px] text-slate-400">{t('assetPicker.quickAdd.plantName','Plant name')}</label>
                            <input value={quickName} onChange={(e) => setQuickName(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-800 text-white text-xs" placeholder={t('assetPicker.quickAdd.plantNamePlaceholder','e.g. Upper River HPP')} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[11px] text-slate-400">{t('assetPicker.quickAdd.type','Turbine type')}</label>
                                <select value={quickType} onChange={(e) => setQuickType(e.target.value as any)} className="w-full mt-1 p-2 rounded bg-slate-800 text-white text-xs">
                                    <option value="FRANCIS">FRANCIS</option>
                                    <option value="PELTON">PELTON</option>
                                    <option value="KAPLAN">KAPLAN</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400">{t('assetPicker.quickAdd.capacity','Capacity (MW)')}</label>
                                <input type="number" value={String(quickCapacity)} onChange={(e) => setQuickCapacity(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-800 text-white text-xs" placeholder={t('assetPicker.quickAdd.capacityPlaceholder','e.g. 12.5')} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={quickTelemetry} onChange={(e) => setQuickTelemetry(e.target.checked)} />
                                <span className="text-[11px] text-slate-400">{t('assetPicker.quickAdd.telemetry','Configure telemetry now')}</span>
                            </label>
                            <div className="flex gap-2">
                                <button onClick={() => { setShowQuickAdd(false); setIsWizardOpen(true); }} className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 hover:bg-slate-700">{t('assetPicker.quickAdd.advanced','Advanced')}</button>
                                <button onClick={async () => {
                                    if (!quickName) return alert(t('assetPicker.quickAdd.enterName', 'Please enter a name'));
                                    setIsAddingQuick(true);
                                    try {
                                        await addAsset({
                                            name: quickName,
                                            type: 'HPP',
                                            location: '',
                                            coordinates: [0,0],
                                            capacity: parseFloat(String(quickCapacity)) || 0,
                                            status: 'Operational',
                                            turbine_type: quickType,
                                            specs: { telemetry: { enabled: quickTelemetry } }
                                        });
                                        setShowQuickAdd(false);
                                        setQuickName(''); setQuickCapacity(''); setQuickTelemetry(false);
                                    } catch (err) {
                                        console.error('Quick add failed', err);
                                        alert('Failed to add asset');
                                    } finally {
                                        setIsAddingQuick(false);
                                    }
                                }} className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold">{isAddingQuick ? t('common.simulate','Adding...') : t('assetPicker.quickAdd.add','Add')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* WIZARD MODAL */}
            <AssetOnboardingWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
            />
        </div>
    );
};
