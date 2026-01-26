/**
 * GREEN ENERGY EXPANDER
 * The Sovereign Expansion 🌬️☀️
 * Assimilates Wind and Solar assets into the Fortress Grid.
 */

export interface RenewableAsset {
    id: string;
    type: 'WIND' | 'SOLAR';
    capacityMw: number;
    status: 'ASSIMILATED' | 'PENDING';
}

export class GreenEnergyExpander {
    private assets: RenewableAsset[] = [];

    /**
     * ASSIMILATE ASSET
     * Takes control of a new source.
     */
    assimilateAsset(id: string, type: 'WIND' | 'SOLAR', capacityMw: number): RenewableAsset {
        const newAsset: RenewableAsset = {
            id,
            type,
            capacityMw,
            status: 'ASSIMILATED'
        };
        this.assets.push(newAsset);
        return newAsset;
    }

    getTotalCapacity(): number {
        return this.assets.reduce((sum, a) => sum + a.capacityMw, 0);
    }
}
