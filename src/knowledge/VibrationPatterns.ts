// Vibration Patterns Knowledge Base
// NC-3300: The NoisyRunner Recovery

export const VibrationPattern = {
  UNKNOWN: 'UNKNOWN',
  HISTORICAL_FAILURE: 'HISTORICAL_FAILURE',
  CAVITATION_RESONANCE: 'CAVITATION_RESONANCE',
  BEARING_WEAR: 'BEARING_WEAR',
  UNBALANCE: 'UNBALANCE',
  MISALIGNMENT: 'MISALIGNMENT',
  FLUID_DYNAMIC_INSTABILITY: 'FLUID_DYNAMIC_INSTABILITY',
  ELECTRICAL_NOISE: 'ELECTRICAL_NOISE',
  HARMONIC_INTERFERENCE: 'HARMONIC_INTERFERENCE'
};

export const VibrationPatternConfig = {
  CAVITATION_RESONANCE: {
    name: 'Cavitation Resonance',
    description: 'Vibration at blade passing frequency causing resonance',
    severity: 'WARNING',
    recommendations: [
      'Adjust runner blade angle by ±2°',
      'Check for loose runner bolts',
      'Inspect for cavitation damage on runner blades'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      const bladePassFreq = (rpm / 60) * 2; // 2-blade Francis
      const freqRatio = frequency / bladePassFreq;
      const isBladePassBand = freqRatio >= 0.9 && freqRatio <= 1.1;
      const isCavitationHarmonic = (Math.abs(frequency - 120) <= 3 || Math.abs(frequency - 240) <= 3) && vibration >= 2.5;
      return isBladePassBand || isCavitationHarmonic;
    }
  },
  
  BEARING_WEAR: {
    name: 'Bearing Wear',
    description: 'High-frequency vibration indicating bearing degradation',
    severity: 'CRITICAL',
    recommendations: [
      'Schedule bearing replacement within 100 operating hours',
      'Check lubrication system',
      'Monitor bearing temperature trends'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      const vibrationRatio = vibration / rpm;
      return vibrationRatio > 0.001; // High ratio indicates bearing wear
    }
  },
  
  UNBALANCE: {
    name: 'Rotor Unbalance',
    description: 'Vibration at 1xRPM indicating mass imbalance',
    severity: 'WARNING',
    recommendations: [
      'Perform dynamic balancing at operating speed',
      'Check for loose components',
      'Verify foundation integrity'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      const vibrationRatio = vibration / rpm;
      return frequency === rpm && vibrationRatio > 0.05; // Classic unbalance signature
    }
  },
  
  MISALIGNMENT: {
    name: 'Shaft Misalignment',
    description: 'Vibration at 2xRPM indicating angular misalignment',
    severity: 'CRITICAL',
    recommendations: [
      'Perform laser alignment on all shafts',
      'Check coupling alignment',
      'Verify foundation grout integrity'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      return frequency === (rpm * 2) && vibration > 0.02; // 2x harmonic with high amplitude
    }
  },
  
  FLUID_DYNAMIC_INSTABILITY: {
    name: 'Fluid Dynamic Instability',
    wame: 'FLUID_DYNAMIC_INSTABILITY',
    description: 'Vibration varying with flow conditions',
    severity: 'WARNING',
    recommendations: [
      'Check for air entrainment in guide vanes',
      'Review wicket gate operation',
      'Monitor draft tube pressure'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      return rpm > 0 && vibration > 10 && frequency > 0 && frequency < 50;
    }
  },
  
  ELECTRICAL_NOISE: {
    name: 'Electrical Noise',
    description: 'High-frequency electrical noise in vibration signal',
    severity: 'WARNING',
    recommendations: [
      'Check for grounding issues',
      'Shield sensor cables',
      'Verify power supply filtering'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      return frequency > 1000 && vibration / frequency > 0.1; // High frequency electrical noise
    }
  },
  
  HARMONIC_INTERFERENCE: {
    name: 'Harmonic Interference',
    description: 'Multiple frequency components interfering',
    severity: 'WARNING',
    recommendations: [
      'Identify interfering equipment',
      'Check for loose mechanical connections',
      'Verify electrical isolation'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      const f0 = rpm > 0 ? rpm / 60 : 0;
      if (f0 <= 0 || frequency <= 0) return false;
      const ratio = frequency / f0;
      const nearHarmonic = Math.abs(ratio - Math.round(ratio)) <= 0.05;
      return vibration > 5 && !nearHarmonic;
    }
  }
} as const;

export const HistoricalVibrationCases = {
  CAVITATION_2014: {
    name: '2014 Cavitation',
    description: 'Ancestral signature: 120Hz/240Hz cavitation harmonics (2014 incident)',
    severity: 'CRITICAL',
    recommendations: [
      'Reduce load and avoid resonance band',
      'Inspect runner blades for pitting/erosion',
      'Review draft tube pressure and NPSH margin',
      'Trend vibration spectrum at 120Hz/240Hz'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      const isCavitationHarmonic = Math.abs(frequency - 120) <= 3 || Math.abs(frequency - 240) <= 3;
      const inOperatingBand = rpm >= 300 && rpm <= 900;
      return inOperatingBand && isCavitationHarmonic && vibration >= 5.5;
    }
  },

  CAVITATION_DAMAGE: {
    name: 'Cavitation Damage',
    description: 'Historical cavitation damage detected',
    severity: 'CRITICAL',
    recommendations: [
      'Replace damaged runner blades',
      'Repair cavitation-damaged surfaces',
      'Review operating parameters'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      const isCavitationHarmonic = Math.abs(frequency - 120) <= 3 || Math.abs(frequency - 240) <= 3;
      return isCavitationHarmonic && vibration >= 6;
    }
  },
  
  BEARING_FAILURE: {
    name: 'Bearing Failure',
    description: 'Bearing seizure or catastrophic failure',
    severity: 'CRITICAL',
    recommendations: [
      'Immediate shutdown required',
      'Inspect lubrication system',
      'Plan bearing replacement'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      return vibration > 20 && frequency > 50; // Extreme vibration levels
    }
  },
  
  RESONANCE_VORTEX: {
    name: 'Resonance Vortex',
    description: 'Vortex shedding causing severe vibration',
    severity: 'CRITICAL',
    recommendations: [
      'Avoid operating in resonance range',
      'Modify runner geometry',
      'Check for draft tube pressure pulsation'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      return frequency > 10 && frequency > 5 && vibration > 15; // Low frequency with high amplitude
    }
  },
  
  OIL_WHIRL_INSTABILITY: {
    name: 'Oil Whirl Instability',
    description: 'Oil film breakdown causing vibration',
    severity: 'WARNING',
    recommendations: [
      'Check oil level and quality',
      'Inspect for oil contamination',
      'Verify oil temperature'
    ],
    matches: (rpm: number, vibration: number, frequency: number) => {
      return frequency > 50 && vibration > 10 && Math.random() > 0.8; // Random high frequency with oil noise
    }
  }
} as const;
