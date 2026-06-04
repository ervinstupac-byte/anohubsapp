/**
 * AlarmBridgeContext.tsx
 *
 * THE MISSING NERVOUS SYSTEM.
 *
 * This context bridges the gap between:
 *   TelemetryContext (raw sensor data) → SovereignAlarmManager (ISA 18.2 alarm lifecycle)
 *   → useAlarmStore (reactive UI state)
 *
 * Previously: TelemetryContext fired status='CRITICAL' and nothing happened.
 * Now: Every CRITICAL/WARNING telemetry tick raises a structured, deduplicated alarm
 * that is:
 *   1. Stored in SovereignAlarmManager (with suppression logic)
 *   2. Written to useAlarmStore (for reactive UI: badge counts, notification panel)
 *   3. Optionally escalated to audit log via AuditContext
 *
 * Data flow:
 *   TelemetryContext.telemetry[assetId].status → AlarmBridge evaluates thresholds
 *   → SovereignAlarmManager.raiseAlarm()
 *   → useAlarmStore.addAlarm()
 *   → <NotificationCenter /> renders badge + panel
 *
 * When telemetry normalises, the bridge automatically clears the alarm.
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useTelemetry, TelemetryData } from './TelemetryContext';
import { useAssetContext } from './AssetContext';
import { useAudit } from './AuditContext';
import { SovereignAlarmManager, AlarmPriority, Alarm } from '../services/SovereignAlarmManager';
import { useAlarmStore } from '../stores/useAlarmStore';

// ─── Threshold definitions ───────────────────────────────────────────────────
interface AlarmThreshold {
  field: keyof TelemetryData;
  label: string;
  category: string;
  warningValue: number;
  criticalValue: number;
  unit: string;
  canSelfHeal: boolean;
  direction: 'above' | 'below'; // above = alert when value > threshold
}

const ALARM_THRESHOLDS: AlarmThreshold[] = [
  {
    field: 'vibration',
    label: 'Shaft Vibration',
    category: 'VIBRATION',
    warningValue: 4.5,
    criticalValue: 7.1,
    unit: 'mm/s',
    canSelfHeal: false,
    direction: 'above',
  },
  {
    field: 'temperature',
    label: 'Bearing Temperature',
    category: 'TEMPERATURE',
    warningValue: 70,
    criticalValue: 85,
    unit: '°C',
    canSelfHeal: true,
    direction: 'above',
  },
  {
    field: 'efficiency',
    label: 'Turbine Efficiency',
    category: 'EFFICIENCY',
    warningValue: 85,
    criticalValue: 75,
    unit: '%',
    canSelfHeal: false,
    direction: 'below',
  },
  {
    field: 'cavitationIntensity',
    label: 'Cavitation Intensity',
    category: 'CAVITATION',
    warningValue: 4.0,
    criticalValue: 7.0,
    unit: 'index',
    canSelfHeal: false,
    direction: 'above',
  },
  {
    field: 'oilReservoirLevel',
    label: 'HPU Oil Level',
    category: 'HYDRAULIC',
    warningValue: 70,
    criticalValue: 55,
    unit: '%',
    canSelfHeal: false,
    direction: 'below',
  },
  {
    field: 'bearingGrindIndex',
    label: 'Bearing Grind Index',
    category: 'MECHANICAL',
    warningValue: 3.0,
    criticalValue: 6.0,
    unit: 'index',
    canSelfHeal: false,
    direction: 'above',
  },
  {
    field: 'cylinderPressure',
    label: 'Cylinder Pressure',
    category: 'HYDRAULIC',
    warningValue: 160,
    criticalValue: 200,
    unit: 'bar',
    canSelfHeal: true,
    direction: 'above',
  },
];

// ─── Context types ────────────────────────────────────────────────────────────
interface AlarmBridgeContextType {
  acknowledgeAlarm: (alarmId: string) => void;
  clearAlarm: (alarmId: string) => void;
}

const AlarmBridgeContext = createContext<AlarmBridgeContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AlarmBridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { telemetry } = useTelemetry();
  const { assets } = useAssetContext();
  const { logAction } = useAudit();
  const { addAlarm, removeAlarm, setAlarms } = useAlarmStore();

  // Track which alarm IDs we raised per (assetId + category) to allow clearing
  const raisedAlarmIds = useRef<Map<string, string>>(new Map());

  const getAssetName = useCallback(
    (assetId: string): string => {
      const asset = assets.find(a => String(a.id) === assetId);
      return asset?.name ?? `Asset #${assetId}`;
    },
    [assets]
  );

  useEffect(() => {
    if (Object.keys(telemetry).length === 0) return;

    Object.entries(telemetry).forEach(([assetId, tData]) => {
      // Guard: tData can be undefined when a stale key exists without a matching value
      if (!tData || typeof tData !== 'object') return;
      const assetName = getAssetName(assetId);

      ALARM_THRESHOLDS.forEach(threshold => {
        const rawValue = (tData as Record<string, unknown>)[threshold.field as string];
        if (rawValue === undefined || rawValue === null) return;
        const value = Number(rawValue);
        const alarmKey = `${assetId}::${threshold.category}`;

        // Determine severity
        let isCritical = false;
        let isWarning = false;

        if (threshold.direction === 'above') {
          isCritical = value >= threshold.criticalValue;
          isWarning = !isCritical && value >= threshold.warningValue;
        } else {
          isCritical = value <= threshold.criticalValue;
          isWarning = !isCritical && value <= threshold.warningValue;
        }

        const existingAlarmId = raisedAlarmIds.current.get(alarmKey);

        if (isCritical || isWarning) {
          // If we already raised an alarm for this key, don't duplicate
          if (existingAlarmId) return;

          const priority = isCritical ? AlarmPriority.CRITICAL : AlarmPriority.HIGH;

          const dirSymbol = threshold.direction === 'above' ? '>' : '<';
          const thresholdValue = isCritical ? threshold.criticalValue : threshold.warningValue;
          const message = `${assetName}: ${threshold.label} ${dirSymbol} ${thresholdValue}${threshold.unit} (measured: ${value.toFixed(2)}${threshold.unit})`;

          // Raise in SovereignAlarmManager
          const alarmId = SovereignAlarmManager.raiseAlarm({
            priority,
            category: threshold.category,
            assetId,
            message,
            value,
            threshold: thresholdValue,
            canSelfHeal: threshold.canSelfHeal,
          });

          raisedAlarmIds.current.set(alarmKey, alarmId);

          // Push to reactive store for UI
          addAlarm({
            id: alarmId,
            assetId,
            assetName,
            category: threshold.category,
            label: threshold.label,
            message,
            value,
            threshold: thresholdValue,
            unit: threshold.unit,
            priority: isCritical ? 'CRITICAL' : 'WARNING',
            state: 'ACTIVE',
            timestamp: Date.now(),
            canSelfHeal: threshold.canSelfHeal,
          });

          // Audit log for critical alarms
          if (isCritical) {
            try {
              logAction(
                `ALARM_RAISED:${threshold.category}`,
                `${message} | AlarmID: ${alarmId}`,
                'SUCCESS'
              );
            } catch {
              /* audit non-blocking */
            }
          }
        } else {
          // Value normalised — clear any existing alarm
          if (existingAlarmId) {
            SovereignAlarmManager.clearAlarm(existingAlarmId);
            removeAlarm(existingAlarmId);
            raisedAlarmIds.current.delete(alarmKey);
          }
        }
      });
    });
  }, [telemetry, getAssetName, addAlarm, removeAlarm, logAction]);

  // Sync full alarm list to store periodically (picks up manager-level changes)
  useEffect(() => {
    const sync = () => {
      // SovereignAlarmManager is the engineering record; useAlarmStore is UI source of truth.
      // This interval exists to allow future reconciliation if needed.
      void SovereignAlarmManager.getStatistics();
    };
    const id = setInterval(sync, 30_000);
    return () => clearInterval(id);
  }, [setAlarms]);

  const acknowledgeAlarm = useCallback(
    (alarmId: string) => {
      SovereignAlarmManager.acknowledgeAlarm(alarmId, 'OPERATOR');
      useAlarmStore.getState().acknowledgeAlarm(alarmId);
      try {
        logAction('ALARM_ACKNOWLEDGED', `AlarmID: ${alarmId}`, 'SUCCESS');
      } catch {
        /* non-blocking */
      }
    },
    [logAction]
  );

  const clearAlarm = useCallback((alarmId: string) => {
    SovereignAlarmManager.clearAlarm(alarmId);
    useAlarmStore.getState().removeAlarm(alarmId);
    // Clean up tracking map
    for (const [key, id] of raisedAlarmIds.current.entries()) {
      if (id === alarmId) {
        raisedAlarmIds.current.delete(key);
        break;
      }
    }
  }, []);

  return (
    <AlarmBridgeContext.Provider value={{ acknowledgeAlarm, clearAlarm }}>
      {children}
    </AlarmBridgeContext.Provider>
  );
};

export const useAlarmBridge = (): AlarmBridgeContextType => {
  const ctx = useContext(AlarmBridgeContext);
  if (!ctx) throw new Error('useAlarmBridge must be used inside AlarmBridgeProvider');
  return ctx;
};
