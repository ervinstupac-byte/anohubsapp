import React from 'react';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx'; 
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const InterventionCTA: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { navigateTo } = useNavigation();

    // Ova komponenta bi trebala biti minimalistički CTA
    if (!selectedAsset) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
            <ModernButton
                onClick={() => navigateTo('riskAssessment')} // Pretpostavljamo da vodi na Risk Assessment
                variant="danger"
                className="px-6 py-3 font-bold tracking-widest text-sm shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                icon={<span>🚨</span>}
            >
                ASSET INTERVENTION REQUIRED ({selectedAsset.name})
            </ModernButton>
        </div>
    );
};