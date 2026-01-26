/**
 * GIANT TAG MAPPER
 * The Identity Thief 🆔🕵️‍♂️
 * Steals the Giant's confusing tags and gives them proper AnoHUB Passport names.
 */

export class GiantTagMapper {
    // Dictionary: Giant Tag -> AnoHUB Passport ID
    private tagDictionary: Record<string, string> = {
        // Siemens Standard?
        'TE_101_B1': 'Upper_Guide_Bearing_Temp',
        'PIT_202_X': 'Spiral_Case_Pressure',
        'Z_303__Q': 'Guide_Vane_Position_Percent',
        // ABB Standard?
        'U1_BRG_TEMP_01': 'Upper_Guide_Bearing_Temp',
        'U1_HYD_PRESS_MAIN': 'Spiral_Case_Pressure'
    };

    /**
     * PAINT THE TAG
     * Translates a raw tag into a Passport ID.
     */
    assimilateTag(giantTag: string): string {
        const passportId = this.tagDictionary[giantTag];
        if (passportId) {
            return passportId;
        } else {
            // Keep original if unknown, but prefix it so we know it's raw
            return `RAW_GIANT_${giantTag}`;
        }
    }

    /**
     * LEARN NEW MAPPING
     * Allows the user to manually teach the Mapper.
     */
    teachMap(giantTag: string, passportId: string) {
        this.tagDictionary[giantTag] = passportId;
    }
}
