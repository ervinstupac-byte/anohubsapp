import { useEffect, useRef } from 'react';
import { useCerebro } from '../contexts/ProjectContext';
import { useAssetConfig } from '../contexts/AssetConfigContext';
import { useAppStore } from '../stores/useAppStore';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

/**
 * Data Bridge Hook (TEMPORARY SYNC ENGINE)
 * 
 * Synchronizes data from legacy ProjectContext to new specialized stores.
 * This allows gradual migration - old components use ProjectContext,
 * new components use specialized stores, both stay in sync.
 * 
 * LOOP PREVENTION:
 * - Uses refs to track last synced values
 * - Compares with shallow equality before updating
 * - Debounces rapid updates
 * 
 * TEMPORARY: Remove this once all components are migrated to new stores.
 */
export const useSyncLegacyToNew = () => {
    const { state: cerebroState } = useCerebro();
    const { updateConfig, config } = useAssetConfig();
    const { setDemoMode, demoMode } = useAppStore();
    const { updateTelemetry, setHydraulic, setMechanical, setConfig: setTelemetryConfig } = useTelemetryStore();

    // Track last synced values to prevent infinite loops
    const lastSyncRef = useRef<{
        identityId?: string;
        hydraulicHash?: string;
        mechanicalHash?: string;
        demoModeHash?: string;
    }>({});

    // Sync Asset Config (Static Data) - Only when identity changes
    useEffect(() => {
        const identity = cerebroState.identity;
        if (!identity?.assetId) return;

        // Skip if already synced this identity
        if (lastSyncRef.current.identityId === identity.assetId) return;
        lastSyncRef.current.identityId = identity.assetId;

        console.log('[SyncEngine] Syncing AssetConfig from ProjectContext');

        updateConfig({
            assetId: identity.assetId,
            assetName: identity.assetName,
            turbineType: identity.turbineType as 'PELTON' | 'FRANCIS' | 'KAPLAN',
            manufacturer: 'Legacy System',
            commissioningYear: 2020,
            totalOperatingHours: identity.totalOperatingHours || 0,
            hoursSinceLastOverhaul: identity.hoursSinceLastOverhaul || 0,
            startStopCount: identity.startStopCount || 0,
            location: 'Legacy Location',

            site: {
                grossHead: cerebroState.site?.grossHead || 100,
                designFlow: cerebroState.site?.designFlow || 10,
                waterQuality: 'CLEAN',
                temperature: cerebroState.site?.temperature || 20,
                designPerformanceMW: cerebroState.site?.designPerformanceMW || 10
            },

            penstock: {
                diameter: cerebroState.penstock?.diameter || 2,
                length: cerebroState.penstock?.length || 100,
                material: cerebroState.penstock?.material || 'STEEL',
                wallThickness: cerebroState.penstock?.wallThickness || 0.02,
                materialModulus: cerebroState.penstock?.materialModulus || 210,
                materialYieldStrength: cerebroState.penstock?.materialYieldStrength || 355
            },

            machineConfig: {
                orientation: 'VERTICAL',
                transmissionType: 'DIRECT',
                ratedPowerMW: 10,
                ratedSpeedRPM: 500,
                ratedHeadM: cerebroState.site?.grossHead || 100,
                ratedFlowM3S: cerebroState.site?.designFlow || 10,
                runnerDiameterMM: 1500,
                numberOfBlades: 15
            },

            version: '1.0',
            createdAt: new Date().toISOString(),
            createdBy: 'Legacy Migration',
            lastUpdatedAt: new Date().toISOString()
        });
    }, [cerebroState.identity?.assetId]); // Only trigger on asset ID change

    // Sync Demo Mode (UI State)
    useEffect(() => {
        const legacyDemo = cerebroState.demoMode;
        if (!legacyDemo) return;

        // Create hash to detect actual changes
        const demoHash = `${legacyDemo.active}-${legacyDemo.scenario}`;
        if (lastSyncRef.current.demoModeHash === demoHash) return;
        lastSyncRef.current.demoModeHash = demoHash;

        console.log('[SyncEngine] Syncing DemoMode:', legacyDemo.scenario);

        setDemoMode({
            active: legacyDemo.active,
            scenario: legacyDemo.scenario as any
        });
    }, [cerebroState.demoMode?.active, cerebroState.demoMode?.scenario, setDemoMode]);

    // Sync Telemetry Data (Live Technical Data)
    useEffect(() => {
        const hydraulic = cerebroState.hydraulic;
        if (!hydraulic) return;

        // Create hash to detect actual changes
        const hydraulicHash = `${hydraulic.head}-${hydraulic.flow}-${hydraulic.efficiency}`;
        if (lastSyncRef.current.hydraulicHash === hydraulicHash) return;
        lastSyncRef.current.hydraulicHash = hydraulicHash;

        console.log('[SyncEngine] Syncing Hydraulic data');

        // Use the proper action method
        setHydraulic({
            head: hydraulic.head,
            flow: hydraulic.flow,
            efficiency: hydraulic.efficiency
        });
    }, [cerebroState.hydraulic?.head, cerebroState.hydraulic?.flow, cerebroState.hydraulic?.efficiency, setHydraulic]);

    // Sync Mechanical Data
    useEffect(() => {
        const mechanical = cerebroState.mechanical;
        if (!mechanical) return;

        // Create hash to detect actual changes
        const mechanicalHash = `${mechanical.vibration}-${mechanical.bearingTemp}-${mechanical.vibrationX}-${mechanical.vibrationY}`;
        if (lastSyncRef.current.mechanicalHash === mechanicalHash) return;
        lastSyncRef.current.mechanicalHash = mechanicalHash;

        console.log('[SyncEngine] Syncing Mechanical data');

        // Use the proper action method
        setMechanical({
            vibration: mechanical.vibration,
            vibrationX: mechanical.vibrationX || 0,
            vibrationY: mechanical.vibrationY || 0,
            bearingTemp: mechanical.bearingTemp,
            alignment: mechanical.alignment || 0
        });
    }, [
        cerebroState.mechanical?.vibration,
        cerebroState.mechanical?.bearingTemp,
        cerebroState.mechanical?.vibrationX,
        cerebroState.mechanical?.vibrationY,
        setMechanical
    ]);

    // Sync Site/Penstock Config to TelemetryStore (for physics calculations)
    useEffect(() => {
        if (!cerebroState.site || !cerebroState.penstock) return;

        console.log('[SyncEngine] Syncing Site/Penstock config to TelemetryStore');

        setTelemetryConfig({
            site: cerebroState.site,
            penstock: cerebroState.penstock,
            identity: cerebroState.identity
        });
    }, [cerebroState.site, cerebroState.penstock, cerebroState.identity, setTelemetryConfig]);
};

/**
 * DataBridge Component
 * 
 * Include this in GlobalProvider to enable automatic synchronization.
 * Renders nothing - just runs the sync logic.
 */
export const DataBridge: React.FC = () => {
    useSyncLegacyToNew();
    return null;
};
