import { z } from 'zod';

export const DiagnosticSeverity = z.enum(['INFO', 'WARNING', 'CRITICAL']);

export const DiagnosticSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  severity: DiagnosticSeverity,
  params: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  confidence: z.number().min(0).max(100).optional(),
  riskScore: z.number().min(0).max(1).optional(),
  timestamp: z.string().optional(),
});

export type Diagnostic = z.infer<typeof DiagnosticSchema>;

export function makeDiagnostic(
  data: Omit<Partial<Diagnostic>, 'id'> & {
    code: string;
    severity: z.infer<typeof DiagnosticSeverity>;
  }
): Diagnostic {
  return {
    id: undefined,
    code: data.code,
    severity: data.severity,
    params: data.params || {},
    confidence: data.confidence,
    riskScore: data.riskScore,
    timestamp: data.timestamp,
  } as Diagnostic;
}

export default DiagnosticSchema;
