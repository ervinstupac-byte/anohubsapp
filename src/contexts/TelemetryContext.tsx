import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAssetContext } from './AssetContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { loggingService } from '../services/LoggingService.ts';
import { SentinelKernel } from '../services/SentinelKernel.ts';
import { DEFAULT_TECHNICAL_STATE } from '../core/TechnicalSchema';
import ProjectStateManager from './ProjectStateContext';
import { EventJournal } from '../services/EventJournal';
import { ENABLE_REAL_TELEMETRY } from '../config/featureFlags';
import { SYSTEM_CONSTANTS } from '../config/SystemConstants';
import { useNotifications } from './NotificationContext.tsx';
import idAdapter from '../utils/idAdapter';
import { HppStatusSchema } from '../schemas/supabase';

// Tipovi za telemetriju
export interface TelemetryData {
    assetId: string | number; // Support BigInt as string
    timestamp: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    vibration: number; // mm/s
    temperature: number; // °C
    efficiency: number; // %
    output: number; // MW
    incidentDetails?: string;
    // Structural Integrity Sensors
    piezometricPressure: number; // bar
    seepageRate: number; // l/min
    reservoirLevel: number; // m
    foundationDisplacement: number; // um/m
    wicketGatePosition: number; // %
    tailwaterLevel: number; // m
    // Hydraulic Change Management
    cylinderPressure: number; // bar
    actuatorPosition: number; // %
    oilPressureRate: number; // bar/s
    hoseTension: number; // kN
    pipeDiameter: number; // mm
    safetyValveActive: boolean;
    // Fluid Contamination & Pulsation
    oilReservoirLevel: number; // %
    rotorHeadVibration: number; // mm/s
    // Field-Incident Safeguard
    pumpFlowRate: number; // l/s
    excitationActive: boolean;
    vibrationSpectrum: number[]; // Frequency magnitudes
    // Sealing Integrity
    drainagePumpActive: boolean;
    drainagePumpFrequency: number; // activations/day
    // System Response Analytics
    wicketGateSetpoint: number; // %
    lastCommandTimestamp: number;
    fatiguePoints: number; // Fatigue accumulation
    // Advanced Machine Protection
    vibrationPhase: number; // deg (0-360)
    oilViscosity: number; // cSt
    bearingLoad: number; // kN
    statorTemperatures: number[]; // Zone temperatures [T1, T2, T3, T4, T5, T6]
    actualBladePosition: number; // % (Feedback from hub mechanism)
    bypassValveActive: boolean;
    hydrostaticLiftActive: boolean;
    // Radial Force & Oil Degradation
    shaftSag: number; // mm
    responseTimeIndex: number; // 0-1 (higher = slower/degraded)
    // Advanced Forensics & Orbit
    proximityX: number; // um
    proximityY: number; // um
    excitationCurrent: number; // A
    rotorEccentricity: number; // mm
    cavitationIntensity: number; // 0-10
    bearingGrindIndex: number; // 0-10
    acousticBaselineMatch: number; // 0-1 (1 = perfect match)
    ultrasonicLeakIndex: number; // 0-10 (high-frequency hiss)
}

interface TelemetryContextType {
    telemetry: Record<string, TelemetryData>;
    activeIncident: { type: string, assetId: number, timestamp: number } | null;
    triggerEmergency: (assetId: number, type: 'vibration_excess' | 'bearing_overheat' | 'hydraulic_interlock' | 'mechanical_blockage' | 'metal_scraping' | 'grid_frequency_critical') => void;
    clearEmergency: () => void;
    forceUpdate: () => void;
    updatePipeDiameter: (assetId: number, diameter: number) => void;
    shutdownExcitation: (assetId: number) => void;
    updateWicketGateSetpoint: (assetId: number, setpoint: number) => void;
    resetFatigue: (assetId: number) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { assets } = useAssetContext();
    const [telemetry, setTelemetry] = useState<Record<string, TelemetryData>>({});
    const [activeIncident, setActiveIncident] = useState<{ type: string, assetId: number, timestamp: number } | null>(null);

