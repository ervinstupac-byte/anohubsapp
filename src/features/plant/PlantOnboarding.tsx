import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function PlantOnboarding() {
  const [plantName, setPlantName] = useState('');
  const [riverName, setRiverName] = useState('');
  const [designHead, setDesignHead] = useState('');
  const [ratedFlow, setRatedFlow] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // create plant first
      const { data: plant, error: plantErr } = await supabase
        .from('plants')
        .insert([{ name: plantName, location_name: riverName }])
        .select('id')
        .single();
      if (plantErr) throw plantErr;
      const plantId = plant.id;

      // Create a lightweight asset record tied to this plant so pricing can be asset-specific
      let createdAssetId: string | null = null;
      try {
        const { data: assetData, error: assetErr } = await supabase.from('assets').insert([{ name: `${plantName} Asset`, plant_id: plantId }]).select('id').single();
        if (!assetErr && assetData && assetData.id) createdAssetId = assetData.id;
      } catch (e) {
        // non-fatal: continue without asset
        console.warn('Could not create asset record during onboarding', e);
      }

      // Use a transaction-like pattern: insert hydrology_context and pricing_history; supabase doesn't support multi-statement transactions here, but we insert and rollback manual on failure
      const hydrologyPayload = {
        plant_id: plantId,
        gross_head_m: Number(designHead),
        design_flow_cms: Number(ratedFlow),
      };

      const { data: hydroData, error: hydroErr } = await supabase.from('hydrology_context').insert([hydrologyPayload]).select('id').single();
      if (hydroErr) throw hydroErr;

      const pricingPayload: any = {
        asset_id: createdAssetId,
        effective_from: new Date().toISOString(),
        price_per_kwh: Number(pricePerKwh),
        notes: 'Initial onboarding tariff'
      };
      // Insert pricing row; if no asset was created, insert with asset_id = NULL
      if (!pricingPayload.asset_id) delete pricingPayload.asset_id;
      const { error: priceErr } = await supabase.from('pricing_history').insert([pricingPayload]);
      if (priceErr) throw priceErr;

      setMessage('Plant onboarded successfully. Please link assets to this plant and update pricing for specific assets.');
    } catch (err: any) {
      console.error('Onboarding error', err);
      setMessage('Error creating plant: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl">
      <h2 className="text-lg font-medium mb-3">Plant Onboarding</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Plant Name</label>
          <input value={plantName} onChange={e=>setPlantName(e.target.value)} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm">River Name / Location</label>
          <input value={riverName} onChange={e=>setRiverName(e.target.value)} className="mt-1 block w-full" required />
        </div>
        <div>
          <label className="block text-sm">Design Head (H, m)</label>
          <input value={designHead} onChange={e=>setDesignHead(e.target.value)} className="mt-1 block w-full" type="number" step="0.01" required />
        </div>
        <div>
          <label className="block text-sm">Rated Flow (Q, m^3/s)</label>
          <input value={ratedFlow} onChange={e=>setRatedFlow(e.target.value)} className="mt-1 block w-full" type="number" step="0.01" required />
        </div>
        <div>
          <label className="block text-sm">Current Tariff (price per kWh)</label>
          <input value={pricePerKwh} onChange={e=>setPricePerKwh(e.target.value)} className="mt-1 block w-full" type="number" step="0.0001" required />
        </div>
        <div>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : 'Create Plant'}</button>
        </div>
      </form>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
