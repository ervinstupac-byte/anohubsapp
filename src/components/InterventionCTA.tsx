import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../contexts/AssetContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore'; // Data Bridge
import { ModernButton } from '../shared/components/ui/ModernButton';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const InterventionCTA: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext(); // Keep for Name
    const { navigateTo } = useNavigation();

    // Data Bridge: Live Diagnosis Trigger
    // Data Bridge: Live Diagnosis Trigger
    const { diagnosis } = useTelemetryStore();
    // FIX: Diagnosis schema matches TechnicalSchema (severity at top level)
    const severity = diagnosis?.severity || 'NOMINAL';
    const isCritical = severity === 'CRITICAL' || severity === 'WARNING'; // Show on WARNING too for safety awareness? Or just CRITICAL? Keeps it strict to 'CRITICAL' usually.
    // Let's stick to the user's intent: "CRITICAL or EMERGENCY". Our schema has NOMINAL | WARNING | CRITICAL.
    const showSeverity = severity === 'CRITICAL';

    // Extract primary issue from messages if available
    const activeRisk = diagnosis?.messages?.[0]?.en || '';

    // Smart Trigger: Only show if Critical OR legacy asset status is Critical
    // This allows both the Live Engine and the Legacy Config to trigger the CTA
    const showCTA = (selectedAsset && selectedAsset.status === 'Critical') || showSeverity;

    if (!showCTA || !selectedAsset) return null;

    return (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
            <ModernButton
                onClick={() => navigateTo('riskAssessment')}
                variant="danger"
                className="px-8 py-4 font-black tracking-[0.2em] text-xs uppercase border-2 border-red-500 bg-red-600 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]"
                icon={<span className="text-lg animate-pulse">⚠</span>}
            >
                {t('interventionCTA.label', 'URGENT INTERVENTION')} : {activeRisk ? activeRisk.toUpperCase() : selectedAsset.name.toUpperCase()}
            </ModernButton>
        </div>
    );
};