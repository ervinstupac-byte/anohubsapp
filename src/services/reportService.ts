import { getSafeClient } from './supabaseClient';
import idAdapter from '../utils/idAdapter';

export type SaveReportParams = {
  assetId?: any;
  reportType: string;
  reportPeriodStart?: string | Date;
  reportPeriodEnd?: string | Date;
  computedLossCost?: number;
  computedLossCostCurrency?: string;
  pdfPath?: string;
  metadata?: Record<string, any>;
  generatedBy?: string; // user UUID
};

export async function saveReport(params: SaveReportParams) {
  const client: any = getSafeClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client not available') };
  }

  const {
    assetId,
    reportType,
    reportPeriodStart,
    reportPeriodEnd,
    computedLossCost,
    computedLossCostCurrency = 'EUR',
    pdfPath,
    metadata = {},
    generatedBy
  } = params;

  const asset_id = assetId != null ? idAdapter.toDb(assetId) : undefined;

  try {
    const payload: any = {
      asset_id,
      report_type: reportType,
      report_period_start: reportPeriodStart || undefined,
      report_period_end: reportPeriodEnd || undefined,
      computed_loss_cost: computedLossCost ?? undefined,
      computed_loss_cost_currency: computedLossCostCurrency,
      pdf_path: pdfPath || undefined,
      metadata: metadata || {},
      generated_by: generatedBy || undefined
    };

    // Include diagnostic sigma and expected maintenance cost if provided in metadata
    if ((metadata as any)?.sigma !== undefined) payload.sigma_variance = (metadata as any).sigma;
    if ((metadata as any)?.expectedMaintenanceCost !== undefined) payload.expected_maintenance_cost = (metadata as any).expectedMaintenanceCost;

    // Some environments (build/noop client) do not support chained .insert().select().single().
    // Use a robust await of insert result instead.
    const queryTarget: any = client.from('reports');
    let insertResult: any;
    try {
      // If insert is a function returning a promise/result, await it.
      const maybe = queryTarget.insert(payload);
      insertResult = await maybe;
    } catch (innerErr) {
      // Last-resort: try calling as async function
      try {
        insertResult = await queryTarget.insert(payload);
      } catch (e: unknown) {
        const emsg = e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e);
        console.warn('[reportService] insert fallback failed:', emsg);
        insertResult = { data: null, error: e };
      }
    }

    return insertResult;
  } catch (err: unknown) {
    const emsg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
    console.error('[reportService] saveReport failed:', emsg);
    return { data: null, error: err };
  }
}

export default { saveReport };
