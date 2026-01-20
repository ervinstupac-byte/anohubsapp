// idAdapter: enforce numeric canonical asset IDs and provide DB/local formatting
export const idAdapter = {
  toNumber(v: any): number | null {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v === 'string') {
      const cleaned = v.trim();
      if (cleaned === '') return null;
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  },
  // Format for DB persistence; DB may accept numeric or string, but we normalize to string form.
  toDb(v: any): string {
    return String(v);
  },
  toStorage(v: any): string {
    return String(v);
  }
};

export default idAdapter;
