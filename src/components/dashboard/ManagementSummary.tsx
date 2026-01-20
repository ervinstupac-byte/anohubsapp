import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import idAdapter from '../../utils/idAdapter';
import { useAssetContext } from '../../contexts/AssetContext';

export const ManagementSummary: React.FC = () => {
  const { selectedAsset } = useAssetContext();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!selectedAsset) {
        setReports([]);
        return;
      }
      setLoading(true);
      try {
        const numeric = idAdapter.toNumber(selectedAsset.id);
        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : idAdapter.toDb(selectedAsset.id);
        const { data, error } = await supabase.from('reports').select('*').eq('asset_id', assetDbId).order('created_at', { ascending: false }).limit(5);
        if (error) throw error;
        setReports(data || []);
      } catch (e) {
        console.warn('ManagementSummary fetch failed:', e);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedAsset]);

  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-white/5">
      <h4 className="text-sm font-bold text-white mb-3">Last 5 Generated Reports</h4>
      {loading ? (
        <div className="text-xs text-slate-400">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-xs text-slate-500">No reports found for this asset.</div>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="flex justify-between items-center text-sm">
              <div>
                <div className="font-medium text-white">{r.report_type}</div>
                <div className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">{r.computed_loss_cost ? `${Number(r.computed_loss_cost).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}` : '—'}</div>
                <a className="text-xs text-cyan-400" href={r.pdf_path || '#'} target="_blank" rel="noreferrer">Open</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagementSummary;
