import React, { useEffect, useRef } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useCerebro } from '../contexts/ProjectContext';
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

    // Persistence Ref to prevent redundant sync loops
    const lastSyncedSpecsRef = useRef<string>("");

    useEffect(() => {
        if (!selectedAsset) return;

        const specFingerprint = JSON.stringify({
            id: selectedAsset.id,
            specs: selectedAsset.specs
        });

        // Anti-Freeze: Only sync if identity OR specs change
        if (lastSyncedSpecsRef.current === specFingerprint) return;

        console.log(`[CEREBRO Sync] Bridging Asset: ${selectedAsset.name} (${selectedAsset.turbine_type})`);

        // Map Asset types to TurbineType
        const turbineType = selectedAsset.turbine_type || 'FRANCIS';
        const mappedType = turbineType.toUpperCase() as any;

        // 1. Sync Identity
        dispatch({
            type: 'SET_ASSET',
            payload: {
                ...techState.identity,
                assetId: selectedAsset.id,
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

                dispatch({
                    type: 'UPDATE_HYDRAULIC',
                    payload: {
                        head: headValue || techState.hydraulic.head,
                        flow: flowValue || techState.hydraulic.flow,
                        waterHead: new Decimal(specs.head || techState.hydraulic.head),
                        flowRate: new Decimal(specs.flow || techState.hydraulic.flow)
                    }
                });
            }

            // Sync Mechanical
            if (specs.boltDiameter || specs.boltCount || specs.boltGrade) {
                dispatch({
                    type: 'UPDATE_MECHANICAL',
                    payload: {
                        boltSpecs: {
                            ...techState.mechanical.boltSpecs,
                            diameter: specs.boltDiameter || techState.mechanical.boltSpecs.diameter,
                            count: specs.boltCount || techState.mechanical.boltSpecs.count,
                            grade: specs.boltGrade || techState.mechanical.boltSpecs.grade
                        }
                    }
                });
            }

            // Sync Penstock
            if (specs.penstockDiameter || specs.penstockLength || specs.penstockMaterial) {
                dispatch({
                    type: 'UPDATE_PENSTOCK',
                    payload: {
                        diameter: specs.penstockDiameter || techState.penstock.diameter,
                        length: specs.penstockLength || techState.penstock.length,
                        material: specs.penstockMaterial || techState.penstock.material,
                        wallThickness: specs.penstockWallThickness || techState.penstock.wallThickness
                    }
                });
            }
        }

        lastSyncedSpecsRef.current = specFingerprint;

    }, [selectedAsset, dispatch, techState.hydraulic.head, techState.hydraulic.flow, techState.mechanical.boltSpecs, techState.penstock.diameter]);

    return null; // Pure logic component
};