    const triggerEmergency = (assetId: number, type: 'vibration_excess' | 'bearing_overheat' | 'hydraulic_interlock' | 'mechanical_blockage' | 'metal_scraping' | 'grid_frequency_critical') => {
        const timestamp = Date.now();
        setActiveIncident({ type, assetId, timestamp });

        setTelemetry(prev => {
            const key = idAdapter.toStorage(assetId);
            const prevTele = prev[key] as TelemetryData | undefined;
            return {
                ...prev,
                [key]: {
                    assetId: assetId,
                    timestamp,
                    status: 'CRITICAL',
                    vibration: type === 'vibration_excess' ? 0.085 : 0.035,
                    temperature: type === 'bearing_overheat' ? 85 : 55,
                    efficiency: prevTele?.efficiency || 45,
                    output: (prevTele?.output || 10) * 0.3,
                    incidentDetails: type === 'vibration_excess' ? 'Deviation: 0.085 mm/m - Standard Violated' : (type === 'metal_scraping' ? 'Acoustic Signature: Metal-on-Metal detected' : 'Critical Bearing Temperature: 85°C'),
                    piezometricPressure: prevTele?.piezometricPressure || 4.2,
                    seepageRate: prevTele?.seepageRate || 12.5,
                    reservoirLevel: prevTele?.reservoirLevel || 122.5,
                    foundationDisplacement: type === 'vibration_excess' ? 0.35 : (prevTele?.foundationDisplacement || 0.05),
                    wicketGatePosition: 95,
                    tailwaterLevel: prevTele?.tailwaterLevel || 105.2,
                    cylinderPressure: type === 'hydraulic_interlock' ? 180 : 45,
                    actuatorPosition: prevTele?.actuatorPosition || 45,
                    oilPressureRate: type === 'hydraulic_interlock' ? 25 : 1.2,
                    hoseTension: type === 'hydraulic_interlock' ? 450 : 25,
                    pipeDiameter: prevTele?.pipeDiameter || 12,
                    safetyValveActive: type === 'hydraulic_interlock',
                    oilReservoirLevel: prevTele?.oilReservoirLevel || 85,
                    rotorHeadVibration: type === 'hydraulic_interlock' ? 12.5 : (prevTele?.rotorHeadVibration || 0.5),
                    pumpFlowRate: type === 'hydraulic_interlock' ? 50 : 5,
                    excitationActive: type !== 'metal_scraping',
                    vibrationSpectrum: type === 'metal_scraping' ? [0.1, 0.8, 0.2, 0.9, 0.1] : [0.1, 0.1, 0.1, 0.1, 0.1],
                    drainagePumpActive: type === 'hydraulic_interlock',
                    drainagePumpFrequency: type === 'hydraulic_interlock' ? 45 : 12,
                    wicketGateSetpoint: prevTele?.wicketGateSetpoint || 95,
                    lastCommandTimestamp: prevTele?.lastCommandTimestamp || Date.now(),
                    fatiguePoints: (prevTele?.fatiguePoints || 0) + (type === 'vibration_excess' ? 5 : 2),
                    vibrationPhase: type === 'vibration_excess' ? 45 : 12,
                    oilViscosity: prevTele?.oilViscosity || 46,
                    bearingLoad: type === 'bearing_overheat' ? 1200 : 850,
                    statorTemperatures: type === 'bearing_overheat' ? [85, 88, 110, 87, 86, 89] : [55, 56, 54, 55, 57, 56],
                    actualBladePosition: 92,
                    bypassValveActive: type === 'hydraulic_interlock',
                    hydrostaticLiftActive: type === 'bearing_overheat',
                    shaftSag: type === 'vibration_excess' ? 0.025 : 0.005,
                    responseTimeIndex: type === 'hydraulic_interlock' ? 0.8 : 0.2,
                    proximityX: type === 'vibration_excess' ? 50 : 5,
                    proximityY: type === 'vibration_excess' ? 80 : 5,
                    excitationCurrent: 450,
                    rotorEccentricity: 0.22,
                    cavitationIntensity: type === 'vibration_excess' ? 8.5 : 1.2,
                    bearingGrindIndex: type === 'bearing_overheat' ? 7.2 : 0.5,
                    acousticBaselineMatch: type === 'metal_scraping' ? 0.3 : 0.98,
                    ultrasonicLeakIndex: type === 'hydraulic_interlock' ? 8.2 : 0.2
                }
            };
        });

        loggingService.logIncident(assetId, type, {
            vibration: type === 'vibration_excess' ? 0.085 : 0.035,
            temperature: type === 'bearing_overheat' ? 85 : 55
        });
    };

