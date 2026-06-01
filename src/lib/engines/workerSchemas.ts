import { z } from 'zod';

// Supported worker action types
export const WorkerAction = z.enum(['CALCULATE_EFFICIENCY', 'CALCULATE_CAVITATION', 'CALCULATE_WATER_HAMMER']);

// Payloads per action
export const EfficiencyPayload = z.object({ head: z.number().nonnegative(), flow: z.number().nonnegative(), bucketHours: z.number().nonnegative().optional() });
export const CavitationPayload = z.object({ npsh: z.number().nonnegative(), head: z.number().nonnegative() });
export const WaterHammerPayload = z.object({ waveSpeed: z.number().nonnegative(), deltaV: z.number().nonnegative() });

export const WorkerRequestSchema = z.object({
  id: z.string(),
  type: WorkerAction,
  payload: z.union([EfficiencyPayload, CavitationPayload, WaterHammerPayload])
});

export const WorkerResponseSchema = z.object({
  id: z.string(),
  type: WorkerAction,
  result: z.any().optional(),
  error: z.string().optional(),
  durationMs: z.number().optional()
});

export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;
export type WorkerResponse = z.infer<typeof WorkerResponseSchema>;

export default { WorkerAction, WorkerRequestSchema, WorkerResponseSchema };
