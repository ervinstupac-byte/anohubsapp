import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAssetContext } from './AssetContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { loggingService } from '../services/LoggingService.ts';
import { SentinelKernel } from '../services/SentinelKernel.ts';
import { useNotifications } from './NotificationContext.tsx';

// Tipovi za telemetriju
export interface TelemetryData {
    assetId: string;
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
    activeIncident: { type: string, assetId: string, timestamp: number } | null;
    triggerEmergency: (assetId: string, type: 'vibration_excess' | 'bearing_overheat' | 'hydraulic_interlock' | 'mechanical_blockage' | 'metal_scraping' | 'grid_frequency_critical') => void;
    clearEmergency: () => void;
    forceUpdate: () => void;
    updatePipeDiameter: (assetId: string, diameter: number) => void;
    shutdownExcitation: (assetId: string) => void;
    updateWicketGateSetpoint: (assetId: string, setpoint: number) => void;
    resetFatigue: (assetId: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { assets } = useAssetContext();
    const [telemetry, setTelemetry] = useState<Record<string, TelemetryData>>({});
    const [activeIncident, setActiveIncident] = useState<{ type: string, assetId: string, timestamp: number } | null>(null);

    const triggerEmergency = (assetId: string, type: 'vibration_excess' | 'bearing_overheat' | 'hydraulic_interlock' | 'mechanical_blockage' | 'metal_scraping' | 'grid_frequency_critical') => {
        const timestamp = Date.now();
        setActiveIncident({ type, assetId, timestamp });

        setTelemetry(prev => ({
            ...prev,
            [assetId]: {
                assetId,
                timestamp,
                status: 'CRITICAL',
                vibration: type === 'vibration_excess' ? 0.085 : 0.035,
                temperature: type === 'bearing_overheat' ? 85 : 55,
                efficiency: 45,
                output: (telemetry[assetId]?.output || 10) * 0.3,
                incidentDetails: type === 'vibration_excess' ? 'Deviation: 0.085 mm/m - Standard Violated' : (type === 'metal_scraping' ? 'Acoustic Signature: Metal-on-Metal detected' : 'Critical Bearing Temperature: 85°C'),
                piezometricPressure: telemetry[assetId]?.piezometricPressure || 4.2,
                seepageRate: telemetry[assetId]?.seepageRate || 12.5,
                reservoirLevel: telemetry[assetId]?.reservoirLevel || 122.5,
                foundationDisplacement: type === 'vibration_excess' ? 0.35 : (telemetry[assetId]?.foundationDisplacement || 0.05),
                wicketGatePosition: 95,
                tailwaterLevel: telemetry[assetId]?.tailwaterLevel || 105.2,
                cylinderPressure: type === 'hydraulic_interlock' ? 180 : 45,
                actuatorPosition: telemetry[assetId]?.actuatorPosition || 45,
                oilPressureRate: type === 'hydraulic_interlock' ? 25 : 1.2,
                hoseTension: type === 'hydraulic_interlock' ? 450 : 25,
                pipeDiameter: telemetry[assetId]?.pipeDiameter || 12,
                safetyValveActive: type === 'hydraulic_interlock',
                oilReservoirLevel: telemetry[assetId]?.oilReservoirLevel || 85,
                rotorHeadVibration: type === 'hydraulic_interlock' ? 12.5 : (telemetry[assetId]?.rotorHeadVibration || 0.5),
                pumpFlowRate: type === 'hydraulic_interlock' ? 50 : 5,
                excitationActive: type !== 'metal_scraping',
                vibrationSpectrum: type === 'metal_scraping' ? [0.1, 0.8, 0.2, 0.9, 0.1] : [0.1, 0.1, 0.1, 0.1, 0.1],
                drainagePumpActive: type === 'hydraulic_interlock',
                drainagePumpFrequency: type === 'hydraulic_interlock' ? 45 : 12,
                wicketGateSetpoint: telemetry[assetId]?.wicketGateSetpoint || 95,
                lastCommandTimestamp: telemetry[assetId]?.lastCommandTimestamp || Date.now(),
                fatiguePoints: (telemetry[assetId]?.fatiguePoints || 0) + (type === 'vibration_excess' ? 5 : 2),
                vibrationPhase: type === 'vibration_excess' ? 45 : 12,
                oilViscosity: telemetry[assetId]?.oilViscosity || 46,
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
        }));

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
        const channel = supabase
            .channel('realtime_hpp_status')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'hpp_status' },
                (payload) => {
                    const updatedData = payload.new as any;
                    if (updatedData && updatedData.asset_id) {
                        setTelemetry(prev => ({
                            ...prev,
                            [updatedData.asset_id]: {
                                assetId: updatedData.asset_id,
                                timestamp: Date.now(),
                                status: updatedData.status || 'OPTIMAL',
                                vibration: updatedData.vibration || 0.02,
                                temperature: updatedData.temperature || 50,
                                efficiency: updatedData.efficiency || 92,
                                output: updatedData.output || 0,
                                piezometricPressure: updatedData.piezometric_pressure || 4.2,
                                seepageRate: updatedData.seepage_rate || 12.5,
                                reservoirLevel: updatedData.reservoir_level || 122.5,
                                foundationDisplacement: updatedData.foundation_displacement || 0.05,
                                wicketGatePosition: updatedData.wicket_gate_position || 45,
                                tailwaterLevel: updatedData.tailwater_level || 105.2,
                                cylinderPressure: updatedData.cylinder_pressure || 45,
                                actuatorPosition: updatedData.actuator_position || 45,
                                oilPressureRate: updatedData.oil_pressure_rate || 1.2,
                                hoseTension: updatedData.hose_tension || 25,
                                pipeDiameter: updatedData.pipe_diameter || 12,
                                safetyValveActive: updatedData.safety_valve_active || false,
                                oilReservoirLevel: updatedData.oil_reservoir_level || 85,
                                rotorHeadVibration: updatedData.rotor_head_vibration || 0.5,
                                pumpFlowRate: updatedData.pump_flow_rate || 5,
                                excitationActive: updatedData.excitation_active !== undefined ? updatedData.excitation_active : true,
                                vibrationSpectrum: updatedData.vibration_spectrum || [0, 0, 0, 0, 0],
                                drainagePumpActive: updatedData.drainage_pump_active || false,
                                drainagePumpFrequency: updatedData.drainage_pump_frequency || 12,
                                wicketGateSetpoint: updatedData.wicket_gate_setpoint || 45,
                                lastCommandTimestamp: updatedData.last_command_timestamp || Date.now(),
                                fatiguePoints: updatedData.fatigue_points || 0,
                                vibrationPhase: updatedData.vibration_phase || 12,
                                oilViscosity: updatedData.oil_viscosity || 46,
                                bearingLoad: updatedData.bearing_load || 850,
                                statorTemperatures: updatedData.stator_temperatures || [55, 55, 55, 55, 55, 55],
                                actualBladePosition: updatedData.actual_blade_position || 45,
                                bypassValveActive: updatedData.bypass_valve_active || false,
                                hydrostaticLiftActive: updatedData.hydrostatic_lift_active || false,
                                shaftSag: updatedData.shaft_sag || 0,
                                responseTimeIndex: updatedData.response_time_index || 0.1,
                                proximityX: updatedData.proximity_x || 0,
                                proximityY: updatedData.proximity_y || 0,
                                excitationCurrent: updatedData.excitation_current || 450,
                                rotorEccentricity: updatedData.rotor_eccentricity || 0.15,
                                cavitationIntensity: updatedData.cavitation_intensity || 1.1,
                                bearingGrindIndex: updatedData.bearing_grind_index || 0.4,
                                acousticBaselineMatch: updatedData.acoustic_baseline_match || 0.99,
                                ultrasonicLeakIndex: updatedData.ultrasonic_leak_index || 0.3
                            }
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const generateSignal = () => {
        const newTelemetry: Record<string, TelemetryData> = {};
        assets.forEach(asset => {
            const baseVibration = asset.status === 'Critical' ? 0.08 : 0.02;
            const vibration = parseFloat((baseVibration + (Math.random() * 0.02)).toFixed(3));
            const temp = Math.floor(45 + Math.random() * 15);
            const eff = Math.floor(90 + Math.random() * 5);
            let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
            if (vibration > 0.05) status = 'CRITICAL';
            else if (vibration > 0.04) status = 'WARNING';

            const currentTele = telemetry[asset.id];

            newTelemetry[asset.id] = {
                assetId: asset.id,
                timestamp: Date.now(),
                status,
                vibration: (() => {
                    const baseVib = parseFloat((baseVibration + (Math.random() * 0.02)).toFixed(3));
                    const excitation = currentTele?.excitationCurrent || 450;
                    // Magnetic side pull logic: if excitation > 400, add non-linear vibration based on eccentricity
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
                    // Simulate "Lazy" response: small increment towards setpoint
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
                    // If pressure rate > 5 bar/s, it's a "shock"
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
                    parseFloat((55 + (Math.random() * 30)).toFixed(1)), // Potential hotspot T4
                    parseFloat((55 + (Math.random() * 5)).toFixed(1)),
                    parseFloat((55 + (Math.random() * 5)).toFixed(1))
                ],
                actualBladePosition: (() => {
                    const currentActPos = parseFloat((45 + (Math.random() * 5)).toFixed(1)); // Redoing local for simplicity or use a variable
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
            };
        });
        setTelemetry(prev => ({ ...prev, ...newTelemetry }));
    };

    useEffect(() => {
        if (assets.length > 0) {
            generateSignal();
        }
    }, [assets]);

    const updatePipeDiameter = (assetId: string, diameter: number) => {
        setTelemetry(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                pipeDiameter: diameter
            }
        }));
        loggingService.logAction(assetId, 'PIPE_DIAMETER_CHANGE', { newDiameter: diameter });
    };

    const shutdownExcitation = (assetId: string) => {
        setTelemetry(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                excitationActive: false
            }
        }));
        loggingService.logAction(assetId, 'EXCITATION_SHUTDOWN', { cause: 'METAL_SCRAPING_DETECTED' });
    };

    const updateWicketGateSetpoint = (assetId: string, setpoint: number) => {
        setTelemetry(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                wicketGateSetpoint: setpoint,
                lastCommandTimestamp: Date.now()
            }
        }));
        loggingService.logAction(assetId, 'WICKET_GATE_COMMAND', { setpoint });
    };

    const resetFatigue = (assetId: string) => {
        setTelemetry(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                fatiguePoints: 0
            }
        }));
        loggingService.logAction(assetId, 'FATIGUE_RESET', { cause: 'NDT_COMPLETED' });
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