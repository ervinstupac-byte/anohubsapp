import React, { useEffect, useRef } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { idAdapter } from '../utils/idAdapter';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import Decimal from 'decimal.js';

/**
 * DataSyncBridge (CEREBRO v4.5 Hardened)
 * 
 * Synchronizes the selected asset from AssetContext with the Telemetry Store.
 * ensures engineering utilities are always reactive to the real machine specs.
 */
export const DataSyncBridge: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { 
        updateTelemetry, 
        hydraulic, 
        mechanical, 
        penstock,
        identity 
    } = useTelemetryStore();

    // Persistence Ref to prevent redundant sync loops
    const lastSyncedSpecsRef = useRef<string>("");

    useEffect(() => {
        if (!selectedAsset) return;

        const specFingerprint = `${idAdapter.toStorage(selectedAsset.id)}-${JSON.stringify(selectedAsset.specs || {})}`;
        if (lastSyncedSpecsRef.current === specFingerprint) {
            console.log('[DataSyncBridge] Specs already synced, skipping.');
            return;
        }

        console.log('[DataSyncBridge] Syncing asset specs for:', selectedAsset.name);

        console.log(`[CEREBRO Sync] Bridging Asset: ${selectedAsset.name} (${selectedAsset.turbine_type})`);

        // Map Asset types to TurbineType
        const turbineType = selectedAsset.turbine_type || 'FRANCIS';
        const mappedType = turbineType.toUpperCase() as any;

        // 1. Sync Identity
        const numericAssetId = idAdapter.toNumber(selectedAsset.id);
        updateTelemetry({
            identity: {
                ...identity,
                assetId: numericAssetId !== null ? numericAssetId : selectedAsset.id,
                assetName: selectedAsset.name,
                turbineType: mappedType || 'FRANCIS'
            }
        });

        // 2. Sync Engineering Specifications
        if (selectedAsset.specs) {
            const specs = selectedAsset.specs;

            // Sync Hydraulic Stream
            if (specs.head || specs.flow) {
                const headValue = parseFloat(specs.head);
                const flowValue = parseFloat(specs.flow);

                updateTelemetry({
                    hydraulic: {
                        head: headValue,
                        flow: flowValue,
                    }
                });
            }

            // Sync Mechanical
            if (specs.boltDiameter || specs.boltCount || specs.boltGrade) {
                // Ensure defaults to match strict requirements if values are missing
                const safeCount = specs.boltCount ? parseInt(specs.boltCount.toString()) : (mechanical.boltSpecs?.count || 12);
                const safeGrade = specs.boltGrade || (mechanical.boltSpecs?.grade || '8.8');
                const safeDiameter = specs.boltDiameter ? parseInt(specs.boltDiameter.toString()) : (mechanical.boltSpecs?.diameter || 24);

                const boltSpecsPayload = {
                    diameter: safeDiameter,
                    count: safeCount,
                    grade: safeGrade,
                    torque: mechanical.boltSpecs?.torque || 0
                };

                updateTelemetry({
                    mechanical: {
                        boltSpecs: boltSpecsPayload
                    }
                });
            }

            // Sync Penstock
            if (specs.penstockDiameter || specs.penstockLength || specs.penstockMaterial) {
                const penstockUpdate = {
                    diameter: specs.penstockDiameter || penstock.diameter,
                    length: specs.penstockLength || penstock.length,
                    material: specs.penstockMaterial || penstock.material,
                    wallThickness: specs.penstockWallThickness || penstock.wallThickness
                };

                updateTelemetry({
                    penstock: penstockUpdate as any
                });
            }
        }

        lastSyncedSpecsRef.current = specFingerprint;

    }, [selectedAsset, hydraulic.head, hydraulic.flow, mechanical.boltSpecs, penstock.diameter]);

    return null; // Pure logic component
};
