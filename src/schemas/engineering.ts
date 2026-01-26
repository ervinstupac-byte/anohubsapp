import { z } from 'zod';

export const EngineeringSchema = z.object({
    foundation: z.number().max(0.05, { message: "STANDARD_EXCELLENCE_VIOLATION: Foundation deviation > 0.05 mm/m" }),
    shaft: z.number().max(0.02, { message: "STANDARD_EXCELLENCE_VIOLATION: Shaft run-out > 0.02 mm" }),
    bearing_clearance: z.number().optional(),
    wicket_synchronization: z.number().max(1, { message: "STANDARD_EXCELLENCE_VIOLATION: Wicket sync deviation > 1%" }),
    commissioning_vibration: z.number().max(2.5, { message: "STANDARD_EXCELLENCE_VIOLATION: Vibration > 2.5 mm/s" }),

    // Master Linkage Tags
    system_origin: z.enum(['Generator', 'Hydraulic Unit', 'Lubrication System']).optional(),
    location_tag: z.enum(['Upper Bearing', 'Thrust Bearing', 'Turbine Cover']).optional(),
    fluid_type: z.string().optional(), // Linked to Inventory (e.g., VG46, VG68)

    // Cooling System Logic
    cooling_delta_t: z.number().max(15, { message: "PREDICTIVE_ALARM: Delta T excessive - possible scaling." }).optional(),
});

export const HPPSettingsSchema = z.object({
    head: z.number().min(1, "Head must be > 0").max(2000, "Head exceeds physical limits"),
    flow: z.number().min(0.01, "Flow must be > 0").max(1000, "Flow exceeds capacity limits"),
    efficiency: z.number().min(10, "Efficiency too low").max(100, "Efficiency > 100%"),
    powerFactor: z.number().optional().default(0.8),
    waterQuality: z.enum(['clean', 'suspended', 'abrasive']).optional(),
    flowVariation: z.enum(['stable', 'seasonal', 'variable']).optional(),
    vibrationX: z.number().optional().default(0),
    vibrationY: z.number().optional().default(0),
});

export type EngineeringData = z.infer<typeof EngineeringSchema>;
export type HPPSettingsData = z.infer<typeof HPPSettingsSchema>;