    const clearEmergency = () => {
        if (activeIncident) {
            loggingService.logReset(activeIncident.assetId);
        }
        setActiveIncident(null);
        generateSignal();
    };

    useEffect(() => {
        if (!supabase || typeof (supabase as any).channel !== 'function') {
            // No realtime in build/CI environment — simulate signals instead
            generateSignal();
            const id = setInterval(generateSignal, 10000);
            return () => clearInterval(id);
        }

        const channel = (supabase as any)
            .channel('realtime_hpp_status')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'hpp_status' },
                (payload: any) => {
                    const updatedData = payload.new as any;
                    if (updatedData && updatedData.asset_id) {
                        // Validate realtime payload shape using Zod
                        const parsed = HppStatusSchema.safeParse(updatedData);
                        if (!parsed.success) {
                            try {
                                loggingService.logEvent({ assetId: null, eventType: 'STRESS_TEST', severity: 'WARNING', details: { message: 'hpp_status validation failed', error: parsed.error } });
                            } catch (e) { /* swallow */ }
                        }
                        const u: any = parsed.success ? parsed.data : updatedData;
                        // REVERT to String/BigInt safe handling (NC-11.3)
                        const rawId = u.asset_id; // Keep as string/number/BigInt
                        const storageKey = idAdapter.toStorage(rawId);
                        setTelemetry(prev => ({
                            ...prev,
                            [storageKey]: {
                                assetId: rawId,
                                timestamp: Date.now(),
                                status: u.status || 'OPTIMAL',
                                vibration: u.vibration || 0.02,
                                temperature: u.temperature || 50,
                                efficiency: u.efficiency || 92,
                                output: u.output || 0,
                                piezometricPressure: u.piezometric_pressure || 4.2,
                                seepageRate: u.seepage_rate || 12.5,
                                reservoirLevel: u.reservoir_level || 122.5,
                                foundationDisplacement: u.foundation_displacement || 0.05,
                                wicketGatePosition: u.wicket_gate_position || 45,
                                tailwaterLevel: u.tailwater_level || 105.2,
                                cylinderPressure: u.cylinder_pressure || 45,
                                actuatorPosition: u.actuator_position || 45,
                                oilPressureRate: u.oil_pressure_rate || 1.2,
                                hoseTension: u.hose_tension || 25,
                                pipeDiameter: u.pipe_diameter || 12,
                                safetyValveActive: u.safety_valve_active || false,
                                oilReservoirLevel: u.oil_reservoir_level || 85,
                                rotorHeadVibration: u.rotor_head_vibration || 0.5,
                                pumpFlowRate: u.pump_flow_rate || 5,
                                excitationActive: u.excitation_active !== undefined ? u.excitation_active : true,
                                vibrationSpectrum: u.vibration_spectrum || [0, 0, 0, 0, 0],
                                drainagePumpActive: u.drainage_pump_active || false,
                                drainagePumpFrequency: u.drainage_pump_frequency || 12,
                                wicketGateSetpoint: u.wicket_gate_setpoint || 45,
                                lastCommandTimestamp: u.last_command_timestamp || Date.now(),
                                fatiguePoints: u.fatigue_points || 0,
                                vibrationPhase: u.vibration_phase || 12,
                                oilViscosity: u.oil_viscosity || 46,
                                bearingLoad: u.bearing_load || 850,
                                statorTemperatures: u.stator_temperatures || [55, 55, 55, 55, 55, 55],
                                actualBladePosition: u.actual_blade_position || 45,
                                bypassValveActive: u.bypass_valve_active || false,
                                hydrostaticLiftActive: u.hydrostatic_lift_active || false,
                                shaftSag: u.shaft_sag || 0,
                                responseTimeIndex: u.response_time_index || 0.1,
                                proximityX: u.proximity_x || 0,
                                proximityY: u.proximity_y || 0,
                                excitationCurrent: u.excitation_current || 450,
                                rotorEccentricity: u.rotor_eccentricity || 0.15,
                                cavitationIntensity: u.cavitation_intensity || 1.1,
                                bearingGrindIndex: u.bearing_grind_index || 0.4,
                                acousticBaselineMatch: u.acoustic_baseline_match || 0.99,
                                ultrasonicLeakIndex: u.ultrasonic_leak_index || 0.3
                            }
                        }));
                        // non-blocking journal append for each incoming sample
                        try {
                            const journalPayload = { assetId: rawId, ts: Date.now(), data: updatedData };
                            setTimeout(() => {
                                try { EventJournal.append('TELEMETRY_INGEST', journalPayload); } catch (e) { /* swallow */ }
                            }, 0);
                        } catch (e) { /* swallow */ }
                    }
                }
            )
            .subscribe();

