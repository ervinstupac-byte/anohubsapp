/**
 * HIVE MIND AWARENESS
 * The Energy Trader 🔄🛡️
 * Balances load across the Hive to heal tired assets.
 */

export interface HiveStatus {
    hydroIntegrity: number; // 0-100
    windCapacityAvailable: number; // MW
    solarCapacityAvailable: number; // MW
    currentHydroLoadMw: number;
}

export interface HiveAction {
    actionType: 'SHIFT_LOAD';
    source: string;
    destination: string;
    amountMw: number;
    reason: string;
}

export class HiveMindAwareness {

    /**
     * BALANCE HIVE
     * Protects the weak by using the strong.
     */
    balanceHive(status: HiveStatus): HiveAction | null {
        // Threshold: If Hydro is tired (<90%) and Green Energy is available
        if (status.hydroIntegrity < 90 && (status.windCapacityAvailable + status.solarCapacityAvailable) > 20) {
            return {
                actionType: 'SHIFT_LOAD',
                source: 'HYDRO_UNIT_2',
                destination: 'WIND_FARM_ALPHA',
                amountMw: 20,
                reason: `Hydro Integrity Critical (${status.hydroIntegrity}%). Offloading 20MW to Wind to reduce crystal stress.`
            };
        }
        return null; // Balanced
    }
}
