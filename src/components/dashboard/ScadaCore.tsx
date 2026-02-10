import React, { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { Activity, AlertTriangle, ExternalLink } from 'lucide-react';
import { SafetyInterlockEngine } from '../../services/SafetyInterlockEngine';
import { EventLogger } from '../../services/EventLogger';
import { useProjectConfigStore } from '../../features/config/ProjectConfigStore';
import { computeEfficiencyFromHillChart } from '../../features/physics-core/UnifiedPhysicsCore';
import { EfficiencyOptimizer } from '../../services/EfficiencyOptimizer';
import { VortexDiagnostic } from '../../services/VortexDiagnostic';
import { FinancialImpactEngine } from '../../services/core/FinancialImpactEngine';
import { PhysicsMathService } from '../../services/core/PhysicsMathService';
import { LubeStatus } from './LubeStatus';
import { Eye, EyeOff } from 'lucide-react';
import { SmartTooltip } from '../ui/SmartTooltip';

export const ScadaCore: React.FC<{ focusMode?: boolean, forensicMode?: boolean }> = ({ focusMode = false, forensicMode = false }) => {
  const store = useTelemetryStore() as any;
  const cfgStore = useProjectConfigStore();
  const peltonCfg = cfgStore.getConfig('PELTON');
  const mechanical = useMemo(() => store?.mechanical ?? {}, [store?.mechanical]);
  const hydraulic = useMemo(() => store?.hydraulic ?? {}, [store?.hydraulic]);
  const physics = useMemo(() => store?.physics ?? {}, [store?.physics]);
  const identity = useMemo(() => store?.identity ?? {}, [store?.identity]);
  const telemetryHistory = useMemo(() => store?.telemetryHistory ?? {}, [store?.telemetryHistory]);
  const specializedState = useMemo(() => store?.specializedState ?? {}, [store?.specializedState]);
  const pushAlarm = store?.pushAlarm;
  const acknowledgeAllAlarms = store?.acknowledgeAllAlarms;
  const activeAlarms = store?.activeAlarms ?? [];
  const toggleInvestigation = store?.toggleInvestigation;
  const toggleCommanderMode = store?.toggleCommanderMode;
  const isCommanderMode = !!store?.isCommanderMode;
  const selectDiagnostic = store?.selectDiagnostic;
  const rpm = useMemo(() => Number(mechanical?.rpm ?? 0), [mechanical]);
  const headM = useMemo(() => Number(hydraulic?.head ?? physics?.netHead ?? 0), [hydraulic, physics]);
  const flowM3s = useMemo(() => Number(hydraulic?.flow ?? 0), [hydraulic]);
  const starting = rpm > 0 && rpm < 200;
  const ratedSpeed = useMemo(() => Number(identity?.machineConfig?.ratedSpeedRPM ?? 500), [identity]);

  const [selectedVariant, setSelectedVariant] = useState<string>('francis_vertical');
  const [family, setFamily] = useState<'FRANCIS' | 'KAPLAN' | 'PELTON' | 'BANKI'>('FRANCIS');
  const [hoopStress, setHoopStress] = useState<number | null>(null);
  const [hotspot, setHotspot] = useState<null | { key: 'bearing' | 'stator' | 'rotor' | 'head' | 'flow'; label: string }>(null);
  const [interlock, setInterlock] = useState<{ tripActive: boolean; tripReason: string | null; actionRequired: 'NONE' | 'TRIP' | 'BLOCK_START' }>({
    tripActive: false, tripReason: null, actionRequired: 'NONE'
  });
  const [showThermalOverlay, setShowThermalOverlay] = useState(false);

  const vibrationTotal = useMemo(() => {
    const vx = Number(mechanical?.vibrationX ?? mechanical?.vibration ?? 0);
    const vy = Number(mechanical?.vibrationY ?? 0);
    return Math.sqrt(vx * vx + vy * vy);
  }, [mechanical]);

  useEffect(() => {
    const handler = (e: any) => {
      const fam = (e?.detail?.family || '').toString().toUpperCase();
      const variant = (e?.detail?.variant || '').toString().toLowerCase();
      if (fam === 'KAPLAN' || fam === 'FRANCIS' || fam === 'PELTON' || fam === 'CROSSFLOW') {
        setFamily(fam === 'CROSSFLOW' ? ('BANKI' as any) : (fam as any));
        if (variant) {
          setSelectedVariant(variant);
        } else {
          setSelectedVariant(
            fam === 'KAPLAN' ? 'kaplan_bulb' :
            fam === 'PELTON' ? 'pelton_multi_jet' :
            fam === 'CROSSFLOW' ? 'crossflow_standard' :
            'francis_vertical'
          );
        }
      } else {
        setFamily('FRANCIS');
        setSelectedVariant('francis_vertical');
      }
    };
    window.addEventListener('SET_TURBINE_TYPE', handler as any);
    window.addEventListener('variant-select', handler as any);
    return () => {
      window.removeEventListener('SET_TURBINE_TYPE', handler as any);
      window.removeEventListener('variant-select', handler as any);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const speedPct = ratedSpeed > 0 ? (rpm / ratedSpeed) * 100 : 0;
      const powerMW = Number(physics?.powerMW?.toNumber?.() ?? physics?.powerMW ?? 0);
      const flowSeries = Array.isArray(telemetryHistory?.flow) ? telemetryHistory.flow as any[] : [];
      const last = flowSeries.slice(-1)[0];
      const prev = flowSeries.slice(-2, -1)[0];
      const lastVal = Number(last?.value ?? last ?? 0);
      const prevVal = Number(prev?.value ?? prev ?? 0);
      const jetRateChange = Math.abs(lastVal - prevVal);
      const status = SafetyInterlockEngine.checkProtections(speedPct, powerMW, false, vibrationTotal, {
        family,
        variant: selectedVariant,
        telemetry: {
          flowM3s: flowM3s,
          jetRateChange
        }
      });
      setInterlock(status);
      if (status.actionRequired !== 'NONE' && status.tripReason) {
        pushAlarm?.({
          id: `INTERLOCK_${Date.now()}`,
          severity: 'CRITICAL',
          message: status.tripReason
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [rpm, ratedSpeed, physics, vibrationTotal, pushAlarm, telemetryHistory, family, selectedVariant, flowM3s]);

  const gauge = useMemo(() => {
    const maxRpm =
      family === 'KAPLAN' ? 300 :
      family === 'FRANCIS' ? 600 :
      1200;
    const redline =
      family === 'KAPLAN' ? Math.round(maxRpm * 0.85) :
      family === 'FRANCIS' ? Math.round(maxRpm * 0.85) :
      1000;
    const pct = Math.max(0, Math.min(1, rpm / maxRpm));
    const angle = -120 + pct * 240;
    const redStart = -120 + (redline / maxRpm) * 240;
    return { angle, redStart, maxRpm, redline };
  }, [rpm, family]);

  const pressures = useMemo(() => {
    const rho = 1000;
    const g = 9.81;
    const pStaticPa = Math.max(0, headM) * rho * g;
    const scaleFlow = family === 'KAPLAN' ? Math.min(flowM3s, 80) / 8 : Math.min(flowM3s, 50) / 5;
    const pDynamicPa = Math.max(0, 0.5 * rho * Math.pow(scaleFlow, 2));
    const toKpa = (p: number) => p / 1000;
    return { pStaticKpa: toKpa(pStaticPa), pDynamicKpa: toKpa(pDynamicPa) };
  }, [headM, flowM3s, family]);

  const surgePressureBar = useMemo(() => {
    const fromDecimal = Number(physics?.surgePressure?.toNumber?.() ?? 0);
    const fromNumbers = Number(physics?.surgePressureBar ?? physics?.waterHammerPressureBar ?? physics?.surgePressure ?? 0);
    return Number.isFinite(fromDecimal) && fromDecimal !== 0 ? fromDecimal : fromNumbers;
  }, [physics?.surgePressure, physics?.surgePressureBar, physics?.waterHammerPressureBar, physics?.surgePressure]);

  useEffect(() => {
    // NC-8001: Removed fallbacks to expose missing data bugs
    const diameter = Number(store?.penstock?.diameter);
    const thickness = Number(store?.penstock?.wallThickness);
    const result = PhysicsMathService.calculateHoopStress(headM, surgePressureBar, diameter, thickness);
    // Direct assignment - if hs is NaN, let the UI handle (or crash on) it
    setHoopStress(result.stressMPa);
  }, [headM, surgePressureBar, store?.penstock?.diameter, store?.penstock?.wallThickness]);
  const variantCfg = useMemo(() => cfgStore.getVariantConfig(selectedVariant) ?? cfgStore.getConfig(family as any), [cfgStore, selectedVariant, family]);
  const runnerD2 = Number(variantCfg?.runnerDiameterD2 ?? 0);
  const runnerArea = runnerD2 > 0 ? Math.PI * (runnerD2 * runnerD2) / 4 : 0;
  const dischargeVelocityV2 = runnerArea > 0 ? flowM3s / runnerArea : 0;
  const eta = useMemo(() => computeEfficiencyFromHillChart(family as any, headM, flowM3s), [family, headM, flowM3s]);
  const mechPowerMW = useMemo(() => (1000 * 9.81 * headM * flowM3s * eta) / 1e6, [headM, flowM3s, eta]);
  const gateOpening = useMemo(() => {
    const gv = Number(hydraulic?.guideVaneOpening ?? specializedState?.sensors?.guide_vane_opening ?? 0);
    return Math.max(0, Math.min(100, isNaN(gv) ? 0 : gv));
  }, [hydraulic, specializedState]);
  const specificSpeed = useMemo(() => {
    const n = ratedSpeed;
    const pKw = mechPowerMW * 1000;
    const h = Math.max(1, headM);
    return n * Math.sqrt(Math.max(0, pKw)) / Math.pow(h, 1.25);
  }, [ratedSpeed, mechPowerMW, headM]);
  const specificSpeedRange = useMemo(() => {
    if (family === 'PELTON') return [10, 60];
    if (family === 'FRANCIS') return [60, 300];
    if (family === 'KAPLAN') return [300, 1000];
    return [70, 200];
  }, [family]);
  const lossTracer = useMemo(() => {
    const observedEffRaw = Number(hydraulic?.efficiency ?? physics?.efficiency ?? (eta * 100));
    const observedEffPct = observedEffRaw <= 1 ? observedEffRaw * 100 : observedEffRaw;
    const { etaMax } = EfficiencyOptimizer.compute(headM || 0, flowM3s || 0, isNaN(observedEffPct) ? 0 : observedEffPct);
    const pricePerMWh = Number(store?.financials?.energyPrice ?? 85);
    const powerMW = Number(physics?.powerMW?.toNumber?.() ?? physics?.powerMW ?? mechPowerMW ?? 0);
    const deltaEffFrac = Math.max(0, ((etaMax ?? 0) - (isNaN(observedEffPct) ? 0 : observedEffPct)) / 100);
    const baseLossEuroPerHour = Math.max(0, deltaEffFrac * Math.max(0, powerMW) * Math.max(0, pricePerMWh));
    const ratedMW = Number(store?.identity?.machineConfig?.ratedPowerMW ?? powerMW ?? 0);
    const isPartLoad = ratedMW > 0 ? powerMW < ratedMW * 0.6 : false;
    const rope = isPartLoad ? VortexDiagnostic.analyze([Number(mechanical?.vibrationX ?? 0)], 20) : { isRopeActive: false } as any;
    const taxThreshold = 0.88;
    const effDelta = Math.max(0, taxThreshold - (Number(hydraulic?.efficiency ?? observedEffPct / 100)));
    const flow = Number((hydraulic as any)?.flow ?? (hydraulic as any)?.flowRate ?? 0);
    const head = Number((hydraulic as any)?.head ?? (hydraulic as any)?.netHead ?? headM ?? 0);
    const ineffTaxHourly = Math.max(0, flow * head * effDelta * (Math.max(0, pricePerMWh) / 1000));
    const totalLoss = baseLossEuroPerHour + (rope?.isRopeActive ? ineffTaxHourly : 0);
    return {
      value: totalLoss,
      isRope: !!rope?.isRopeActive
    };
  }, [hydraulic, physics, eta, headM, flowM3s, mechPowerMW, mechanical, store]);
  useEffect(() => {
    const [min, max] = specificSpeedRange;
    if (specificSpeed < min || specificSpeed > max) {
      pushAlarm?.({ id: `DESIGN_${Date.now()}`, severity: 'WARN', message: 'Design Conflict: Specific Speed out of range' });
    }
    if (family === 'KAPLAN' && (cfgStore.getConfig('KAPLAN')?.ratedHeadHn ?? 0) > 100) {
      pushAlarm?.({ id: `HEAD_${Date.now()}`, severity: 'WARN', message: 'Design Conflict: Kaplan head exceeds limit' });
    }
    if (eta > 0.98) {
      pushAlarm?.({ id: `ETA_${Date.now()}`, severity: 'WARN', message: 'Design Conflict: Efficiency exceeds 98%' });
    }
  }, [specificSpeed, specificSpeedRange, family, cfgStore, eta, pushAlarm]);

  const sparkData = useMemo(() => {
    const map = {
      bearing: Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp : [],
      head: Array.isArray(telemetryHistory?.head) ? telemetryHistory.head : [],
      flow: Array.isArray(telemetryHistory?.flow) ? telemetryHistory.flow : [],
      stator: Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp : [],
      rotor: Array.isArray(telemetryHistory?.vibrationX) ? telemetryHistory.vibrationX : []
    } as any;
    const src = hotspot ? map[hotspot.key] || [] : [];
    return (Array.isArray(src) ? src : []).map((d: any, idx: number) => ({ x: idx, y: Number(d?.value ?? d ?? 0) }));
  }, [telemetryHistory, hotspot]);

  const failingSensorKey = useMemo(() => {
    const r = (interlock.tripReason || '').toUpperCase();
    if (r.includes('VIBRATION')) return 'bearing';
    if (r.includes('REVERSE POWER')) return 'stator';
    if (r.includes('OVERSPEED')) return 'rotor';
    if (r.includes('E-STOP')) return 'head';
    return null;
  }, [interlock]);

  const blockedStart = useMemo(() => {
    const speedPct = ratedSpeed > 0 ? (rpm / ratedSpeed) * 100 : 0;
    const powerMW = Number(physics?.powerMW?.toNumber?.() ?? physics?.powerMW ?? 0);
    const familyRules =
      (family === 'PELTON' && flowM3s > 5 && rpm < 50) || // do not start Pelton against high flow at standstill
      (family === 'KAPLAN' && headM < 2) ||               // insufficient head for Kaplan start
      (family === 'FRANCIS' && vibrationTotal > 6);       // elevated vibration blocks start
    return interlock.tripActive || interlock.actionRequired !== 'NONE' || speedPct >= 115 || vibrationTotal > 8.0 || powerMW < -2.0 || familyRules;
  }, [interlock, ratedSpeed, rpm, vibrationTotal, physics, family, flowM3s, headM]);

  const lastVerifiedValue = useMemo(() => {
    const map = {
      bearing: Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp : [],
      head: Array.isArray(telemetryHistory?.head) ? telemetryHistory.head : [],
      flow: Array.isArray(telemetryHistory?.flow) ? telemetryHistory.flow : [],
      stator: Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp : [],
      rotor: Array.isArray(telemetryHistory?.vibrationX) ? telemetryHistory.vibrationX : []
    } as any;
    const src = hotspot ? map[hotspot.key] || [] : [];
    const arr = Array.isArray(src) ? src : [];
    const last = arr.slice(-1)[0];
    const val = Number((last && (last.value ?? last)) ?? NaN);
    const ts = Number((last && last.timestamp) ?? Date.now());
    return { value: isNaN(val) ? null : val, timestamp: ts };
  }, [telemetryHistory, hotspot]);

  const noData = (!store) || ((Number.isNaN(headM) || headM === 0) && (Number.isNaN(flowM3s) || flowM3s === 0) && (Number.isNaN(rpm) || rpm === 0));

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center">
        <div className="text-sm font-mono text-slate-400">Loading SCADA…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid grid-cols-12 gap-6 p-6">
      <div className="col-span-8 bg-[#111111] border border-[#222222] rounded-xl relative overflow-hidden">
        {!focusMode && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mimic Diagram</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono text-slate-400">P_mech: {mechPowerMW.toFixed(2)} MW • η: {(eta*100).toFixed(1)}% • v₂: {dischargeVelocityV2.toFixed(2)} m/s</div>
            <button 
                onClick={() => window.open('#/detach/scada', '_blank', 'width=1000,height=800,menubar=no,status=no')}
                className="text-slate-500 hover:text-cyan-400 transition-colors"
                title="Detach Module"
            >
                <ExternalLink className="w-4 h-4" />
            </button>
            {forensicMode && (
                <button
                    onClick={() => setShowThermalOverlay(!showThermalOverlay)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${showThermalOverlay ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                    {showThermalOverlay ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Thermal Stress
                </button>
            )}
          </div>
        </div>
        )}

        {!focusMode && (
        <div className="px-6 py-1">
          {family === 'PELTON' && <div className="text-[10px] font-mono text-slate-400">Pelton Wheel</div>}
          {family === 'KAPLAN' && <div className="text-[10px] font-mono text-slate-400">Inline Bulb</div>}
          {family === 'FRANCIS' && <div className="text-[10px] font-mono text-slate-400">Spiral Case</div>}
          {family === 'BANKI' && <div className="text-[10px] font-mono text-slate-400">Crossflow Runner</div>}
        </div>
        )}

        <div className="p-6">
          <style>
            {`
              @keyframes dashFlow { to { stroke-dashoffset: -200; } }
              @keyframes pulseRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .cad-grid { fill: url(#gridPattern); }
              .flow-path { stroke: url(#flowGradient); stroke-width: 6; stroke-linecap: round; stroke-dasharray: 8 10; }
              .sensor-label { font-family: monospace; font-size: 12px; }
              .digital-tag { fill: #0b0b0b; stroke: #2a2a2a; stroke-width: 1; rx: 6; }
              .isa-pipe { stroke: #4a5568; stroke-width: 3; fill: none; }
              .isa-valve { stroke: #2d3748; stroke-width: 2; fill: #1a202c; }
              .isa-pump { stroke: #2d3748; stroke-width: 2; fill: #2d3748; }
              .isa-turbine { stroke: #2d3748; stroke-width: 2; fill: #1a202c; }
              .isa-generator { stroke: #2d3748; stroke-width: 2; fill: #2d3748; }
              .technical-line { stroke: #718096; stroke-width: 1; stroke-dasharray: 2,4; }
              .equipment-shadow { filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)); }
            `}
          </style>
          <svg viewBox="0 0 1200 600" className="w-full h-[520px]">
            <defs>
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#1f2937" />
              </pattern>
              <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="100%" stopColor="#2d3748" />
              </linearGradient>
              <radialGradient id="thermalStressGradient">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="turbineGradient">
                <stop offset="0%" stopColor="#2d3748" />
                <stop offset="100%" stopColor="#1a202c" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="1200" height="600" className="cad-grid" />
            
            {/* Loss Tracer Display - Professional Industrial Style */}
            <g className="equipment-shadow">
              <rect x="940" y="30" width="220" height="40" rx="4" className="digital-tag" 
                    fill={lossTracer.isRope ? '#3a0c0c' : '#0f1419'} stroke={lossTracer.isRope ? '#dc2626' : '#374151'} />
              <text x="950" y="50" className="sensor-label" fill={lossTracer.isRope ? '#fca5a5' : '#a7f3d0'} fontWeight="bold">
                LOSS TRACER: €{Number(lossTracer.value || 0).toFixed(0)}/h
              </text>
              {lossTracer.isRope && (
                <circle cx="1150" cy="50" r="8" fill="#dc2626" className="animate-pulse" />
              )}
            </g>
            
            {noData && (
              <g>
                <rect x="400" y="250" width="400" height="100" fill="#1a202c" stroke="#dc2626" strokeWidth="2" rx="8" />
                <text x="600" y="290" textAnchor="middle" fill="#dc2626" fontSize="18" fontFamily="monospace" fontWeight="bold">SYSTEM OFFLINE</text>
                <text x="600" y="315" textAnchor="middle" fill="#718096" fontSize="12" fontFamily="monospace">NO TELEMTRY DATA</text>
              </g>
            )}
            
            {family === 'FRANCIS' && (
              <>
                {/* Professional Francis Turbine Schematic - ISA 101 Style */}
                
                {/* Penstock */}
                        <g className="equipment-shadow">
                          <rect x="60" y="140" width="200" height="40" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                          <line x1="60" y1="160" x2="260" y2="160" className="flow-path" 
                                style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                          <foreignObject x="60" y="185" width="200" height="30">
                              <div className="text-center">
                                  <SmartTooltip term="Hoop Stress">
                                      <span className="sensor-label" style={{ fill: '#cbd5e1' }}>PENSTOCK</span>
                                  </SmartTooltip>
                              </div>
                          </foreignObject>
                        </g>
                        
                        {/* Spiral Case */}
                        <g className="equipment-shadow">
                          <path d="M 280 120 Q 380 100 460 140 T 580 180 L 580 220 Q 500 240 420 220 T 280 180 Z" 
                                fill={showThermalOverlay ? "url(#thermalStressGradient)" : "url(#metalGradient)"} stroke={showThermalOverlay ? "#ef4444" : "#2d3748"} strokeWidth="2" />
                          <foreignObject x="330" y="175" width="200" height="30">
                              <div className="text-center">
                                  <SmartTooltip term="Joukowski Surge">
                                      <span className="sensor-label" style={{ fill: '#cbd5e1' }}>SPIRAL CASE</span>
                                  </SmartTooltip>
                              </div>
                          </foreignObject>
                        </g>
                
                {/* Runner Assembly */}
                <g transform="translate(600,300)" className="equipment-shadow">
                  <circle cx="0" cy="0" r="85" fill="url(#turbineGradient)" stroke="#2d3748" strokeWidth="3" />
                  <circle cx="0" cy="0" r="75" fill="none" stroke="#4a5568" strokeWidth="1" />
                  
                  {/* Professional Runner Blades */}
                  {Array.from({ length: 16 }).map((_, i) => (
                    <g key={i} transform={`rotate(${i * 22.5})`}>
                      <path d="M 0,-70 L 8,-60 L 12,-40 L 8,-20 L 0,-15 L -8,-20 L -12,-40 L -8,-60 Z" 
                            fill="#4a5568" stroke="#2d3748" strokeWidth="1" />
                      <line x1="0" y1="-15" x2="0" y2="0" stroke="#2d3748" strokeWidth="2" />
                    </g>
                  ))}
                  
                  {/* Center Hub */}
                  <circle cx="0" cy="0" r="15" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="8" fill="#4a5568" />
                  
                  {/* Rotation Indicator */}
                  <circle cx="0" cy="0" r="90" fill="none" stroke="#10b981" strokeWidth="1" 
                          strokeDasharray="5,5" opacity={rpm > 0 ? 0.8 : 0.3}
                          style={{ animation: rpm > 0 ? `pulseRotate ${Math.max(2, 10 - rpm / 50)}s linear infinite` : 'none' }} />
                  
                  <foreignObject x="-50" y="-15" width="100" height="30">
                    <div className="text-center">
                      <SmartTooltip term="Specific Speed">
                         <span className="sensor-label" style={{ fill: '#cbd5e1', textShadow: '0 0 2px black', fontWeight: 'bold' }}>RUNNER</span>
                      </SmartTooltip>
                    </div>
                  </foreignObject>
                </g>
                
                {/* Draft Tube */}
                <g className="equipment-shadow">
                  <path d="M 560 380 L 540 450 L 660 450 L 640 380 Z" 
                        fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <foreignObject x="540" y="405" width="120" height="30">
                    <div className="text-center">
                      <SmartTooltip term="NPSH">
                        <span className="sensor-label" style={{ fill: '#cbd5e1' }}>DRAFT TUBE</span>
                      </SmartTooltip>
                    </div>
                  </foreignObject>
                </g>

                {/* Sediment Monitor */}
                <g className="equipment-shadow">
                   <rect x="700" y="380" width="100" height="28" rx="4" className="digital-tag" />
                   <foreignObject x="700" y="380" width="100" height="28">
                     <div className="flex items-center justify-center h-full">
                       <SmartTooltip term="Erosion Rate">
                         <span className="sensor-label" style={{ fill: '#fca5a5', fontSize: '10px' }}>EROSION MON</span>
                       </SmartTooltip>
                     </div>
                   </foreignObject>
                </g>

                {/* Generator */}
                <g transform="translate(600,120)" className="equipment-shadow">
                  <rect x="-60" y="-30" width="120" height="60" rx="8" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="25" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="20" fill="none" stroke="#4a5568" strokeWidth="1" />
                  <text x="0" y="5" textAnchor="middle" className="sensor-label" fill="#cbd5e1" fontSize="10">GEN</text>
                </g>
                
                {/* Shaft Connection */}
                <line x1="600" y1="150" x2="600" y2="215" stroke="#2d3748" strokeWidth="8" />
                <line x1="600" y1="385" x2="600" y2="450" stroke="#2d3748" strokeWidth="8" />
                
                {/* Flow Indicators */}
                <path d="M 260 160 L 280 160" className="flow-path" 
                      style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                <path d="M 640 450 L 800 450" className="flow-path" 
                      style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                
                {/* Professional Sensor Tags */}
                <g className="equipment-shadow">
                  <rect x="620" y="50" width="120" height="28" rx="4" className="digital-tag" />
                  <text x="630" y="68" className="sensor-label" fill="#a7f3d0">BEARING {isNaN(Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined))) ? 'N/A' : Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined)).toFixed(1)}°C</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="820" y="430" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="830" y="447" className="sensor-label" fill="#93c5fd">P {pressures.pStaticKpa.toFixed(1)} kPa</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="720" y="250" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="730" y="267" className="sensor-label" fill="#fde68a">V {vibrationTotal.toFixed(2)} mm/s</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="480" y="200" width="140" height="28" rx="4" className="digital-tag" />
                  <text x="490" y="217" className="sensor-label" fill="#7dd3fc">WICKET GATES {gateOpening.toFixed(1)}%</text>
                </g>
                
                {/* Technical Annotations */}
                <g opacity="0.6">
                  <line x1="100" y1="100" x2="100" y2="500" className="technical-line" />
                  <line x1="1100" y1="100" x2="1100" y2="500" className="technical-line" />
                  <text x="50" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">INLET</text>
                  <text x="1150" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">OUTLET</text>
                </g>
              </>
            )}
            {family === 'PELTON' && (
              <>
                {/* Professional Pelton Turbine Schematic - ISA 101 Style */}
                
                {/* Penstock and Nozzle Assembly */}
                <g className="equipment-shadow">
                  <rect x="60" y="140" width="300" height="40" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <text x="210" y="165" textAnchor="middle" className="sensor-label" fill="#cbd5e1">PENSTOCK</text>
                  
                  {/* Nozzles */}
                  {Array.from({ length: Math.max(1, Math.min(6, (variantCfg?.pelton?.nozzleCount ?? cfgStore.getConfig('PELTON')?.pelton?.nozzleCount ?? 2))) }).map((_, i) => (
                    <g key={i} transform={`translate(${380 + i * 80}, 160)`}>
                      <path d="M 0 0 L 40 -15 L 40 15 Z" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                      <circle cx="45" cy="0" r="8" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                      <line x1="40" y1="0" x2="120" y2="0" className="flow-path" 
                            style={{ animation: `dashFlow ${Math.max(0.4, 2 - flowM3s / 40)}s linear infinite` }} />
                    </g>
                  ))}
                </g>
                
                {/* Pelton Runner */}
                <g transform="translate(640,280)" className="equipment-shadow">
                  <circle cx="0" cy="0" r="120" fill="url(#turbineGradient)" stroke="#2d3748" strokeWidth="3" />
                  <circle cx="0" cy="0" r="110" fill="none" stroke="#4a5568" strokeWidth="1" />
                  
                  {/* Professional Pelton Buckets */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <g key={i} transform={`rotate(${i * 18})`}>
                      <path d="M 0,-100 L 15,-85 L 20,-70 L 15,-55 L 0,-50 L -15,-55 L -20,-70 L -15,-85 Z" 
                            fill="#4a5568" stroke="#2d3748" strokeWidth="1" />
                      <line x1="0" y1="-50" x2="0" y2="0" stroke="#2d3748" strokeWidth="2" />
                    </g>
                  ))}
                  
                  {/* Center Hub */}
                  <circle cx="0" cy="0" r="25" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="15" fill="#4a5568" />
                  
                  {/* Rotation Indicator */}
                  <circle cx="0" cy="0" r="130" fill="none" stroke="#10b981" strokeWidth="1" 
                          strokeDasharray="5,5" opacity={rpm > 0 ? 0.8 : 0.3}
                          style={{ animation: rpm > 0 ? `pulseRotate ${Math.max(2, 10 - rpm / 50)}s linear infinite` : 'none' }} />
                </g>
                
                {/* Generator */}
                <g transform="translate(640,120)" className="equipment-shadow">
                  <rect x="-70" y="-35" width="140" height="70" rx="8" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="30" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="25" fill="none" stroke="#4a5568" strokeWidth="1" />
                  <text x="0" y="5" textAnchor="middle" className="sensor-label" fill="#cbd5e1" fontSize="10">GENERATOR</text>
                </g>
                
                {/* Shaft */}
                <line x1="640" y1="155" x2="640" y2="160" stroke="#2d3748" strokeWidth="10" />
                
                {/* Casing and Discharge */}
                <g className="equipment-shadow">
                  <rect x="500" y="420" width="280" height="60" rx="8" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <text x="640" y="455" textAnchor="middle" className="sensor-label" fill="#cbd5e1">CASING/DISCHARGE</text>
                </g>
                
                {/* Professional Sensor Tags */}
                <g className="equipment-shadow">
                  <rect x="720" y="80" width="120" height="28" rx="4" className="digital-tag" />
                  <text x="730" y="97" className="sensor-label" fill="#a7f3d0">BEARING {isNaN(Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined))) ? 'N/A' : Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined)).toFixed(1)}°C</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="920" y="270" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="930" y="287" className="sensor-label" fill="#93c5fd">P {pressures.pStaticKpa.toFixed(1)} kPa</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="520" y="350" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="530" y="367" className="sensor-label" fill="#fde68a">V {vibrationTotal.toFixed(2)} mm/s</text>
                </g>
                
                {/* Technical Annotations */}
                <g opacity="0.6">
                  <line x1="100" y1="100" x2="100" y2="500" className="technical-line" />
                  <line x1="1100" y1="100" x2="1100" y2="500" className="technical-line" />
                  <text x="50" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">INLET</text>
                  <text x="1150" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">OUTLET</text>
                </g>
              </>
            )}
            {family === 'KAPLAN' && (
              <>
                {/* Professional Kaplan Turbine Schematic - ISA 101 Style */}
                
                {/* Inlet Conduit */}
                <g className="equipment-shadow">
                  <rect x="60" y="180" width="200" height="60" rx="8" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <line x1="60" y1="210" x2="260" y2="210" className="flow-path" 
                        style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                  <text x="160" y="245" textAnchor="middle" className="sensor-label" fill="#cbd5e1">INLET CONDUIT</text>
                </g>
                
                {/* Bulb Turbine Assembly */}
                <g transform="translate(600,250)" className="equipment-shadow">
                  <ellipse cx="0" cy="0" rx="120" ry="60" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="3" />
                  <ellipse cx="0" cy="0" rx="110" ry="50" fill="none" stroke="#4a5568" strokeWidth="1" />
                  
                  {/* Kaplan Runner Blades */}
                  {Array.from({ length: (variantCfg?.kaplan?.bladeCount ?? cfgStore.getConfig('KAPLAN')?.kaplan?.bladeCount ?? 4) }).map((_, i) => (
                    <g key={i} transform={`rotate(${i * (360 / (variantCfg?.kaplan?.bladeCount ?? cfgStore.getConfig('KAPLAN')?.kaplan?.bladeCount ?? 4))})`}>
                      <path d="M 0,-50 L 12,-45 L 18,-30 L 15,-15 L 0,-10 L -15,-15 L -18,-30 L -12,-45 Z" 
                            fill="#4a5568" stroke="#2d3748" strokeWidth="1" />
                      <line x1="0" y1="-10" x2="0" y2="0" stroke="#2d3748" strokeWidth="2" />
                    </g>
                  ))}
                  
                  {/* Center Hub */}
                  <circle cx="0" cy="0" r="20" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="12" fill="#4a5568" />
                  
                  {/* Rotation Indicator */}
                  <ellipse cx="0" cy="0" rx="130" ry="70" fill="none" stroke="#10b981" strokeWidth="1" 
                          strokeDasharray="5,5" opacity={rpm > 0 ? 0.8 : 0.3}
                          style={{ animation: rpm > 0 ? `pulseRotate ${Math.max(2, 10 - rpm / 50)}s linear infinite` : 'none' }} />
                </g>
                
                {/* Generator (integrated) */}
                <g transform="translate(600,180)" className="equipment-shadow">
                  <rect x="-80" y="-25" width="160" height="50" rx="8" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="20" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="15" fill="none" stroke="#4a5568" strokeWidth="1" />
                  <text x="0" y="5" textAnchor="middle" className="sensor-label" fill="#cbd5e1" fontSize="10">GEN</text>
                </g>
                
                {/* Adjustable Blades Control */}
                <g className="equipment-shadow">
                  <rect x="750" y="230" width="80" height="40" rx="4" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <text x="790" y="255" textAnchor="middle" className="sensor-label" fill="#cbd5e1" fontSize="10">BLADE CTL</text>
                </g>
                
                {/* Draft Tube */}
                <g className="equipment-shadow">
                  <path d="M 540 310 L 520 400 L 680 400 L 660 310 Z" 
                        fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <text x="600" y="365" textAnchor="middle" className="sensor-label" fill="#cbd5e1">DRAFT TUBE</text>
                </g>
                
                {/* Flow Path */}
                <path d="M 260 210 L 480 210" className="flow-path" 
                      style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                <path d="M 720 250 L 900 250" className="flow-path" 
                      style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                
                {/* Professional Sensor Tags */}
                <g className="equipment-shadow">
                  <rect x="720" y="150" width="120" height="28" rx="4" className="digital-tag" />
                  <text x="730" y="167" className="sensor-label" fill="#a7f3d0">BEARING {isNaN(Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined))) ? 'N/A' : Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined)).toFixed(1)}°C</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="920" y="230" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="930" y="247" className="sensor-label" fill="#93c5fd">P {pressures.pStaticKpa.toFixed(1)} kPa</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="520" y="280" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="530" y="297" className="sensor-label" fill="#fde68a">V {vibrationTotal.toFixed(2)} mm/s</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="840" y="270" width="140" height="28" rx="4" className="digital-tag" />
                  <text x="850" y="287" className="sensor-label" fill="#7dd3fc">BLADE ANGLE {gateOpening.toFixed(1)}°</text>
                </g>
                
                {/* Technical Annotations */}
                <g opacity="0.6">
                  <line x1="100" y1="100" x2="100" y2="500" className="technical-line" />
                  <line x1="1100" y1="100" x2="1100" y2="500" className="technical-line" />
                  <text x="50" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">INLET</text>
                  <text x="1150" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">OUTLET</text>
                </g>
              </>
            )}
            {family === 'BANKI' && (
              <>
                {/* Professional Crossflow (Banki) Turbine Schematic - ISA 101 Style */}
                
                {/* Inlet Pipe */}
                <g className="equipment-shadow">
                  <rect x="60" y="220" width="200" height="40" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <line x1="60" y1="240" x2="260" y2="240" className="flow-path" 
                        style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                  <text x="160" y="265" textAnchor="middle" className="sensor-label" fill="#cbd5e1">INLET PIPE</text>
                </g>
                
                {/* Crossflow Runner */}
                <g transform="translate(600,280)" className="equipment-shadow">
                  <ellipse cx="0" cy="0" rx="140" ry="50" fill="url(#turbineGradient)" stroke="#2d3748" strokeWidth="3" />
                  <ellipse cx="0" cy="0" rx="130" ry="40" fill="none" stroke="#4a5568" strokeWidth="1" />
                  
                  {/* Crossflow Blades */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i * 15) * Math.PI / 180;
                    const x1 = Math.cos(angle) * 120;
                    const y1 = Math.sin(angle) * 35;
                    const x2 = Math.cos(angle) * 100;
                    const y2 = Math.sin(angle) * 30;
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a5568" strokeWidth="3" />
                        <circle cx={x1} cy={y1} r="4" fill="#2d3748" />
                        <circle cx={x2} cy={y2} r="3" fill="#4a5568" />
                      </g>
                    );
                  })}
                  
                  {/* Center Hub */}
                  <circle cx="0" cy="0" r="30" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="20" fill="#4a5568" />
                  
                  {/* Rotation Indicator */}
                  <ellipse cx="0" cy="0" rx="150" ry="60" fill="none" stroke="#10b981" strokeWidth="1" 
                          strokeDasharray="5,5" opacity={rpm > 0 ? 0.8 : 0.3}
                          style={{ animation: rpm > 0 ? `pulseRotate ${Math.max(2, 10 - rpm / 50)}s linear infinite` : 'none' }} />
                </g>
                
                {/* Generator */}
                <g transform="translate(600,180)" className="equipment-shadow">
                  <rect x="-70" y="-30" width="140" height="60" rx="8" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="25" fill="#1a202c" stroke="#2d3748" strokeWidth="2" />
                  <circle cx="0" cy="0" r="20" fill="none" stroke="#4a5568" strokeWidth="1" />
                  <text x="0" y="5" textAnchor="middle" className="sensor-label" fill="#cbd5e1" fontSize="10">GEN</text>
                </g>
                
                {/* Shaft */}
                <line x1="600" y1="210" x2="600" y2="220" stroke="#2d3748" strokeWidth="8" />
                
                {/* Casing */}
                <g className="equipment-shadow">
                  <rect x="420" y="200" width="360" height="160" rx="12" fill="none" stroke="#2d3748" strokeWidth="3" />
                  <rect x="420" y="200" width="360" height="160" rx="12" fill="url(#metalGradient)" opacity="0.3" />
                  <text x="600" y="195" textAnchor="middle" className="sensor-label" fill="#cbd5e1">CASING</text>
                </g>
                
                {/* Discharge */}
                <g className="equipment-shadow">
                  <rect x="780" y="270" width="200" height="40" fill="url(#metalGradient)" stroke="#2d3748" strokeWidth="2" />
                  <text x="880" y="295" textAnchor="middle" className="sensor-label" fill="#cbd5e1">DISCHARGE</text>
                </g>
                
                {/* Flow Path */}
                <path d="M 260 240 L 420 240" className="flow-path" 
                      style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                <path d="M 780 290 L 980 290" className="flow-path" 
                      style={{ animation: `dashFlow ${Math.max(0.5, 3 - flowM3s / 30)}s linear infinite` }} />
                
                {/* Professional Sensor Tags */}
                <g className="equipment-shadow">
                  <rect x="680" y="140" width="120" height="28" rx="4" className="digital-tag" />
                  <text x="690" y="157" className="sensor-label" fill="#a7f3d0">BEARING {isNaN(Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined))) ? 'N/A' : Number((Array.isArray(telemetryHistory?.bearingTemp) ? telemetryHistory.bearingTemp.slice(-1)[0]?.value : undefined)).toFixed(1)}°C</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="1000" y="270" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="1010" y="287" className="sensor-label" fill="#93c5fd">P {pressures.pStaticKpa.toFixed(1)} kPa</text>
                </g>
                
                <g className="equipment-shadow">
                  <rect x="480" y="340" width="100" height="28" rx="4" className="digital-tag" />
                  <text x="490" y="357" className="sensor-label" fill="#fde68a">V {vibrationTotal.toFixed(2)} mm/s</text>
                </g>
                
                {/* Technical Annotations */}
                <g opacity="0.6">
                  <line x1="100" y1="100" x2="100" y2="500" className="technical-line" />
                  <line x1="1100" y1="100" x2="1100" y2="500" className="technical-line" />
                  <text x="50" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">INLET</text>
                  <text x="1150" y="300" textAnchor="middle" className="sensor-label" fontSize="10" fill="#718096">OUTLET</text>
                </g>
              </>
            )}
          </svg>
        </div>

        {starting && (
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2">Grid Synchroscope</div>
            <div className="relative w-36 h-36 rounded-full border-4 border-slate-600 bg-slate-800 shadow-inner">
              <div className="absolute inset-3 rounded-full border-2 border-slate-700" />
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute w-0.5 h-4 bg-slate-600 left-1/2 top-0 origin-bottom" style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }} />
              ))}
              <div className="absolute left-1/2 top-1/2 w-0.5 h-14 bg-emerald-400 origin-bottom shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ transform: `translate(-50%, -100%) rotate(0deg)` }} />
              <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono uppercase">Starting</div>
            </div>
          </div>
        )}

        {hotspot && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-[520px] bg-slate-900 border border-slate-700 rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">{hotspot.label} Control Overlay</div>
                <button className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700" onClick={() => setHotspot(null)}>Close</button>
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700"
                    onClick={() => {
                      toggleCommanderMode?.();
                      toggleInvestigation?.(hotspot.key);
                      EventLogger.log('MANUAL_OVERRIDE', hotspot.key, lastVerifiedValue.value, 'OVERRIDE');
                      pushAlarm?.({ id: `OVRD_${Date.now()}`, severity: 'WARNING', message: `Manual override on ${hotspot.label}` });
                    }}
                  >
                    Manual Override
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700"
                    onClick={() => selectDiagnostic?.(`DX_${hotspot.key}`)}
                  >
                    Diagnostic View
                  </button>
                  <div className="text-[10px] text-slate-400 font-mono ml-auto">
                    Commander Mode: {isCommanderMode ? 'ON' : 'OFF'}
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-300 mb-2">
                  Last Verified Value: {lastVerifiedValue.value !== null ? lastVerifiedValue.value.toFixed(2) : 'N/A'}
                </div>
                {sparkData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={sparkData}>
                      <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                      <XAxis dataKey="x" hide />
                      <YAxis tick={{ fill: '#cbd5e1', fontSize: 10 }} stroke="#334155" />
                      <Tooltip />
                      <Line type="monotone" dataKey="y" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    No telemetry available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-4 bg-[#0c0c0c] border border-[#222222] rounded-xl p-6 space-y-6">
        <div>
          <div className="text-[10px] text-slate-300 uppercase font-mono tracking-widest mb-2">Project Parameters</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <div className="text-[10px] text-slate-400 font-mono mb-1">Rated Head (Hₙ)</div>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 text-slate-200 text-xs font-mono"
                  type="number"
                  value={Number(cfgStore.getConfig(family)?.ratedHeadHn ?? 0)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (family === 'KAPLAN' && v > 100) {
                      pushAlarm?.({ id: `HEAD_INPUT_${Date.now()}`, severity: 'WARN', message: 'Blocked: Kaplan head cannot exceed 100 m' });
                      return;
                    }
                    cfgStore.setConfig(family as any, { ratedHeadHn: v });
                  }}
                />
                <div className="px-2 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded text-[10px] font-mono text-slate-400">m</div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] text-slate-400 font-mono mb-1">Rated Flow (Qₙ)</div>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 text-slate-200 text-xs font-mono"
                  type="number"
                  value={Number(cfgStore.getConfig(family)?.ratedFlowQn ?? 0)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    cfgStore.setConfig(family as any, { ratedFlowQn: v });
                    const etaChk = computeEfficiencyFromHillChart(family as any, cfgStore.getConfig(family as any)?.ratedHeadHn ?? 0, v);
                    if (etaChk > 0.98) {
                      pushAlarm?.({ id: `ETA_INPUT_${Date.now()}`, severity: 'WARN', message: 'Design Conflict: Efficiency exceeds 98%' });
                    }
                  }}
                />
                <div className="px-2 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded text-[10px] font-mono text-slate-400">m³/s</div>
              </div>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded">
                <div className="text-[10px] text-slate-400 font-mono mb-1">Static Head</div>
                <div className="text-sm font-black text-white">{headM.toFixed(1)}</div>
              </div>
              <div className="p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded">
                <div className="text-[10px] text-slate-400 font-mono mb-1">Flow</div>
                <div className="text-sm font-black text-white">{flowM3s.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Controls</div>
          <div className="flex items-center gap-2">
            <button
              className={`text-xs px-3 py-2 rounded border ${blockedStart ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-700 border-emerald-600 text-white'}`}
              disabled={blockedStart}
              onClick={() => {
                EventLogger.log('START', null, null, 'INITIATED');
                pushAlarm?.({ id: `CMD_${Date.now()}`, severity: 'INFO', message: 'Start Sequence initiated' });
              }}
            >
              Start Sequence
            </button>
            {interlock.tripActive && (
              <div className="flex items-center text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {interlock.tripReason}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2">Analog Tachometer</div>
          <div className="relative w-56 h-56 rounded-full border-4 border-slate-700 bg-slate-800 mx-auto">
            <div className="absolute inset-3 rounded-full border-2 border-slate-700" />
            <div className="absolute left-1/2 top-1/2 w-0.5 h-24 bg-cyan-400 origin-bottom shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ transform: `translate(-50%, -100%) rotate(${gauge.angle}deg)` }} />
            <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300" />
            <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path d={`M20,100 A80,80 0 0,1 180,100`} stroke="#ef4444" strokeWidth="8" fill="none" />
                <path d={`M${20 + (gauge.redStart > 0 ? 0 : 0)},100 A80,80 0 0,1 180,100`} stroke="#ef4444" strokeWidth="8" fill="none" opacity="0.2" />
              </svg>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[12px] font-mono text-slate-300">RPM {rpm.toFixed(0)} / {gauge.maxRpm}</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2">Manometer</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-xs font-mono text-slate-300 mb-1">Hoop Stress</div>
              <div className="text-2xl font-black text-white">{hoopStress !== null ? hoopStress.toFixed(2) : 'N/A'} MPa</div>
              <div className="mt-2 h-24 bg-slate-800 rounded relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-500" style={{ height: `${Math.max(5, Math.min(100, hoopStress !== null ? hoopStress / 10 : 0))}%` }} />
              </div>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-xs font-mono text-slate-300 mb-1">P_static</div>
              <div className="text-2xl font-black text-white">{pressures.pStaticKpa.toFixed(1)}<span className="text-xs text-slate-400 ml-1">kPa</span></div>
              <div className="mt-2 h-24 bg-slate-800 rounded relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-500" style={{ height: `${Math.max(5, Math.min(100, pressures.pStaticKpa / (family === 'PELTON' ? 30 : 10)))}%` }} />
              </div>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-xs font-mono text-slate-300 mb-1">P_dynamic</div>
              <div className="text-2xl font-black text-white">{pressures.pDynamicKpa.toFixed(1)}<span className="text-xs text-slate-400 ml-1">kPa</span></div>
              <div className="mt-2 h-24 bg-slate-800 rounded relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-cyan-500" style={{ height: `${Math.max(5, Math.min(100, pressures.pDynamicKpa / (family === 'PELTON' ? 15 : 5)))}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2">Lubrication System</div>
          <LubeStatus />
        </div>
      </div>
      {/* Alarm banner */}
      <div className="col-span-12">
        <div className="fixed bottom-0 left-0 right-0">
          <div className="mx-6 mb-4 bg-slate-900/95 border border-slate-700 rounded-xl">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Alarms</span>
                <span className={`w-2 h-2 rounded-full ${activeAlarms?.length ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              </div>
              <button className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700" onClick={() => { EventLogger.log('ACKNOWLEDGE', null, null, 'ALL'); acknowledgeAllAlarms?.(); }}>Acknowledge All</button>
            </div>
            <div className="px-4 pb-3 space-y-1">
              {(activeAlarms ?? []).slice(-5).map((a: any) => (
                <div key={a.id} className={`text-xs font-mono ${a.severity === 'CRITICAL' ? 'text-red-400' : a.severity === 'WARNING' ? 'text-amber-300' : 'text-slate-300'}`}>
                  [{a.severity}] {a.message}
                </div>
              ))}
            </div>
          </div>
          <HistorianPanel />
        </div>
      </div>
    </div>
  );
};

export default ScadaCore;

const HistorianPanel: React.FC = () => {
  const { sessionLedger } = useTelemetryStore() as any;
  const [open, setOpen] = useState(false);
  return (
    <div className={`mx-6 mb-4 ${open ? 'translate-y-0' : 'translate-y-24'} transition-transform`}>
      <div className="bg-slate-900/95 border border-slate-700 rounded-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Event Historian</span>
          </div>
          <button className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</button>
        </div>
        {open && (
          <div className="px-4 pb-3 space-y-1 max-h-48 overflow-y-auto">
            {(sessionLedger ?? []).slice(-20).reverse().map((e: any, i: number) => (
              <div key={`${e.hash}-${i}`} className="text-xs font-mono text-slate-300">
                [{new Date(e.timestamp).toLocaleTimeString()}] {e.action} {e.componentId ?? '-'} {String(e.previousValue ?? '')} → {String(e.newValue ?? '')} #{e.hash}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
