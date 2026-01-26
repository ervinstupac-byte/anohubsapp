import { useEffect, useState } from 'react';

export interface IntelligenceReport {
  generatedAt: string;
  totalFiles: number;
  baselineAverageScore: number;
  globalHealthIndex: number;
  alerts: Array<any>;
  grouped: Record<string, any[]>;
  all: Array<any>;
}

export function useIntelligenceReport(pollIntervalMs = 0) {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: any = null;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/scripts/reports/nc102_intelligence.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setReport(json as IntelligenceReport);
      } catch (e: any) {
        if (mounted) setError(String(e.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    if (pollIntervalMs && pollIntervalMs > 0) timer = setInterval(load, pollIntervalMs);
    return () => { mounted = false; if (timer) clearInterval(timer); };
  }, [pollIntervalMs]);

  return { report, loading, error };
}