        return () => {
            try { (supabase as any).removeChannel(channel); } catch (e) { }
        };
    }, [supabase]);

    const generateSignal = () => {
        // Deterministic telemetry generation when feature flag is enabled
        const newTelemetry: Record<string, TelemetryData> = {};
        assets.forEach(asset => {
            const storageKey = idAdapter.toStorage(asset.id);

            if (ENABLE_REAL_TELEMETRY) {
                // Build a minimal TechnicalProjectState for physics calc
                const baseState: any = {
                    ...DEFAULT_TECHNICAL_STATE,
                    identity: { ...DEFAULT_TECHNICAL_STATE.identity, assetId: asset.id, assetName: asset.name },
                    hydraulic: {
                        ...DEFAULT_TECHNICAL_STATE.hydraulic,
                        flow: (asset.capacity && asset.capacity > 0) ? asset.capacity : (DEFAULT_TECHNICAL_STATE.hydraulic.flow || 42.5),
                        head: asset.specs?.designHead || (DEFAULT_TECHNICAL_STATE.hydraulic.head || 152)
                    },
                    mechanical: {
                        ...DEFAULT_TECHNICAL_STATE.mechanical,
                        rpm: asset.specs?.ratedSpeed || 500,
                        vibrationX: asset.status === 'Critical' ? 0.08 : 0.02,
                        vibrationY: 0.01
                    },
                    penstock: { ...DEFAULT_TECHNICAL_STATE.penstock }
                };

                // Build deterministic telemetry signals without running the full PhysicsEngine here.
                // ProjectStateManager is now responsible for mapping telemetry -> TechnicalProjectState and for running PhysicsEngine to enrich the canonical state.
                const vibBase = (baseState.mechanical?.vibrationX || 0.02);
                const bladeCount = asset.specs?.bladeCount || 13;
                const f0 = (baseState.mechanical?.rpm || 500) / 60;
                const spectrum = [0, 0, 0, 0, 0].map((_, i) => {
                    const f = (i + 1) * 10;
                    const mech = vibBase * 12 * Math.exp(-Math.pow(f - f0, 2) / 4);
                    const hyd = vibBase * 8 * Math.exp(-Math.pow(f - (f0 * bladeCount), 2) / 4);
                    return parseFloat((mech + hyd).toFixed(4));
                });

                newTelemetry[storageKey] = {
                    assetId: asset.id,
                    timestamp: Date.now(),
                    status: 'OPTIMAL',
                    vibration: Number(vibBase),
                    temperature: baseState.mechanical?.bearingTemp || 55,
                    // Telemetry exposes measured efficiency as percent when available. Do not compute physics-derived efficiency here.
                    efficiency: (baseState.hydraulic?.efficiency && typeof (baseState.hydraulic as any).efficiency === 'number') ? Math.round((baseState.hydraulic as any).efficiency * 100) : 92,
                    output: asset.capacity ? parseFloat(((asset.capacity as number) * ((baseState.hydraulic as any).efficiency || 0.92)).toFixed(2)) : 0,
                    piezometricPressure: parseFloat((4.2).toFixed(2)),
                    seepageRate: 0,
                    reservoirLevel: baseState.site?.reservoirLevel || 122.5,
                    foundationDisplacement: 0,
                    wicketGatePosition: baseState.mechanical?.wicketGatePosition || 45,
                    tailwaterLevel: baseState.site?.tailwaterLevel || 105.2,
                    cylinderPressure: baseState.mechanical?.cylinderPressure || 45,
                    actuatorPosition: baseState.mechanical?.actuatorPosition || 45,
                    oilPressureRate: 1.2,
                    hoseTension: 25,
                    pipeDiameter: baseState.penstock?.diameter || 12,
                    safetyValveActive: false,
                    oilReservoirLevel: 85,
                    rotorHeadVibration: vibBase,
                    pumpFlowRate: baseState.hydraulic?.flow || 5,
                    excitationActive: true,
                    vibrationSpectrum: spectrum,
                    drainagePumpActive: false,
                    drainagePumpFrequency: 12,
                    wicketGateSetpoint: baseState.mechanical?.wicketGateSetpoint || 45,
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
                    acousticBaselineMatch: 1,
                    ultrasonicLeakIndex: 0
                } as TelemetryData;
            } else {
                // Legacy demo/randomized telemetry (kept for backward compatibility)
                const baseVibration = asset.status === 'Critical' ? 0.08 : 0.02;
                const vibration = parseFloat((baseVibration + (Math.random() * 0.02)).toFixed(3));
                const temp = Math.floor(45 + Math.random() * 15);
                const eff = Math.floor(90 + Math.random() * 5);
                let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
                if (vibration > 0.05) status = 'CRITICAL';
                else if (vibration > 0.04) status = 'WARNING';

                const currentTele = telemetry[storageKey];

                newTelemetry[storageKey] = {
                    assetId: asset.id,
                    timestamp: Date.now(),
                    status,
                    vibration: (() => {
                        const baseVib = parseFloat((baseVibration + (Math.random() * 0.02)).toFixed(3));
                        const excitation = currentTele?.excitationCurrent || 450;
                        const eccentricity = currentTele?.rotorEccentricity || 0.15;
                        const magneticVibration = (excitation > 400 && eccentricity > 0.1) ? 0.04 : 0;
                        return parseFloat((baseVib + magneticVibration).toFixed(3));
                    })(),
                    temperature: temp,
                    efficiency: eff,
                    output: asset.capacity ? parseFloat((asset.capacity * (eff / 100)).toFixed(1)) : 0,
                    piezometricPressure: parseFloat((4.2 + (Math.random() * 0.4)).toFixed(2)),
                    seepageRate: parseFloat((12.5 + (Math.random() * 2)).toFixed(1)),
                    reservoirLevel: parseFloat((122.5 + (Math.random() * 0.5)).toFixed(1)),
                    foundationDisplacement: parseFloat((0.05 + (Math.random() * 0.05)).toFixed(3)),
                    wicketGateSetpoint: currentTele?.wicketGateSetpoint || 45,
                    wicketGatePosition: (() => {
                        const setpoint = currentTele?.wicketGateSetpoint || 45;
                        const current = currentTele?.wicketGatePosition || 45;
                        if (Math.abs(setpoint - current) < 0.1) return setpoint;
                        const lagFactor = asset.status === 'Critical' ? 0.02 : 0.05;
                        return parseFloat((current + (setpoint - current) * lagFactor).toFixed(2));
                    })(),
                    lastCommandTimestamp: currentTele?.lastCommandTimestamp || Date.now(),
                    tailwaterLevel: parseFloat((105.2 + (Math.random() * 0.3)).toFixed(2)),
                    cylinderPressure: parseFloat((40 + (Math.random() * 10)).toFixed(1)),
                    actuatorPosition: (() => {
                        const basePos = parseFloat((45 + (Math.random() * 5)).toFixed(1));
                        return basePos;
                    })(),
                    oilPressureRate: parseFloat((1.0 + (Math.random() * 0.5)).toFixed(2)),
                    hoseTension: parseFloat((20 + (Math.random() * 10)).toFixed(1)),
                    pipeDiameter: currentTele?.pipeDiameter || 12,
                    safetyValveActive: false,
                    oilReservoirLevel: parseFloat((85 + (Math.random() * 0.5)).toFixed(1)),
                    rotorHeadVibration: parseFloat((0.5 + (Math.random() * 0.2)).toFixed(2)),
                    pumpFlowRate: parseFloat((5 + (Math.random() * 2)).toFixed(1)),
                    excitationActive: currentTele?.excitationActive !== undefined ? currentTele.excitationActive : true,
                    vibrationSpectrum: [Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2],
                    drainagePumpActive: Math.random() > 0.8,
                    drainagePumpFrequency: parseFloat((10 + (Math.random() * 5)).toFixed(1)),
                    fatiguePoints: (() => {
                        const currentPoints = currentTele?.fatiguePoints || 0;
                        const pressureRate = parseFloat((1.0 + (Math.random() * 5.5)).toFixed(2));
                        if (pressureRate > 5) return currentPoints + 0.5;
                        return currentPoints;
                    })(),
                    vibrationPhase: parseFloat((12 + (Math.random() * 2)).toFixed(1)),
                    oilViscosity: parseFloat((46 + (Math.random() * 2)).toFixed(1)),
                    bearingLoad: parseFloat((850 + (Math.random() * 50)).toFixed(1)),
                    statorTemperatures: [
                        parseFloat((55 + (Math.random() * 5)).toFixed(1)),
                        parseFloat((55 + (Math.random() * 5)).toFixed(1)),
                        parseFloat((55 + (Math.random() * 5)).toFixed(1)),
                        parseFloat((55 + (Math.random() * 30)).toFixed(1)),
                        parseFloat((55 + (Math.random() * 5)).toFixed(1)),
                        parseFloat((55 + (Math.random() * 5)).toFixed(1))
                    ],
                    actualBladePosition: (() => {
                        const currentActPos = parseFloat((45 + (Math.random() * 5)).toFixed(1));
                        return parseFloat((currentActPos - (Math.random() * 2.5)).toFixed(1));
                    })(),
                    bypassValveActive: currentTele?.oilPressureRate ? currentTele.oilPressureRate > 5.5 : false,
                    hydrostaticLiftActive: (currentTele?.temperature || 55) > 75,
                    shaftSag: parseFloat((0.005 + (vibration / 10) + (Math.random() * 0.005)).toFixed(4)),
                    responseTimeIndex: (() => {
                        const oilTemp = temp;
                        const baseLag = 0.1;
                        const degradation = asset.status === 'Critical' ? 0.4 : 0.05;
                        const tempFactor = (70 - oilTemp) / 100;
                        return Math.max(0, parseFloat((baseLag + tempFactor + degradation + (Math.random() * 0.1)).toFixed(2)));
                    })(),
                    proximityX: (() => {
                        const time = Date.now() * 0.001;
                        const r = 5 + (vibration * 100);
                        return parseFloat((r * Math.cos(time) + (Math.random() * 2)).toFixed(2));
                    })(),
                    proximityY: (() => {
                        const time = Date.now() * 0.001;
                        const rhy = 5 + (vibration * 150);
                        return parseFloat((rhy * Math.sin(time) + (Math.random() * 2)).toFixed(2));
                    })(),
                    excitationCurrent: parseFloat((450 + (Math.random() * 20)).toFixed(1)),
                    rotorEccentricity: parseFloat((0.15 + (Math.random() * 0.05)).toFixed(2)),
                    cavitationIntensity: parseFloat((1.0 + (asset.status === 'Warning' ? 3.0 : asset.status === 'Critical' ? 6.5 : 0.5) + (Math.random() * 1.5)).toFixed(1)),
                    bearingGrindIndex: parseFloat((0.4 + (asset.status === 'Critical' ? 4.5 : 0) + (Math.random() * 0.5)).toFixed(1)),
                    acousticBaselineMatch: parseFloat((0.95 - (asset.status !== 'Operational' ? 0.2 : 0) + (Math.random() * 0.05)).toFixed(2)),
                    ultrasonicLeakIndex: parseFloat((0.2 + (asset.status === 'Warning' ? 2.5 : asset.status === 'Critical' ? 5.2 : 0) + (Math.random() * 1.5)).toFixed(1))
                } as TelemetryData;
            }
        });
        setTelemetry(prev => ({ ...prev, ...newTelemetry }));
        // Batch non-blocking journal appends for generated telemetry
        try {
            Object.keys(newTelemetry).forEach(k => {
                const t = (newTelemetry as any)[k];
                setTimeout(() => {
                    try { EventJournal.append('TELEMETRY_INGEST', { assetId: t.assetId, ts: t.timestamp || Date.now(), payload: t }); } catch (e) { }
                }, 0);
            });
        } catch (e) { }
    };

    useEffect(() => {
        if (assets.length > 0) {
            generateSignal();
        }
    }, [assets]);

    const updatePipeDiameter = (assetId: number, diameter: number) => {
        // Route canonical penstock diameter change through ProjectStateManager
        try {
            ProjectStateManager.setState({ penstock: { diameter } } as any);
            loggingService.logAction(assetId, 'PIPE_DIAMETER_CHANGE', { newDiameter: diameter });
        } catch (e) {
            // Fallback to local telemetry change if manager unavailable
            const key = idAdapter.toStorage(assetId);
            setTelemetry(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    pipeDiameter: diameter
                }
            }));
        }
    };

    const shutdownExcitation = (assetId: number) => {
        // Preferred: update ProjectState canonical flags via ProjectStateManager
        try {
            ProjectStateManager.setState({ specializedState: { sensors: { excitationActive: false } } as any });
            loggingService.logAction(assetId, 'EXCITATION_SHUTDOWN', { cause: 'METAL_SCRAPING_DETECTED' });
        } catch (e) {
            const key = idAdapter.toStorage(assetId);
            setTelemetry(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    excitationActive: false
                }
            }));
            loggingService.logAction(assetId, 'EXCITATION_SHUTDOWN', { cause: 'METAL_SCRAPING_DETECTED (fallback)' });
        }
    };

    const updateWicketGateSetpoint = (assetId: number, setpoint: number) => {
        try {
            // Represent as specializedState.sensor wicket gate setpoint in canonical state
            ProjectStateManager.setState({ specializedState: { sensors: { wicketGateSetpoint: setpoint } } as any });
            loggingService.logAction(assetId, 'WICKET_GATE_COMMAND', { setpoint });
        } catch (e) {
            const key = idAdapter.toStorage(assetId);
            setTelemetry(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    wicketGateSetpoint: setpoint,
                    lastCommandTimestamp: Date.now()
                }
            }));
            loggingService.logAction(assetId, 'WICKET_GATE_COMMAND', { setpoint, fallback: true });
        }
    };

    const resetFatigue = (assetId: number) => {
        try {
            ProjectStateManager.setState({ specializedState: { sensors: { fatiguePoints: 0 } } as any });
            loggingService.logAction(assetId, 'FATIGUE_RESET', { cause: 'NDT_COMPLETED' });
        } catch (e) {
            const key = idAdapter.toStorage(assetId);
            setTelemetry(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    fatiguePoints: 0
                }
            }));
            loggingService.logAction(assetId, 'FATIGUE_RESET', { cause: 'NDT_COMPLETED (fallback)' });
        }
    };

    return (
        <TelemetryContext.Provider value={{
            telemetry,
            activeIncident,
            triggerEmergency,
            clearEmergency,
            forceUpdate: generateSignal,
            updatePipeDiameter,
            shutdownExcitation,
            updateWicketGateSetpoint,
            resetFatigue
        }}>
            {children}
        </TelemetryContext.Provider>
    );
};

export const useTelemetry = () => {
    const context = useContext(TelemetryContext);
    if (context === undefined) {
        throw new Error('useTelemetry must be used within a TelemetryProvider');
    }
    return context;
};
