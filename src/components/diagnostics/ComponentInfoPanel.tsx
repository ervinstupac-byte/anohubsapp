import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import componentEncyclopediaMapping from '../../data/componentEncyclopediaMapping';

type Entry = {
  id: string;
  component_name: string;
  description?: string;
  physics_principle?: string;
  common_failure_modes?: any;
};

export default function ComponentInfoPanel({ meshId, onClose }: { meshId?: string | null; onClose?: () => void }) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByName = useCallback(async (name: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('component_encyclopedia').select('*').eq('component_name', name).maybeSingle();
    setLoading(false);
    if (error) {
      console.error('fetchByName', error);
      return null;
    }
    return data as Entry | null;
  }, []);

  const fuzzySearch = useCallback(async (q: string) => {
    setLoading(true);
    const qlike = `%${q}%`;
    const { data: a, error: e1 } = await supabase.from('component_encyclopedia').select('*').ilike('component_name', qlike).limit(30);
    const { data: b, error: e2 } = await supabase.from('component_encyclopedia').select('*').ilike('description', qlike).limit(30);
    setLoading(false);
    if (e1 && e2) {
      console.error('fuzzySearch errors', e1, e2);
      return [];
    }
    const combined = [] as Entry[];
    if (Array.isArray(a)) combined.push(...a as Entry[]);
    if (Array.isArray(b)) combined.push(...b as Entry[]);
    // dedupe by component_name
    const seen = new Map<string, Entry>();
    for (const r of combined) if (!seen.has(r.component_name)) seen.set(r.component_name, r);
    return Array.from(seen.values()).slice(0, 40);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!meshId) return;
      setEntry(null);
      setResults([]);
      // try exact name
      const exact = await fetchByName(meshId);
      if (exact && mounted) {
        setEntry(exact);
        return;
      }

      // try mapping terms
      const terms = componentEncyclopediaMapping[meshId] || [meshId];
      for (const t of terms) {
        const r = await fuzzySearch(t);
        if (r && r.length > 0) {
          if (mounted) setResults(r);
          return;
        }
      }
    })();
    return () => { mounted = false; };
  }, [meshId, fetchByName, fuzzySearch]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    const r = await fuzzySearch(query);
    setResults(r);
    setEntry(null);
  };

  return (
    <div className="bg-white/95 border p-3 rounded shadow-lg w-96 max-w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Component Info</div>
        <div className="flex gap-2">
          <button onClick={() => { setEntry(null); setResults([]); setQuery(''); }} className="text-xs px-2 py-1 bg-slate-100 rounded">Clear</button>
          {onClose && <button onClick={onClose} className="text-xs px-2 py-1 bg-red-100 rounded">Close</button>}
        </div>
      </div>

      <form onSubmit={handleManualSearch} className="mb-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search encyclopedia..." className="w-full px-2 py-1 border rounded" />
      </form>

      {loading && <div className="text-sm text-slate-500">Loading…</div>}

      {entry ? (
        <div>
          <div className="text-sm font-semibold">{entry.component_name}</div>
          {entry.description && <div className="mt-2 text-sm whitespace-pre-wrap">{entry.description}</div>}
          {entry.physics_principle && <div className="mt-2 text-xs text-slate-600">Physics: {entry.physics_principle}</div>}
          {entry.common_failure_modes && <div className="mt-2 text-xs text-slate-600">Common failures: {JSON.stringify(entry.common_failure_modes)}</div>}
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-auto">
          {results.map((r) => (
            <div key={r.id} className="p-2 border rounded bg-slate-50">
              <div className="font-semibold">{r.component_name}</div>
              {r.description && <div className="text-xs text-slate-700 truncate">{r.description}</div>}
              <div className="mt-1 flex gap-2">
                <button className="text-xs px-2 py-0.5 bg-slate-100 rounded" onClick={async () => { setEntry(r); setResults([]); }}>{'Open'}</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">No encyclopedia entry found. Try searching manually.</div>
      )}
    </div>
  );
}
