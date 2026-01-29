import { z } from 'zod';

// Asset schema
export const AssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  location: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  power_output: z.number().optional(),
  status: z.string().optional(),
  turbine_type: z.string().optional(),
  specs: z.record(z.any()).optional(),
  created_at: z.string().optional()
});
export type Asset = z.infer<typeof AssetSchema>;

// Work order
export const WorkOrderSchema = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid().nullable().optional(),
  title: z.string(),
  issue_type: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SEALED']).optional(),
  created_at: z.string().optional()
});
export type WorkOrder = z.infer<typeof WorkOrderSchema>;

export const WorkOrderStepSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  step_number: z.number(),
  description: z.string(),
  target_value: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  required_tools: z.array(z.string()).optional(),
  required_consumables: z.array(z.any()).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  actual_value: z.number().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string().optional()
});
export type WorkOrderStep = z.infer<typeof WorkOrderStepSchema>;

// HPP status / realtime payload schema
export const HppStatusSchema = z
  .object({
    id: z.string().uuid().optional(),
    asset_id: z.string(),
    status: z.string().optional(),
    // allow flattened telemetry fields commonly upserted into hpp_status
    vibration: z.number().optional(),
    temperature: z.number().optional(),
    efficiency: z.number().optional(),
    output: z.number().optional(),
    piezometric_pressure: z.number().optional(),
    seepage_rate: z.number().optional(),
    reservoir_level: z.number().optional(),
    foundation_displacement: z.number().optional(),
    wicket_gate_position: z.number().optional(),
    tailwater_level: z.number().optional(),
    // arbitrary payload allowed
    payload: z.any().optional()
  })
  .catchall(z.any());
export type HppStatus = z.infer<typeof HppStatusSchema>;

// Experience ledger entry schema
export const ExperienceLedgerSchema = z.object({
  id: z.string().uuid().optional(),
  symptom_observed: z.string(),
  actual_cause: z.string(),
  resolution_steps: z.string(),
  created_at: z.string().optional(),
  asset_id: z.string().uuid().nullable().optional(),
  work_order_id: z.string().uuid().nullable().optional()
});
export type ExperienceLedger = z.infer<typeof ExperienceLedgerSchema>;

export default {
  AssetSchema,
  WorkOrderSchema,
  WorkOrderStepSchema,
  HppStatusSchema,
  ExperienceLedgerSchema
};
