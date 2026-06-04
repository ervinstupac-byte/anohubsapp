import jsPDF from 'jspdf';

export type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
  internal?: { getNumberOfPages?: () => number };
};

export function getLastAutoTableFinalY(doc: unknown, defaultVal = 0): number {
  const d = doc as JsPDFWithAutoTable | undefined;
  if (!d) return defaultVal;
  const last = d.lastAutoTable;
  return last && typeof last.finalY === 'number' ? last.finalY : defaultVal;
}

export function getPageCount(doc: unknown): number {
  const d = doc as JsPDFWithAutoTable | undefined;
  return d?.internal?.getNumberOfPages?.() ?? 1;
}

export type AutoTableCell = { content: string; colSpan?: number; styles?: Record<string, unknown> };
export type AutoTableRow = Array<string | number | AutoTableCell>;

export default null;

export function setGStateOpacity(doc: unknown, opacity: number) {
  try {
    const d = doc as any;
    const GStateCtor = d?.GState || d?.gState || undefined;
    if (typeof GStateCtor === 'function') {
      d.setGState(new GStateCtor({ opacity }));
      return;
    }
    // Fallback: try calling with any available constructor
    if (d && typeof d.setGState === 'function') {
      d.setGState(new (d as any).GState ? new (d as any).GState({ opacity }) : { opacity });
    }
  } catch (e) {
    // best-effort; non-fatal
  }
}
