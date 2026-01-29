// Mapping from 3D mesh IDs to namespaced symptom_key values
export type ComponentMapping = {
  meshId: string;
  symptomKey: string;
  label?: string;
  assetScoped?: boolean; // if true, mapping is filtered by asset_id
};

const mappings: ComponentMapping[] = [
  { meshId: 'runner', symptomKey: 'FRANCIS_SOP_MIV_BYPASS::SCENARIO_BYPASS_VALVE_OPENS_BUT_SPIRAL', label: 'Runner / Blades', assetScoped: true },
  { meshId: 'band', symptomKey: 'FRANCIS_SOP_REGULATING_RING::POWER_OUTPUT_HUNTING', label: 'Runner Band (Regulating Ring)', assetScoped: true },
  { meshId: 'crown', symptomKey: 'FRANCIS_SOP_BEARINGS::MILKY', label: 'Crown / Bearing Cap', assetScoped: true },
  { meshId: 'noseCone', symptomKey: 'FRANCIS_SOP_COUPLING::AWARENESS', label: 'Nose Cone / Coupling', assetScoped: true },
  // fallback/placeholder entries
  { meshId: 'default', symptomKey: 'FRANCIS_SYMPTOM_DICTIONARY_PUBLIC::UNIVERSAL_ERROR_CODES_QUICK_REF_LOGIC', label: 'General Reference', assetScoped: false },
];

export function getSymptomKeyForMesh(meshId: string): ComponentMapping | null {
  const found = mappings.find(m => m.meshId === meshId);
  return found || null;
}

export default mappings;
