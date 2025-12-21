// Core interfaces for Universal Turbine Management System
// Supports Kaplan, Francis, Pelton + all variants

import { ReactNode } from 'react';

// =====================================================
// ENUMS & TYPES
// =====================================================

export type TurbineFamily = 'kaplan' | 'francis' | 'pelton' | 'crossflow';

export type TurbineVariant =
    // Kaplan Family (6 variants)
    | 'kaplan_vertical'
    | 'kaplan_horizontal'
    | 'kaplan_pit'
    | 'kaplan_bulb'
    | 'kaplan_s'
    | 'kaplan_spiral'
    // Francis Family
    | 'francis_vertical'
    | 'francis_horizontal'
    | 'francis_slow_runner'
    | 'francis_fast_runner'
    // Pelton Family
    | 'pelton_vertical'
    | 'pelton_horizontal'
    | 'pelton_multi_jet'
    // Crossflow
    | 'crossflow_standard';

// =====================================================
// DATA STRUCTURES
// =====================================================

export interface Threshold {
    value: number;
    unit: string;
    critical: boolean;
    warningThreshold?: number;
}

export interface ToleranceMap {
    [parameter: string]: Threshold;
}

export interface SensorSchema {
    required: string[];
    optional: string[];
    units: Record<string, string>;
}

export interface ForensicsPattern {
    id: string;
    name: string;
    description: string;
    triggers: string[];
    thresholds: Record<string, number>;
    solution: string;
    historicalIncidents: string[];
}

// =====================================================
// SENSOR DATA INTERFACES
// =====================================================

export interface CommonSensorData {
    vibration: number;
    temperature: number;
    output_power: number;
    efficiency: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface KaplanSensorData {
    blade_angle: number;
    blade_angle_setpoint: number;
    hub_position: number;
    wicket_gate_position: number;
    servo_oil_pressure: number;
    hub_vibration?: number;
    // Bulb-specific
    generator_submersion_depth?: number;
    seal_water_pressure?: number;
    // Horizontal-specific
    hose_tension?: number;
    pipe_diameter?: number;
}

export interface FrancisSensorData {
    guide_vane_opening: number;
    runner_clearance: number;
    draft_tube_pressure: number;
    stay_ring_vibration?: number;
    spiral_case_pressure?: number;
    // Slow runner specific
    runner_tip_clearance?: number;
}

export interface PeltonSensorData {
    nozzle_openings: number[]; // Array for multi-jet
    jet_velocities: number[];
    bucket_wear_index: number;
    deflector_position: 'OPEN' | 'CLOSED' | 'PARTIAL';
    nozzle_alignment?: number[];
}

export interface GeneratorData {
    excitation_current: number;
    stator_temps: number[];
    rotor_temp: number;
    cooling_water_flow: number;
    reactive_power?: number;
}

export interface CompleteSensorData {
    timestamp: number;
    assetId: string;
    turbineFamily: TurbineFamily;
    common: CommonSensorData;
    kaplan?: KaplanSensorData;
    francis?: FrancisSensorData;
    pelton?: PeltonSensorData;
    generator?: GeneratorData;
}

// =====================================================
// ANOMALY DETECTION
// =====================================================

export interface Anomaly {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    parameter: string;
    currentValue: number;
    expectedRange: [number, number];
    recommendation: string;
    timestamp: number;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// =====================================================
// TURBINE MODEL INTERFACE (Factory Pattern)
// =====================================================

export interface ITurbineModel {
    family: TurbineFamily;
    variant: TurbineVariant;
    config: TurbineConfiguration;

    /**
     * Returns list of family-specific parameters to monitor
     */
    getSpecificParameters(): string[];

    /**
     * Returns tolerances/thresholds for this turbine instance
     */
    getTolerances(): ToleranceMap;

    /**
     * Validates incoming sensor data structure
     */
    validateSensorData(data: any): ValidationResult;

    /**
     * Detects anomalies based on historical data
     */
    detectAnomalies(historicalData: CompleteSensorData[]): Anomaly[];

    /**
     * Returns family-specific forensics patterns
     */
    getForensicsPatterns(): ForensicsPattern[];

    /**
     * Renders family-specific dashboard (React component)
     */
    renderDashboard(): ReactNode;

    /**
     * Calculates RUL for family-specific components
     */
    calculateComponentRUL(component: string, operatingHours: number): number;
}

// =====================================================
// TURBINE CONFIGURATION
// =====================================================

export interface TurbineConfiguration {
    head: number; // meters
    flow_max: number; // m³/s
    runner_diameter: number; // meters
    commissioning_date: string;
    manufacturer: string;
    serial_number: string;

    // Kaplan-specific
    blade_count?: number;
    hub_diameter?: number;

    // Francis-specific
    specific_speed?: number;
    runner_type?: 'slow' | 'medium' | 'fast';

    // Physical Dimensions & Limits (Added for 0.05mm precision)
    bearing_span?: number; // meters
    design_flow?: number; // m³/s
    design_head?: number; // m
    rated_speed?: number; // rpm
    rotor_weight?: number; // tons

    // Pelton-specific
    nozzle_count?: number;
    bucket_count?: number;
    jet_diameter?: number;
}

// =====================================================
// CONSULTING ENGINE TYPES
// =====================================================

export interface SpecialMeasurement {
    type: 'geodetic' | 'vibration' | 'thermography' | 'ultrasonic' | 'oil_analysis';
    timestamp: number;
    assetId: string;
    data: any;
    interpretedResults: InterpretedResult[];
}

export interface InterpretedResult {
    parameter: string;
    value: number;
    status: 'GOOD' | 'ACCEPTABLE' | 'REQUIRES_ATTENTION' | 'CRITICAL';
    recommendation: string;
}

export interface Finding {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: 'ALIGNMENT' | 'VIBRATION' | 'THERMAL' | 'HYDRAULIC' | 'MECHANICAL';
    description: string;
    suggestedAction: string;
    estimatedRepairCost: number;
    riskMitigation: number; // USD/year
}

export interface Recommendation {
    title: string;
    action: string;
    estimatedCost: number;
    expectedBenefit: number;
    paybackPeriod: number; // months
    priority: number; // 1-5, 1 being highest
}

export interface OptimizationReport {
    assetId: string;
    assetName: string;
    turbineFamily: TurbineFamily;
    generatedAt: number;
    findings: Finding[];
    recommendations: Recommendation[];
    estimatedROI: number;
    executionPriority: Recommendation[];
}

// =====================================================
// FORENSICS MATCH TYPES
// =====================================================

export interface ForensicsMatch {
    incidentId: string;
    incidentName: string;
    similarity: number; // 0-100%
    warningMessage: string;
    recommendedAction: string;
    historicalReference: string[];
}

// =====================================================
// ENHANCED ASSET TYPE
// =====================================================

export interface EnhancedAsset {
    id: string;
    name: string;
    type: 'HPP' | 'Solar' | 'Wind';
    location: string;
    coordinates: [number, number];
    capacity: number;
    status: 'Operational' | 'Maintenance' | 'Planned' | 'Critical' | 'Warning';
    imageUrl?: string;

    // New universal turbine fields
    turbine_family: TurbineFamily;
    turbine_variant: TurbineVariant;
    turbine_config: TurbineConfiguration;
    operational_thresholds?: ToleranceMap;
}
