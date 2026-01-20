import React, { useEffect, useRef } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { idAdapter } from '../utils/idAdapter';
import { useCerebro } from '../contexts/ProjectContext';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import Decimal from 'decimal.js';

/**
 * DataSyncBridge (CEREBRO v4.5 Hardened)
 * 
 * Synchronizes the selected asset from AssetContext with the ProjectContext (Cerebro).
 * ensures engineering utilities are always reactive to the real machine specs.
 */
export const DataSyncBridge: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { dispatch, state: techState } = useCerebro();
    const { updateTelemetry } = useTelemetryStore();

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
        dispatch({
            type: 'SET_ASSET',
            payload: {
                ...techState.identity,
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

                // Legacy Context Sync
                dispatch({
                    type: 'UPDATE_HYDRAULIC',
                    payload: {
                        head: headValue || techState.hydraulic.head,
                        flow: flowValue || techState.hydraulic.flow,
                        waterHead: new Decimal(specs.head || techState.hydraulic.head),
                        flowRate: new Decimal(specs.flow || techState.hydraulic.flow)
                    }
                });

                // New Telemetry Store Sync
                // New Telemetry Store Sync
                updateTelemetry({
                    hydraulic: {
                        head: headValue,
                        flow: flowValue,
                        // netHead removed - not in schema
                    }
                });
            }

            // Sync Mechanical
            if (specs.boltDiameter || specs.boltCount || specs.boltGrade) {
                // Ensure defaults to match strict requirements if values are missing
                const safeCount = specs.boltCount ? parseInt(specs.boltCount.toString()) : techState.mechanical.boltSpecs.count;
                const safeGrade = specs.boltGrade || techState.mechanical.boltSpecs.grade;
                const safeDiameter = specs.boltDiameter ? parseInt(specs.boltDiameter.toString()) : techState.mechanical.boltSpecs.diameter;

                const boltSpecsPayload = {
                    diameter: safeDiameter,
                    count: safeCount,
                    grade: safeGrade,
                    torque: techState.mechanical.boltSpecs.torque // Preserve existing
                };

                dispatch({
                    type: 'UPDATE_MECHANICAL',
                    payload: {
                        boltSpecs: boltSpecsPayload
                    }
                });

                // New Telemetry Store Sync
                updateTelemetry({
                    mechanical: {
                        boltSpecs: boltSpecsPayload
                    }
                });
            }

            // Sync Penstock
            if (specs.penstockDiameter || specs.penstockLength || specs.penstockMaterial) {
                const penstockUpdate = {
                    diameter: specs.penstockDiameter || techState.penstock.diameter,
                    length: specs.penstockLength || techState.penstock.length,
                    material: specs.penstockMaterial || techState.penstock.material,
                    wallThickness: specs.penstockWallThickness || techState.penstock.wallThickness
                };

                dispatch({
                    type: 'UPDATE_PENSTOCK',
                    payload: penstockUpdate
                });

                // New Telemetry Store Sync
                updateTelemetry({
                    penstock: penstockUpdate as any
                });
            }
        }

        lastSyncedSpecsRef.current = specFingerprint;

    }, [selectedAsset, dispatch, techState.hydraulic.head, techState.hydraulic.flow, techState.mechanical.boltSpecs, techState.penstock.diameter]);

    return null; // Pure logic component
};
