import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // DODANO: Za internacionalizaciju
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { ModernInput } from './ui/ModernInput.tsx';

// Tipovi koji bi trebali odgovarati tvojoj Asset definiciji
const TURBINE_TYPES = ['Kaplan', 'Francis', 'Pelton', 'Pumping'] as const;
type TurbineType = typeof TURBINE_TYPES[number];

// OVO JE JEDINA DEKLARACIJA I EKSPORT KOMPONENTE AssetPicker
export const AssetPicker: React.FC = () => {
    const { assets, selectedAsset, selectAsset, addAsset, loading } = useAssetContext();
    const { showToast } = useToast();
    const { t } = useTranslation(); // DODANO: Hook za prevođenje

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<TurbineType>('Kaplan'); // Tipiziran state
    const [newLocation, setNewLocation] = useState('');
    const [newCapacity, setNewCapacity] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const capacityValue = parseFloat(newCapacity);

        // Validacija: Sva polja su obavezna i Kapacitet mora biti pozitivan broj
        if (!newName || !newLocation || isNaN(capacityValue) || capacityValue <= 0) {
            showToast(t('assetPicker.validationError', 'Please fill all fields correctly, including a valid positive capacity.'), 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await addAsset({
                name: newName,
                type: 'HPP', // FORCE HPP for now (as the picker only shows turbine types)
                location: newLocation,
                coordinates: [45.0, 16.0], // Default placeholder coordinates
                capacity: capacityValue, // Koristimo parsiranu vrijednost
                status: 'Operational'
            });

            showToast(t('assetPicker.successToast', 'New asset registered successfully'), 'success');
            setIsModalOpen(false);

            // Reset form
            setNewName('');
            setNewLocation('');
            setNewCapacity('');
            setNewType('Kaplan');
        } catch (error) {
            console.error('Asset creation failed:', error);
            showToast(t('assetPicker.failToast', 'Failed to create asset'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-10 w-48 bg-slate-800/50 animate-pulse rounded-lg"></div>;

    return (
        <>
            {/* PICKER DROPDOWN */}
            <div className="relative group min-w-[200px]">
                <select
                    value={selectedAsset?.id || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        if (e.target.value === 'NEW') {
                            setIsModalOpen(true);
                        } else {
                            selectAsset(e.target.value);
                        }
                    }}
                    className="appearance-none w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer hover:bg-slate-800"
                >
                    <option value="" disabled>{t('assetPicker.selectContext', 'Select Asset Context')}</option>
                    {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                            {asset.name} ({asset.type})
                        </option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="NEW" className="text-cyan-400 font-bold">
                        {t('assetPicker.registerNew', '+ Register New Asset')}
                    </option>
                </select>

                {/* Custom Arrow Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-cyan-900/20">

                        {/* Modal Header */}
                        <div className="bg-slate-950/50 p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">{t('assetPicker.modalTitle', 'Register New Asset')}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-500 hover:text-white transition-colors p-1"
                                aria-label={t('actions.close', 'Close')}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <ModernInput
                                label={t('assetPicker.labelName', 'Asset Name')}
                                value={newName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                                placeholder={t('assetPicker.placeholderName', 'e.g. HEPP Blagaj')}
                                fullWidth
                            />

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    {t('assetPicker.labelType', 'Turbine Type')}
                                </label>
                                <div className="grid grid-cols-4 gap-2"> {/* AŽURIRANO NA 4 KOLONE */}
                                    {TURBINE_TYPES.map((type) => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setNewType(type)}
                                            className={`
                                                py-2 rounded-lg text-xs font-bold border transition-all
                                                ${newType === type
                                                    ? 'bg-cyan-500 text-white border-cyan-400'
                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}
                                            `}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ModernInput
                                label={t('assetPicker.labelLocation', 'Location')}
                                value={newLocation}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLocation(e.target.value)}
                                placeholder={t('assetPicker.placeholderLocation', 'River, Country')}
                                fullWidth
                                icon={<span>📍</span>}
                            />

                            <ModernInput
                                label={t('assetPicker.labelCapacity', 'Capacity (MW)')}
                                type="number"
                                value={newCapacity}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCapacity(e.target.value)}
                                placeholder="0.0"
                                fullWidth
                                icon={<span>⚡</span>}
                            />

                            <div className="pt-4 flex gap-3">
                                <ModernButton
                                    onClick={() => setIsModalOpen(false)}
                                    variant="ghost"
                                    className="flex-1"
                                    type="button"
                                >
                                    {t('actions.cancel', 'Cancel')}
                                </ModernButton>
                                <ModernButton
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={isSubmitting}
                                >
                                    {t('assetPicker.registerButton', 'Register Asset')}
                                </ModernButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};