import { useEffect, useRef, useState } from 'react';
import type { TelemetryData } from '../contexts/TelemetryContext';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { PeltonEngine } from '../lib/engines/PeltonEngine';
import mapDiagnosticToUI from '../lib/engines/diagnosticMapper';
import Decimal from 'decimal.js';

function rand(center: number, range: number) {
  return +(center + (Math.random() - 0.5) * 2 * range).toFixed(3);
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

export function usePeltonSimulator(assetId?: number | string | null): TelemetryData | null {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const nozzlesRef = useRef<number[]>([45, 50, 38, 52, 48, 51]);
  const notifications = useNotificationStore();
  const updateTelemetry = useTelemetryStore(state => state.updateTelemetry);
  const pushAlarm = useTelemetryStore(state => state.pushAlarm);
  const engineRef = useRef<PeltonEngine | null>(null);

  useEffect(() => {
    if (!assetId) return;

    // Initialize base telemetry
    const base: TelemetryData = {
      assetId: assetId as any,
      timestamp: Date.now(),
      status: 'OPTIMAL',
      vibration: 0.02,
      temperature: 55,
      efficiency: 92,
      output: 10,
      piezometricPressure: 4.2,
      seepageRate: 0.1,
      reservoirLevel: 122.5,
      foundationDisplacement: 0,
      wicketGatePosition: 45,
      tailwaterLevel: 105.2,
      cylinderPressure: 45,
      actuatorPosition: 45,
      oilPressureRate: 1.2,
      hoseTension: 25,
      pipeDiameter: 1200,
      safetyValveActive: false,
      oilReservoirLevel: 85,
      rotorHeadVibration: 0.02,
      pumpFlowRate: 5,
      excitationActive: true,
      vibrationSpectrum: [0.1, 0.1, 0.1, 0.1, 0.1],
      drainagePumpActive: false,
      drainagePumpFrequency: 12,
      wicketGateSetpoint: 45,
      lastCommandTimestamp: Date.now(),
      fatiguePoints: 0,
      vibrationPhase: 0,
      oilViscosity: 46,
      bearingLoad: 850,
      statorTemperatures: [55, 55, 55, 55, 55, 55],
      actualBladePosition: 45,
      bypassValveActive: false,
      hydrostaticLiftActive: false,
      shaftSag: 0,
      responseTimeIndex: 0.1,
      proximityX: 0,
      proximityY: 0,
      excitationCurrent: 450,
      rotorEccentricity: 0.15,
      cavitationIntensity: 0.5,
      bearingGrindIndex: 0,
      acousticBaselineMatch: 0.98,
      ultrasonicLeakIndex: 0.1,
      // attach canonical pelton block for panel
      pelton: {
        turbineId: String(assetId),
        headM: 150,
        flowM3s: 12.3,
        jets: 6,
        nozzles: nozzlesRef.current.map((n, i) => ({
          index: i + 1,
          needlePct: n,
          deflectorOpen: Math.random() > 0.1,
          jetPressureBar: +(150 * 0.0980665).toFixed(2),
        })),
        generatorCooling: {
          bearingTempC: 60,
          coolantFlowLps: 12.5,
          bearingCoolingPresent: true,
        },
      },
    } as TelemetryData;

    setTelemetry(base);

    // Initialize engine instance once
    if (!engineRef.current) engineRef.current = new PeltonEngine();

    const interval = setInterval(
      () => {
        // random walk needles
        nozzlesRef.current = nozzlesRef.current.map(n =>
          clamp(n + (Math.random() - 0.5) * 8, 0, 100)
        );

        const bearing = clamp(
          base.pelton!.generatorCooling!.bearingTempC! + (Math.random() - 0.5) * 4,
          30,
          120
        );

        const newTelem: TelemetryData = {
          ...base,
          timestamp: Date.now(),
          temperature: +bearing.toFixed(2),
          output: +(10 + (Math.random() - 0.5) * 1.5).toFixed(3),
          efficiency: +(92 + (Math.random() - 0.5) * 2).toFixed(2),
          cavitationIntensity: +(Math.random() * 2).toFixed(2) as any,
          pelton: {
            ...base.pelton!,
            headM: +(150 + (Math.random() - 0.5) * 3).toFixed(2),
            flowM3s: +(12.3 + (Math.random() - 0.5) * 0.5).toFixed(3),
            nozzles: nozzlesRef.current.map((n, i) => ({
              index: i + 1,
              needlePct: +n.toFixed(2),
              deflectorOpen: Math.random() > 0.05,
              jetPressureBar: +((150 + (Math.random() - 0.5) * 3) * 0.0980665).toFixed(2),
            })),
            generatorCooling: {
              bearingTempC: bearing,
              coolantFlowLps: +(12.5 + (Math.random() - 0.5) * 1).toFixed(2),
              bearingCoolingPresent: Math.random() > 0.01,
            },
          },
        } as TelemetryData;

        setTelemetry(newTelem);
      },
      2200 + Math.round(Math.random() * 800)
    );

    // Fault injection: every 15-20s, create a simulated critical diagnostic
    const faultInterval = setInterval(
      () => {
        try {
          if (!engineRef.current) engineRef.current = new PeltonEngine();
          const engine = engineRef.current;

          // Randomly pick a fault to simulate
          const faultType = Math.random() > 0.5 ? 'bearing_overheat' : 'deflector_mismatch';

          let diagnostic = null as any;

          if (faultType === 'bearing_overheat') {
            // Create a severe bearing temp spike which PeltonEngine can reason about
            diagnostic = engine.checkAxialJump(-1.2); // negative => lifted -> critical

            // Update store telemetry to reflect sensor spike so other systems see it
            updateTelemetry({
              mechanical: { bearingTemp: 120 } as any,
              diagnosis: {
                severity: 'CRITICAL',
                messages: [
                  {
                    code: diagnostic.code,
                    en: diagnostic.params?.message ?? diagnostic.code,
                    bs: diagnostic.params?.message ?? diagnostic.code,
                  },
                ],
                safetyFactor: new Decimal(0.2),
              } as any,
            });
          } else {
            // Deflector mismatch scenario
            diagnostic = engine.checkDeflectorSafety(false, 'PASSIVE', 2.5, 2.0); // generatorTripped=false, deflector gap too small -> warning/critical

            updateTelemetry({
              mechanical: { bearingTemp: +(80 + Math.random() * 30) } as any,
              diagnosis: {
                severity: diagnostic.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                messages: [
                  {
                    code: diagnostic.code,
                    en: diagnostic.params?.message ?? diagnostic.code,
                    bs: diagnostic.params?.message ?? diagnostic.code,
                  },
                ],
                safetyFactor: new Decimal(0.5),
              } as any,
            });
          }

          // Map diagnostic to UI message and push a notification
          if (diagnostic) {
            const ui = mapDiagnosticToUI(diagnostic);
            // Push alarm into telemetry store's activeAlarms and send a toast
            pushAlarm({
              id: `SIM-${Date.now()}`,
              severity: diagnostic.severity as any,
              message: ui.message,
            });
            notifications.pushNotification(
              diagnostic.severity as any,
              ui.translationKey || 'notifications.alert',
              { message: ui.message },
              '/alerts'
            );
          }
        } catch (e) {
          console.error('Simulator fault injection failed', e);
        }
      },
      15000 + Math.round(Math.random() * 5000)
    );

    return () => clearInterval(interval);
  }, [assetId]);

  return telemetry;
}

export default usePeltonSimulator;
