import React from 'react';
import { AlignmentWizard } from './AlignmentWizard';
import { useAssetContext } from '../../contexts/AssetContext';
import { mapAssetToEnhancedAsset } from '../../utils/assetMapper';
import { GlassCard } from '../../shared/components/ui/GlassCard';

export const AlignmentWizardWrapper: React.FC = () => {
    const { selectedAsset } = useAssetContext();

    if (!selectedAsset) {
        return (
            <GlassCard className="max-w-4xl mx-auto text-center py-12">
                <p className="text-slate-400">Please select an asset to perform alignment.</p>
            </GlassCard>
        );
    }

    const enhancedAsset = mapAssetToEnhancedAsset(selectedAsset);

    return (
        <AlignmentWizard 
            asset={enhancedAsset} 
            onComplete={() => console.log('Alignment completed from router')} 
        />
    );
};
