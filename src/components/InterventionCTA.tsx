import React from 'react';
import { useTranslation } from 'react-i18next';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const InterventionCTA: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const { navigateTo } = useNavigation();

    // Ova komponenta bi trebala biti minimalistički CTA
    if (!selectedAsset) return null;

    return (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
            <ModernButton
                onClick={() => navigateTo('riskAssessment')}
                variant="danger"
                className="px-8 py-4 font-black tracking-[0.2em] text-xs uppercase border-2 border-red-500 bg-red-600 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]"
                icon={<span className="text-lg">⚠</span>}
            >
                {t('interventionCTA.label')} : {selectedAsset.name.toUpperCase()}
            </ModernButton>
        </div>
    );
};