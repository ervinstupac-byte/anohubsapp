/**
 * DATA INGESTION SERVICE (Formerly Project Swallower)
 * The Automatic Assimilator 🏗️😋
 * Ingests raw, unstructured site data and maps it to our Fortress Hierarchy.
 */

import { AssetNode, AssetNodeType } from '../models/AssetHierarchy';

export class DataIngestionService {

    /**
     * SWALLOW PROJECT
     * Takes a raw JSON object (e.g. from a CSV import or API) and builds an AssetTree.
     */
    swallowProject(rawSiteData: any): AssetNode {
        const root: AssetNode = {
            id: 'IMPORTED_ROOT',
            name: rawSiteData.siteName || 'Unknown Site',
            type: AssetNodeType.SITE,
            path: 'IMPORTED_ROOT',
            telemetryEnabled: false,
            children: [],
            metadata: { criticality: 'HIGH' }
        };

        // 1. Scan for Standard Organs
        if (rawSiteData.units) {
            rawSiteData.units.forEach((u: any, index: number) => {
                const unitNode: AssetNode = {
                    id: `UNIT_${index + 1}`,
                    name: u.name || `Unit ${index + 1}`,
                    type: AssetNodeType.UNIT,
                    path: `IMPORTED_ROOT/UNIT_${index + 1}`,
                    telemetryEnabled: false,
                    children: [],
                    metadata: { criticality: 'HIGH' }
                };

                // Auto-Assimilation Logic
                this.assimilateComponents(u, unitNode);
                root.children.push(unitNode);
            });
        }

        return root;
    }

    private assimilateComponents(sourceObj: any, parentNode: AssetNode) {
        // Dictionary of "Known Aliases"
        // We map their words to our Fortress Language.
        const dictionary: Record<string, string> = {
            'runner': 'TURBINE',
            'wheel': 'TURBINE',
            'alternator': 'GENERATOR',
            'dynamo': 'GENERATOR',
            'lube_skid': 'HYDRAULIC',
            'hpu': 'HYDRAULIC'
        };

        Object.keys(sourceObj).forEach(key => {
            const value = sourceObj[key];
            if (typeof value === 'object' && value !== null) {
                // It's a component!
                const lowerKey = key.toLowerCase();
                let type: any = 'SYSTEM'; // Default to generic

                // Check Dictionary
                if (dictionary[lowerKey]) {
                    type = dictionary[lowerKey];
                } else if (value.type) {
                    // Maybe they have a type field?
                    type = value.type;
                }

                // If completely unknown, flag as Custom Gene
                const isCustom = !dictionary[lowerKey] && type === 'SYSTEM';

                const node: AssetNode = {
                    id: `${parentNode.id}_${key.toUpperCase()}`,
                    name: value.name || key,
                    type: type as any,
                    path: `${parentNode.path}/${key.toUpperCase()}`,
                    telemetryEnabled: false,
                    children: [],
                    metadata: {
                        criticality: 'MEDIUM',
                        // If it's a stranger, tag it!
                        notes: isCustom ? '🧬 CUSTOM GENE: Auto-assimilated unknown component.' : undefined
                    } as any
                };

                // Recursion (Digest deeper)
                this.assimilateComponents(value, node);
                parentNode.children.push(node);
            }
        });
    }
}
