import React, { useEffect } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useCerebro } from '../contexts/ProjectContext';
import Decimal from 'decimal.js';

/**
 * DataSyncBridge (CEREBRO v4.5)
 * 
 * Synchronizes the selected asset from AssetContext with the ProjectContext (Cerebro).
 * ensures engineering utilities are always reactive to the real machine specs.
 */
export const DataSyncBridge: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { dispatch, state: techState } = useCerebro();

    useEffect(() => {
        if (!selectedAsset) return;

        // Prevent redundant dispatches if identity already matches
        if (techState?.identity?.id === selectedAsset.id) return;

        console.log(`[CEREBRO Sync] Bridging Asset: ${selectedAsset.name} (${selectedAsset.turbine_type})`);

        // Map Asset types to TurbineType
        const turbineType = selectedAsset.turbine_type || 'Francis';
        const mappedType = (turbineType.charAt(0).toUpperCase() + turbineType.slice(1)) as any;

        // Prepare the payload for ProjectContext
        dispatch({
            type: 'SET_ASSET',
            payload: {
                id: selectedAsset.id,
                name: selectedAsset.name,
                location: selectedAsset.location,
                type: mappedType || 'Francis'
            }
        });

        // If specific engineering specs exist, sync them too
        if (selectedAsset.specs) {
            const specs = selectedAsset.specs;

            // Sync Hydraulic Stream
            if (specs.head || specs.flow) {
                const headValue = parseFloat(specs.head);
                const flowValue = parseFloat(specs.flow);

                if (headValue !== techState.hydraulic.head || flowValue !== techState.hydraulic.flow) {
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
            }

            // Sync Mechanical (Bolt Specs, etc)
            if (specs.boltDiameter || specs.boltCount || specs.boltGrade) {
                if (specs.boltDiameter !== techState.mechanical.boltSpecs.diameter ||
                    specs.boltCount !== techState.mechanical.boltSpecs.count ||
                    specs.boltGrade !== techState.mechanical.boltSpecs.grade) {
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
            }

            // Sync Penstock
            if (specs.penstockDiameter || specs.penstockLength || specs.penstockMaterial) {
                if (specs.penstockDiameter !== techState.penstock.diameter ||
                    specs.penstockLength !== techState.penstock.length ||
                    specs.penstockMaterial !== techState.penstock.material) {
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
        }

    }, [selectedAsset, dispatch, techState.identity.id]);

    return null; // Pure logic component
};
