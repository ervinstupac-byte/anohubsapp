export interface CausalEvent {
  id: string;
  eventType: 'symptom' | 'primary_suspect' | 'secondary_suspect' | 'consequence' | 'deviation' | 'threshold_breach' | 'cascade' | 'trip';
  description: string;
  confidence: number;
  evidence?: string;
  sensorId?: string;
  timestamp?: number;
  magnitude?: number;
}

export interface RootCauseAnalysis {
  primaryAggressor: {
    description: string;
    confidence: number;
    sensorId?: string;
    deviationTime?: number;
    magnitude?: number;
    baselineValue?: number;
    actualValue?: number;
  };
  causalChain: CausalEvent[];
  confidence: number;
  summary: string;
}

export interface FaultSymptoms {
  cavitationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  thermalStress: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  vibrationSeverityZone: string;
}

export interface EngineInputParams {
  head: number;
  flow: number;
  rpm: number;
  temperature: number;
  vibration: number;
  efficiency: number;
  suctionHead: number;
}

export function analyzeRootCause(
  symptoms: FaultSymptoms,
  params: EngineInputParams
): RootCauseAnalysis | null {
  const causalChain: CausalEvent[] = [];
  const triggeredSymptoms: { type: keyof FaultSymptoms; message: string }[] = [];

  if (symptoms.cavitationRisk === 'HIGH') {
    triggeredSymptoms.push({ type: 'cavitationRisk', message: `High cavitation risk detected (Suction Head: ${params.suctionHead}m, Flow: ${params.flow}m³/s)` });
  }
  if (symptoms.thermalStress === 'CRITICAL') {
    triggeredSymptoms.push({ type: 'thermalStress', message: `Critical thermal stress (Temperature: ${params.temperature}°C)` });
  }
  if (symptoms.vibrationSeverityZone.includes('Zone D') || symptoms.vibrationSeverityZone.includes('Zone C')) {
    triggeredSymptoms.push({ type: 'vibrationSeverityZone', message: `Critical vibration (Vibration: ${params.vibration}mm/s)` });
  }

  if (triggeredSymptoms.length === 0) {
    return null;
  }

  // Add primary symptom(s)
  triggeredSymptoms.forEach((symptom, idx) => {
    causalChain.push({
      id: `SYMPTOM-${idx}`,
      eventType: 'symptom',
      description: symptom.message,
      confidence: 98,
      evidence: 'Measured sensor values exceed threshold limits',
      magnitude: 90,
      timestamp: Date.now(),
      sensorId: 'SENSOR-' + symptom.type.toUpperCase()
    });
  });

  // Build causal chain based on symptoms
  if (symptoms.thermalStress === 'CRITICAL') {
    causalChain.push({
      id: 'PRIMARY-THERMAL',
      eventType: 'primary_suspect',
      description: 'Insufficient Bearing Cooling Flow',
      confidence: 75,
      evidence: `High operating temperature (${params.temperature}°C) indicates reduced heat transfer`,
      magnitude: 75,
      timestamp: Date.now(),
      sensorId: 'BEARING-COOLING'
    });

    causalChain.push({
      id: 'SECONDARY-THERMAL',
      eventType: 'secondary_suspect',
      description: 'Heat Exchanger Fouling',
      confidence: 60,
      evidence: 'Reduced heat transfer efficiency due to mineral deposits or corrosion',
      magnitude: 60,
      timestamp: Date.now(),
      sensorId: 'HEAT-EXCHANGER'
    });

    causalChain.push({
      id: 'CONSEQUENCE-THERMAL',
      eventType: 'consequence',
      description: 'Oil Degradation Imminent',
      confidence: 80,
      evidence: 'Temperatures above 85°C accelerate oil oxidation and viscosity loss',
      magnitude: 80,
      timestamp: Date.now(),
      sensorId: 'OIL-QUALITY'
    });
  }

  if (symptoms.cavitationRisk === 'HIGH') {
    causalChain.push({
      id: 'PRIMARY-CAVITATION',
      eventType: 'primary_suspect',
      description: 'Insufficient Draft Tube Submergence',
      confidence: 78,
      evidence: `Suction head of ${params.suctionHead}m is below recommended minimum`,
      magnitude: 78,
      timestamp: Date.now(),
      sensorId: 'SUCTION-HEAD'
    });

    causalChain.push({
      id: 'SECONDARY-CAVITATION',
      eventType: 'secondary_suspect',
      description: 'Excessive Flow Rate',
      confidence: 55,
      evidence: `Flow rate (${params.flow}m³/s) may exceed design capacity at current head`,
      magnitude: 55,
      timestamp: Date.now(),
      sensorId: 'FLOW-RATE'
    });

    causalChain.push({
      id: 'CONSEQUENCE-CAVITATION',
      eventType: 'consequence',
      description: 'Runner Blade Pitting',
      confidence: 85,
      evidence: 'High cavitation risk leads to bubble collapse and material erosion',
      magnitude: 85,
      timestamp: Date.now(),
      sensorId: 'RUNNER-BLADES'
    });
  }

  if (symptoms.vibrationSeverityZone.includes('Zone D') || symptoms.vibrationSeverityZone.includes('Zone C')) {
    causalChain.push({
      id: 'PRIMARY-VIBRATION',
      eventType: 'primary_suspect',
      description: 'Rotor Mass Imbalance',
      confidence: 70,
      evidence: `High vibration (${params.vibration}mm/s) indicates unbalanced rotating components`,
      magnitude: 70,
      timestamp: Date.now(),
      sensorId: 'VIBRATION-MONITOR'
    });

    causalChain.push({
      id: 'SECONDARY-VIBRATION',
      eventType: 'secondary_suspect',
      description: 'Shaft Misalignment',
      confidence: 60,
      evidence: 'Misaligned coupling leads to increased radial loads and vibration',
      magnitude: 60,
      timestamp: Date.now(),
      sensorId: 'SHAFT-ALIGNMENT'
    });

    causalChain.push({
      id: 'CONSEQUENCE-VIBRATION',
      eventType: 'consequence',
      description: 'Bearing Overload & Wear',
      confidence: 82,
      evidence: 'Excessive vibration accelerates bearing fatigue and failure',
      magnitude: 82,
      timestamp: Date.now(),
      sensorId: 'BEARING-HEALTH'
    });
  }

  // Calculate overall confidence
  const avgConfidence = causalChain.reduce((sum, event) => sum + event.confidence, 0) / causalChain.length;
  const overallConfidence = Math.round(avgConfidence);

  // Build summary
  const symptomCount = triggeredSymptoms.length;
  const primarySuspects = causalChain.filter(e => e.eventType === 'primary_suspect');
  const summary = `Detected ${symptomCount} critical symptom(s). Primary suspect(s): ${primarySuspects.map(p => p.description).join(', ')}.`;

  const primaryAggressor = primarySuspects.length > 0 
    ? { 
        description: primarySuspects[0].description, 
        confidence: primarySuspects[0].confidence,
        sensorId: primarySuspects[0].sensorId,
        magnitude: primarySuspects[0].magnitude,
        deviationTime: primarySuspects[0].timestamp
      }
    : { description: 'Unknown Root Cause', confidence: 30, sensorId: 'UNKNOWN' };

  return {
    primaryAggressor,
    causalChain,
    confidence: overallConfidence,
    summary
  };
}

// Deprecated class for backward compatibility
export class RootCauseEngine {
  static analyze() {
    return {
      primaryAggressor: { sensorId: 'UNKNOWN', deviationTime: Date.now(), magnitude: 0, baselineValue: 0, actualValue: 0 },
      causalChain: [],
      confidence: 0,
      summary: 'Deprecated API: Use analyzeRootCause() instead'
    };
  }
  getConfidenceScore() {
    return 0;
  }
}
