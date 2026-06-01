import { z } from 'zod';

// Pelton PoC telemetry schema (input boundary validation)
export const NozzleSchema = z.object({
  index: z.number().int().nonnegative(),
  needlePositionMM: z.number().optional(),
  deflectorOpen: z.boolean().optional()
});

export const GeneratorCoolingSchema = z.object({
  bearingTempC: z.number().optional(),
  coolantFlowLps: z.number().optional(),
  bearingCoolingPresent: z.boolean().optional()
});

export const PeltonTelemetrySchema = z.object({
  turbineId: z.string(),
  timestamp: z.string().optional(),
  headM: z.number().nonnegative(),
  flowM3s: z.number().nonnegative(),
  netHeadM: z.number().nonnegative().optional(),
  jets: z.number().int().nonnegative().optional(),
  nozzles: z.array(NozzleSchema).optional(),
  generatorCooling: GeneratorCoolingSchema.optional(),
  // mechanical sensors
  runOutRadialMM: z.number().optional(),
  runOutAxialMM: z.number().optional(),
  shaftBounce: z.boolean().optional(),
  housingPressureBar: z.number().optional(),
  axialDisplacementZmm: z.number().optional(),
  vibrationRmsMmS: z.number().optional(),
  // control states
  mainNeedleOpenPercent: z.number().min(0).max(100).optional(),
  brakeValveStatus: z.enum(['OPEN', 'CLOSED']).optional(),
  deflectorStatus: z.enum(['ACTIVE', 'PASSIVE']).optional(),
  deflectorResponseTimeS: z.number().optional(),
  deflectorGapMM: z.number().optional()
});

export type PeltonTelemetry = z.infer<typeof PeltonTelemetrySchema>;

export default PeltonTelemetrySchema;
