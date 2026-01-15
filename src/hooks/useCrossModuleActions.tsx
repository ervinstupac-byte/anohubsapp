import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wrench, BarChart3, Settings, History, Monitor } from 'lucide-react';
import { useAssetContext } from '../contexts/AssetContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import type { CardAction } from '../shared/components/ui/EngineeringCard';

/**
 * useCrossModuleActions
 * 
 * Generates a standardized set of cross-module navigation actions.
 * Includes workflow tracking for navigation history.
 * 
 * @param assetId - Optional asset ID to ensure selection persists
 * @param sensorPath - Optional sensor path for contextual filtering (e.g., 'mechanical.vibration')
 */
export const useCrossModuleActions = (
    assetId?: string,
    sensorPath?: string
): CardAction[] => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectAsset } = useAssetContext();
    const { logNavigation } = useWorkflow();

    const actions = useMemo(() => {
        // Common navigation handler with workflow logging
        const nav = (path: string, module: 'toolbox' | 'executive' | 'builder' | 'maintenance', state?: any) => {
            if (assetId) {
                selectAsset(assetId);
            }
            logNavigation({ module, assetId, sensorPath });
            navigate(path, { state });
        };

        return [
            {
                label: t('actions.troubleshoot', 'Troubleshoot'),
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    nav('/', 'toolbox', { focusSensor: sensorPath });
                },
                icon: <Wrench className="w-4 h-4" />,
            },
            {
                label: t('actions.analyzeTrend', 'Analyze Trend'),
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    nav('/executive', 'executive', { highlightSensor: sensorPath });
                },
                icon: <BarChart3 className="w-4 h-4" />,
            },
            {
                label: t('actions.updateSpecs', 'Update Specs'),
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    nav('/hpp-builder', 'builder', { editAsset: assetId });
                },
                icon: <Settings className="w-4 h-4" />,
            },
            {
                label: t('actions.viewTwin', 'Digital Twin'),
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    nav('/diagnostic-twin', 'diagnostics' as any, { assetId });
                },
                icon: <Monitor className="w-4 h-4" />,
            },
            {
                label: t('actions.viewHistory', 'View History'),
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    nav('/maintenance/logbook', 'maintenance', { assetFilter: assetId });
                },
                icon: <History className="w-4 h-4" />,
            }
        ];
    }, [navigate, selectAsset, logNavigation, assetId, sensorPath, t]);

    return actions;
};
