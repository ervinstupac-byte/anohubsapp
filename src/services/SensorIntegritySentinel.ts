/**
 * SensorIntegritySentinel
 * - Cross-correlates related sensor streams (temperature, vibration, load, flow)
 * - Flags 'Sensor Anomaly' when a reading is physically inconsistent
 * - Prevents Sovereign Trip by translating to a safe operating recommendation
 */

export type SensorSnapshot = {
  timestamp: number;
  temperatureC?: number;
  vibrationMmS?: number;
  loadMw?: number;
  flowM3s?: number;
  pressureBar?: number;
};

export type IntegrityResult = {
  sensorAnomaly: boolean;
  anomalousField?: string;
  recommendedSafeState?: { throttlePct?: number; mode?: 'RUN_THROTTLED' | 'STANDBY' | 'STOP' };
  confidence?: number; // 0-1
  note?: string;
};

import BaseGuardian from './BaseGuardian';

export default class SensorIntegritySentinel extends BaseGuardian {
  // Simple correlation expectations (domain heuristics)
  // e.g., high temperature correlates with high vibration and increased load or low flow
  static correlate(snapshot: SensorSnapshot, recentHistory: SensorSnapshot[] = []): IntegrityResult {
    try {
      // Basic impossible checks
      if (snapshot.temperatureC !== undefined && (snapshot.temperatureC < -40 || snapshot.temperatureC > 200)) {
        return { sensorAnomaly: true, anomalousField: 'temperatureC', recommendedSafeState: { throttlePct: 50, mode: 'RUN_THROTTLED' }, confidence: 0.98, note: 'Temperature outside physical bounds' };
      }

      if (snapshot.vibrationMmS !== undefined && snapshot.vibrationMmS > 50) {
        // extremely high vibration should be cross-checked against load
        if ((snapshot.loadMw || 0) < 5) {
          // vibration high while load low -> sensor anomaly
          return { sensorAnomaly: true, anomalousField: 'vibrationMmS', recommendedSafeState: { throttlePct: 30, mode: 'RUN_THROTTLED' }, confidence: 0.9, note: 'High vibration without load correlation' };
        }
      }

      // Correlation heuristic: Temperature vs Load vs Flow
      const T = snapshot.temperatureC ?? null;
      const L = snapshot.loadMw ?? null;
      const F = snapshot.flowM3s ?? null;

      if (T !== null && L !== null) {
        // Expect roughly T to increase with load; if load high and temp low/unexpected, flag
        if (L > 0 && T < 0.5 * (20 + Math.log(Math.max(1, L)) * 10)) {
          // implausibly low temp given load -> possible sensor error
          return { sensorAnomaly: true, anomalousField: 'temperatureC', recommendedSafeState: { throttlePct: 80, mode: 'RUN_THROTTLED' }, confidence: 0.6, note: 'Temperature does not scale with load' };
        }
      }

      if (F !== null && L !== null) {
        // flow should roughly match load (specific water consumption). If load >0 but flow is near zero, anomaly
        if (L > 1 && F < 0.01) {
          return { sensorAnomaly: true, anomalousField: 'flowM3s', recommendedSafeState: { throttlePct: 20, mode: 'RUN_THROTTLED' }, confidence: 0.95, note: 'Load present without flow' };
        }
      }

      // Cross-history trend check: detect step discontinuities in one sensor while others steady
      if (recentHistory && recentHistory.length >= 3) {
        const last = recentHistory[recentHistory.length - 1];
        // if temperature jumps by >30°C between last and current but vibration/load unchanged, mark anomaly
        if (T !== null && last.temperatureC !== undefined && Math.abs(T - last.temperatureC) > 30) {
          const vibStable = Math.abs((snapshot.vibrationMmS || 0) - (last.vibrationMmS || 0)) < 1;
          const loadStable = Math.abs((snapshot.loadMw || 0) - (last.loadMw || 0)) < 1;
          if (vibStable && loadStable) {
            return { sensorAnomaly: true, anomalousField: 'temperatureC', recommendedSafeState: { throttlePct: 60, mode: 'RUN_THROTTLED' }, confidence: 0.92, note: 'Abrupt temperature step without matching dynamics' };
          }
        }
      }

      // If nothing anomalous detected
      return { sensorAnomaly: false, confidence: 0.05, note: 'Correlated OK' };
    } catch (e) {
      return { sensorAnomaly: false, confidence: 0.0, note: 'Sentinel internal error' };
    }
  }

  public getConfidenceScore(..._args: any[]): number {
    return this.corrToScore(0);
  }
}
