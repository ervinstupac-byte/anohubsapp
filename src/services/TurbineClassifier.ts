export type TurbineType =
  | 'VERTICAL_KAPLAN'
  | 'BULB'
  | 'S_TYPE'
  | 'PIT'
  | 'PROPELLER'
  | 'FRANCIS'
  | 'PELTON'
  | 'TURGO'
  ;

export interface DesignConstants {
  n_q_range: [number, number]; // specific speed non-dimensional range
  sigma_limit: number; // cavitation sigma design limit (non-dimensional)
  notes?: string;
}

const TURBINE_CONSTANTS: Record<TurbineType, DesignConstants> = {
  VERTICAL_KAPLAN: { n_q_range: [0.8, 3.5], sigma_limit: 0.6, notes: 'Adjustable-blade Kaplan, high flow low head.' },
  BULB: { n_q_range: [1.2, 3.8], sigma_limit: 0.55, notes: 'Inline bulb units.' },
  S_TYPE: { n_q_range: [0.9, 3.0], sigma_limit: 0.65, notes: 'S-type small low-head runner.' },
  PIT: { n_q_range: [0.7, 2.5], sigma_limit: 0.7, notes: 'Pit configuration, recessed runner.' },
  PROPELLER: { n_q_range: [1.0, 3.2], sigma_limit: 0.6, notes: 'Fixed-blade propeller.' },
  FRANCIS: { n_q_range: [0.3, 1.2], sigma_limit: 0.45, notes: 'Mixed-flow design, mid-head.' },
  PELTON: { n_q_range: [0.02, 0.2], sigma_limit: 0.2, notes: 'Impulse turbine high head.' },
  TURGO: { n_q_range: [0.1, 0.4], sigma_limit: 0.25, notes: 'Impulse hybrid.' }
};

export default class TurbineClassifier {
    public static detectType(asset: any, latest?: any): TurbineType | null {
      // Auto-detection heuristics: prefer explicit config, then family, then physical clues
      if (asset?.turbine_config?.turbine_type) {
        const tRaw = asset.turbine_config.turbine_type.toString().toUpperCase();
        // Direct map
        if ((TURBINE_CONSTANTS as any)[tRaw]) return tRaw as TurbineType;
        // Token heuristics
        if (tRaw.includes('KAPLAN')) return 'VERTICAL_KAPLAN';
        if (tRaw.includes('FRANCIS')) return 'FRANCIS';
        if (tRaw.includes('PELTON')) return 'PELTON';
        if (tRaw.includes('TURGO')) return 'TURGO';
        if (tRaw.includes('PROPELLER')) return 'PROPELLER';
        if (tRaw.includes('BULB')) return 'BULB';
        if (tRaw.includes('PIT')) return 'PIT';
        if (tRaw.includes('S_TYPE') || tRaw.includes('S-TYPE') || tRaw === 'S') return 'S_TYPE';
      }

      const fam = (asset?.turbine_family || '').toString().toUpperCase();
      switch (fam) {
        case 'FRANCIS': return 'FRANCIS';
        case 'PELTON': return 'PELTON';
        case 'TURGO': return 'TURGO';
        case 'KAPLAN':
        case 'VERTICAL_KAPLAN':
        case 'KAPLAN_VERTICAL':
          return 'VERTICAL_KAPLAN';
        case 'PROPELLER': return 'PROPELLER';
        default: return null;
      }
    }

  public static getDesignConstants(type: TurbineType): DesignConstants {
    return TURBINE_CONSTANTS[type];
  }
}
