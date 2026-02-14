import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { AssetOnboardingWizard } from './digital-twin/AssetOnboardingWizard';

// OVO JE JEDINA DEKLARACIJA I EKSPORT KOMPONENTE AssetPicker
export const AssetPicker: React.FC = () => {
    const { assets, selectedAsset, selectAsset, loading } = useAssetContext();
    const { t } = useTranslation();

    const [isWizardOpen, setIsWizardOpen] = useState(false);

    if (loading) return <div className="h-10 w-48 bg-slate-800/50 animate-pulse rounded-lg"></div>;

    return (
        <div className="flex items-center gap-2">
            {/* PICKER DROPDOWN */}
            <div className="relative group min-w-[200px]">
                <select
                    value={selectedAsset?.id || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        selectAsset(Number(e.target.value));
                    }}
                    className="appearance-none w-full bg-slate-900/80 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer hover:bg-slate-800"
                >
                    <option value="" disabled>{t('assetPicker.selectContext', 'Select Asset Context')}</option>
                    {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                            {asset.name} ({asset.type})
                        </option>
                    ))}
                </select>

                {/* Custom Arrow Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* REGISTER BUTTON */}
            <button
                onClick={() => setIsWizardOpen(true)}
                className="
                    flex items-center justify-center w-10 h-10 rounded-lg 
                    bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 
                    hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_cyan] 
                    transition-all duration-300 group
                "
                title={t('assetWizard.title', 'Register New Asset')}
            >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>

            {/* WIZARD MODAL */}
            <AssetOnboardingWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
            />
        </div>
    );
};
