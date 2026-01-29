import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import ExperienceLedgerService from '../../services/ExperienceLedgerService';

type Props = {
  initialQuery?: string;
  assetId?: string | null;
};

export default function QuickDiagnosticSearch({ initialQuery, assetId }: Props) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    timer.current = window.setTimeout(async () => {
      const q = query.replace(/\s+/g, '%');
      let builder = supabase
        .from('expert_knowledge_base')
        .select('symptom_key, diagnosis, recommended_action, severity')
        .ilike('symptom_key', `%${q}%`)
        .limit(25);

      if (assetId) builder = builder.eq('asset_id', assetId as any);

      const { data, error } = await builder;
      if (error) {
        console.error('QuickDiagnosticSearch fetch error', error);
        setResults([]);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    }, 300);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [query, assetId]);

  const handleRecord = async (item: any) => {
    try {
      await ExperienceLedgerService.record({
        symptom_observed: item.symptom_key,
        actual_cause: item.diagnosis || null,
        resolution_steps: item.recommended_action || null,
        asset_id: assetId || null,
      });
    } catch (e) {
      console.error('Failed to record diagnostic selection', e);
    }
  };

  return (
    <div className="quick-diagnostic-search">
      <input
        aria-label="Search diagnostics"
        placeholder="Search symptoms or keys..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded p-2 w-full"
      />

      {loading && <div className="text-sm text-gray-500 mt-2">Searching...</div>}

      {!loading && results.length > 0 && (
        <ul className="mt-2 space-y-2">
          {results.map((r: any) => (
            <li key={r.symptom_key} className="p-3 border rounded hover:bg-gray-50">
              <div className="font-medium">{r.symptom_key}</div>
              {r.diagnosis && <div className="text-sm text-gray-700">{r.diagnosis}</div>}
              {r.recommended_action && <div className="text-sm text-gray-600 mt-1">{r.recommended_action}</div>}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleRecord(r)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Record
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
