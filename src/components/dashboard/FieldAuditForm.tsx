import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle, Info, ClipboardCheck,
    Thermometer, Activity, Wind, Database,
    FileText, Save, ArrowRight, X, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useProtocolHistoryStore } from '../../stores/ProtocolHistoryStore';
import { useNotifications } from '../../contexts/NotificationContext';
import { Z_INDEX, SECTOR_GLOW, STATUS_COLORS } from '../../shared/design-tokens';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { Decimal } from 'decimal.js';
import docsData from '../../i18n/locales/docs.json';
import { ForensicReportService } from '../../services/ForensicReportService';

interface FieldAuditFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
}

interface AuditField {
    key: string;
    label: string;
    unit: string;
    placeholder: string;
    threshold: { warning?: number; critical: number };
    docKey: string;
}

// Define all possible fields with strict limits
const ALL_AUDIT_FIELDS: Record<string, AuditField> = {
    // === COMMON (ALL TYPES) ===
    bearingTemp: {
        key: 'bearingTemp',
        label: 'Babbitt Temp',
        unit: '°C',
        placeholder: '0.0',
        threshold: { warning: 65, critical: 75 },
        docKey: 'babbitt'
    },
    oilTan: {
        key: 'oilTan',
        label: 'Oil TAN',
        unit: 'mg KOH/g',
        placeholder: '0.00',
        threshold: { warning: 0.4, critical: 0.5 },
        docKey: 'oilTan'
    },
    waterInOil: {
        key: 'waterInOil',
        label: 'Water in Oil',
        unit: '%',
        placeholder: '0.00',
        threshold: { warning: 0.05, critical: 0.1 },
        docKey: 'waterInOil'
    },
    axialPlay: {
        key: 'axialPlay',
        label: 'Shaft Float',
        unit: 'mm',
        placeholder: '0.00',
        threshold: { warning: 0.30, critical: 0.35 },
        docKey: 'shaftLift'
    },
    vibration: {
        key: 'vibration',
        label: 'Casing Vib (ISO)',
        unit: 'mm/s',
        placeholder: '0.00',
        threshold: { warning: 2.5, critical: 4.5 },
        docKey: 'vibration'
    },

    // === FRANCIS SPECIFIC ===
    labyrinthClearance: {
        key: 'labyrinthClearance',
        label: 'Lab. Clearance (Upper/Lower)',
        unit: 'mm',
        placeholder: '0.00',
        threshold: { warning: 0.45, critical: 0.50 },
        docKey: 'labyrinth'
    },
    spiralPressure: {
        key: 'spiralPressure',
        label: 'Spiral Case Pressure',
        unit: 'bar',
        placeholder: '0.0',
        threshold: { warning: 100, critical: 200 }, // Context dependent, usually monitoring only
        docKey: 'spiral_pressure'
    },
    headCoverPressure: {
        key: 'headCoverPressure',
        label: 'Head Cover Pressure',
        unit: 'bar',
        placeholder: '±0.00',
        threshold: { warning: 1.5, critical: 2.5 },
        docKey: 'head_cover_pressure'
    },
    cavitationNoise: {
        key: 'cavitationNoise',
        label: 'Cavitation Noise (1-5)',
        unit: 'Scale',
        placeholder: '1',
        threshold: { warning: 3, critical: 4 }, // 4 and 5 are bad
        docKey: 'cavitation'
    },

    // === KAPLAN SPECIFIC ===
    bladeGateSync: {
        key: 'bladeGateSync',
        label: 'Blade/Gate Sync Diff',
        unit: '%',
        placeholder: '0.0',
        threshold: { warning: 2, critical: 5 },
        docKey: 'bladeSync'
    },
    hubOilLeakage: {
        key: 'hubOilLeakage',
        label: 'Hub Oil Leakage',
        unit: 'L/h',
        placeholder: '0.00',
        threshold: { warning: 0.1, critical: 0.5 },
        docKey: 'hubLeak'
    },
    servoTime: {
        key: 'servoTime',
        label: 'Servo Fill Time',
        unit: 's',
        placeholder: '0.0',
        threshold: { warning: 60, critical: 120 }, // Example generic limits
        docKey: 'servo_time'
    },
    hubTemp: {
        key: 'hubTemp',
        label: 'Hub Oil Temp',
        unit: '°C',
        placeholder: '0.0',
        threshold: { warning: 55, critical: 65 },
        docKey: 'temperature'
    },

    // === PELTON SPECIFIC ===
    needleTip: {
        key: 'needleTip',
        label: 'Needle Tip Erosion (1-5)',
        unit: 'Scale',
        placeholder: '1',
        threshold: { warning: 3, critical: 4 },
        docKey: 'needleTip'
    },
    nozzleSeat: {
        key: 'nozzleSeat',
        label: 'Nozzle Seat Condition (1-5)',
        unit: 'Scale',
        placeholder: '1',
        threshold: { warning: 3, critical: 4 },
        docKey: 'needleTip'
    },
    deflectorActiveGap: {
        key: 'deflectorActiveGap',
        label: 'Deflector Clearance',
        unit: 'mm',
        placeholder: '0.0',
        threshold: { warning: 25, critical: 35 }, // Must clear jet
        docKey: 'deflector'
    },
    activeNozzles: {
        key: 'activeNozzles',
        label: 'Active Nozzles',
        unit: 'Count',
        placeholder: '0',
        threshold: { warning: 0, critical: 10 },
        docKey: 'efficiency'
    },

    // === NEW: GOVERNOR ===
    accumulatorPressure: {
        key: 'accumulatorPressure',
        label: 'Accumulator Press.',
        unit: 'bar',
        placeholder: '0.0',
        threshold: { warning: 38, critical: 35 }, // Norm 40+
        docKey: 'accumulator_pressure'
    },
    pumpRunTime: {
        key: 'pumpRunTime',
        label: 'Pump Duty Cycle',
        unit: 'starts/h',
        placeholder: '0',
        threshold: { warning: 6, critical: 10 },
        docKey: 'pump_run_time'
    },
    gateOpening: {
        key: 'gateOpening',
        label: 'Gate / Needle %',
        unit: '%',
        placeholder: '0.0',
        threshold: { warning: 98, critical: 101 },
        docKey: 'gate_opening'
    },

    // === NEW: COOLING & HYDRAULIC ===
    coolingDeltaT: {
        key: 'coolingDeltaT',
        label: 'Cooling ΔT',
        unit: '°C',
        placeholder: '0.0',
        threshold: { warning: 2.5, critical: 2.0 }, // Warn if TOO LOW (efficiency)
        docKey: 'delta_t'
    },
    coolingPressure: {
        key: 'coolingPressure',
        label: 'Raw Water Press.',
        unit: 'bar',
        placeholder: '0.0',
        threshold: { warning: 2.0, critical: 1.5 },
        docKey: 'cooling_pressure'
    },
    filterDP: {
        key: 'filterDP',
        label: 'Filter Diff. Press.',
        unit: 'bar',
        placeholder: '0.00',
        threshold: { warning: 0.3, critical: 0.5 },
        docKey: 'filter_dp'
    },
    headWaterLevel: {
        key: 'headWaterLevel',
        label: 'Upper Water Lvl',
        unit: 'm nm',
        placeholder: '0.00',
        threshold: { warning: 0, critical: 0 }, // Informational
        docKey: 'water_level'
    },
    tailWaterLevel: {
        key: 'tailWaterLevel',
        label: 'Lower Water Lvl',
        unit: 'm nm',
        placeholder: '0.00',
        threshold: { warning: 0, critical: 0 }, // Informational
        docKey: 'water_level'
    },

    // === NEW: GENERATOR ===
    windingTemp: {
        key: 'windingTemp',
        label: 'Stator Winding Temp',
        unit: '°C',
        placeholder: '0.0',
        threshold: { warning: 110, critical: 120 },
        docKey: 'winding'
    },
    sumpLevel: {
        key: 'sumpLevel',
        label: 'Oil Sump Level',
        unit: '%',
        placeholder: '0.0',
        threshold: { warning: 40, critical: 30 },
        docKey: 'sump_level'
    },

    // === NEW: FORENSIC SPECIFICS ===
    kaplanTipClearance: {
        key: 'kaplanTipClearance',
        label: 'Blade Tip Clearance',
        unit: 'mm',
        placeholder: '0.00',
        threshold: { warning: 2.0, critical: 3.0 },
        docKey: 'tip_clearance'
    },
    peltonDeflectorTime: {
        key: 'peltonDeflectorTime',
        label: 'Deflector Response',
        unit: 'ms',
        placeholder: '0',
        threshold: { warning: 600, critical: 800 },
        docKey: 'deflector_time'
    },
    peltonNozzleLeakage: {
        key: 'peltonNozzleLeakage',
        label: 'Nozzle Leakage',
        unit: '%',
        placeholder: '0.0',
        threshold: { warning: 2, critical: 5 },
        docKey: 'nozzle_leak'
    },
    // NC-4.9 Additions
    insulationResistance: {
        key: 'insulationResistance',
        label: 'Insulation Resistance',
        unit: 'MΩ',
        placeholder: '1250',
        threshold: { warning: 100, critical: 50 }, // Critical if low
        docKey: 'winding'
    },
    geodeticSettlement: {
        key: 'geodeticSettlement',
        label: 'Geodetic Settlement',
        unit: 'mm',
        placeholder: '0.12',
        threshold: { warning: 0.5, critical: 1.0 },
        docKey: 'water_level'
    }
};

export const FieldAuditForm: React.FC<FieldAuditFormProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess
}) => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const { identity } = useTelemetryStore();
    const { addEntry } = useProtocolHistoryStore();
    const { pushNotification } = useNotifications();

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [observations, setObservations] = useState('');
    const [operatorName, setOperatorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [hasSubmitted, setHasSubmitted] = useState(false); // Track successful submission

    // Group Fields by Step
    const currentStepFields = useMemo(() => {
        const type = selectedAsset?.turbineProfile?.type || 'francis';

        switch (step) {
            case 1: // PRIMARY (Safety & Criticals)
                return [
                    ALL_AUDIT_FIELDS.bearingTemp,
                    ALL_AUDIT_FIELDS.vibration,
                    ALL_AUDIT_FIELDS.axialPlay,
                    ALL_AUDIT_FIELDS.windingTemp,
                    ALL_AUDIT_FIELDS.sumpLevel,
                    ALL_AUDIT_FIELDS.insulationResistance, // NC-4.9
                    ALL_AUDIT_FIELDS.geodeticSettlement    // NC-4.9
                ];
            case 2: // HYDRAULIC & COOLING
                return [
                    ALL_AUDIT_FIELDS.oilTan,
                    ALL_AUDIT_FIELDS.waterInOil,
                    ALL_AUDIT_FIELDS.coolingDeltaT,
                    ALL_AUDIT_FIELDS.coolingPressure,
                    ALL_AUDIT_FIELDS.filterDP,
                    ALL_AUDIT_FIELDS.headWaterLevel,
                    ALL_AUDIT_FIELDS.tailWaterLevel
                ];
            case 3: // TURBINE SPECIFIC & GOVERNOR
                const governorFields = [
                    ALL_AUDIT_FIELDS.accumulatorPressure,
                    ALL_AUDIT_FIELDS.pumpRunTime,
                    ALL_AUDIT_FIELDS.gateOpening
                ];

                let specificFields: AuditField[] = [];
                if (type === 'pelton') {
                    specificFields = [
                        ALL_AUDIT_FIELDS.needleTip,
                        ALL_AUDIT_FIELDS.nozzleSeat,
                        ALL_AUDIT_FIELDS.deflectorActiveGap,
                        ALL_AUDIT_FIELDS.activeNozzles,
                        ALL_AUDIT_FIELDS.peltonDeflectorTime, // New
                        ALL_AUDIT_FIELDS.peltonNozzleLeakage  // New
                    ];
                } else if (type === 'kaplan') {
                    specificFields = [
                        ALL_AUDIT_FIELDS.bladeGateSync,
                        ALL_AUDIT_FIELDS.hubOilLeakage,
                        ALL_AUDIT_FIELDS.servoTime,
                        ALL_AUDIT_FIELDS.hubTemp,
                        ALL_AUDIT_FIELDS.kaplanTipClearance // New
                    ];
                } else { // Francis
                    specificFields = [
                        ALL_AUDIT_FIELDS.labyrinthClearance,
                        ALL_AUDIT_FIELDS.spiralPressure,
                        ALL_AUDIT_FIELDS.headCoverPressure,
                        ALL_AUDIT_FIELDS.cavitationNoise
                    ];
                }
                return [...governorFields, ...specificFields];
            default:
                return []; // Step 4 is custom UI (Observations)
        }
    }, [step, selectedAsset]);

    // Assessment Logic (Runs on ALL fields, not just active step)
    const assessments = useMemo(() => {
        const results: Array<{
            key: string;
            field: string;
            value: number;
            status: 'nominal' | 'warning' | 'critical';
            recommendation: string;
        }> = [];
        const type = selectedAsset?.turbineProfile?.type || 'francis';

        // Flatten all possible relevant keys for assessment
        // ... (This logic needs to check ALL data in formData, not just currentStepFields)
        // We will simplify: assessments update live for ALL entered data.

        const allRelevantFields = [
            ...Object.values(ALL_AUDIT_FIELDS) // Simple check against all definitions
        ];

        allRelevantFields.forEach(field => {
            const valueStr = formData[field.key];
            if (valueStr === undefined || valueStr === '') return;

            const value = parseFloat(valueStr as string);
            if (isNaN(value)) return;

            // Apply ISO Adjustment here as well for consistency
            let effectiveThreshold = { ...field.threshold };
            if (selectedAsset?.turbineProfile?.rpmNominal && selectedAsset.turbineProfile.rpmNominal > 1000) {
                if (effectiveThreshold.warning) effectiveThreshold.warning *= 0.8;
                effectiveThreshold.critical *= 0.8;
            }

            // NC-4.9: Invert logic for Insulation Resistance (Critical if BELOW)
            const isInverseField = field.key === 'insulationResistance';
            let status: 'nominal' | 'warning' | 'critical' = 'nominal';

            if (isInverseField) {
                if (value < effectiveThreshold.critical) status = 'critical';
                else if (effectiveThreshold.warning && value < effectiveThreshold.warning) status = 'warning';
            } else {
                if (value > effectiveThreshold.critical) status = 'critical';
                else if (effectiveThreshold.warning && value > effectiveThreshold.warning) status = 'warning';
            }

            // Get recommendation from docs.json
            const maintenance = (docsData as any).maintenance || {};
            let recommendation = maintenance[field.docKey] || 'No specific recommendation available.';

            if (status === 'critical') {
                recommendation = '⚠️ URGENT: ' + recommendation;
            } else if (status === 'warning') {
                recommendation = '⚡ ATTENTION: ' + recommendation;
            } else {
                recommendation = '✓ NOMINAL: Value within acceptable limits.';
            }

            results.push({
                key: field.key,
                field: field.label,
                value,
                status,
                recommendation
            });
        });

        return results;
    }, [formData, selectedAsset]);

    const renderField = (field: AuditField) => {
        const value = formData[field.key] || '';
        const numValue = parseFloat(value as string);
        const hasValue = value !== '' && !isNaN(numValue);

        // Threshold Logic
        let effectiveThreshold = { ...field.threshold };
        if (selectedAsset?.turbineProfile?.rpmNominal && selectedAsset.turbineProfile.rpmNominal > 1000) {
            if (effectiveThreshold.warning) effectiveThreshold.warning *= 0.8;
            effectiveThreshold.critical *= 0.8;
        }

        let fieldStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
        if (hasValue) {
            if (numValue > effectiveThreshold.critical) fieldStatus = 'critical';
            else if (effectiveThreshold.warning && numValue > effectiveThreshold.warning) fieldStatus = 'warning';
        }

        const definition = (docsData as any).definitions?.[field.docKey];

        return (
            <div key={field.key}>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest flex justify-between items-center">
                    <div className="flex items-center gap-1 group relative">
                        <span>{field.label}</span>
                        {definition && (
                            <>
                                <Info className="w-3 h-3 text-slate-600 cursor-help hover:text-cyan-400" />
                                {/* Tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-900 border border-white/10 p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    <p className="text-[10px] text-slate-300 normal-case font-normal leading-tight">
                                        {definition}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <span className="text-slate-600">{field.unit}</span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className={`
                            w-full bg-slate-900/50 border rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none transition-all
                            ${fieldStatus === 'critical' ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                                fieldStatus === 'warning' ? 'border-amber-500/50 focus:border-amber-500' :
                                    'border-white/10 focus:border-cyan-500/50'}
                        `}
                    />
                    {/* Status Icon Indicator */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {fieldStatus === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {fieldStatus === 'warning' && <Activity className="w-4 h-4 text-amber-500" />}
                        {hasValue && fieldStatus === 'nominal' && <CheckCircle className="w-4 h-4 text-emerald-500/50" />}
                    </div>
                </div>
            </div>
        );
    };

    const hasWarnings = assessments.some(a => a.status === 'warning');
    const hasCritical = assessments.some(a => a.status === 'critical');


    const handleSubmit = async () => {
        if (!selectedAsset || !operatorName.trim()) {
            pushNotification('WARNING', 'Please enter operator name');
            return;
        }

        if (Object.keys(formData).length === 0) {
            pushNotification('WARNING', 'Please enter at least one measurement');
            return;
        }

        setIsSubmitting(true);

        try {
            const auditData = {
                timestamp: Date.now(),
                operator: operatorName,
                asset: {
                    id: selectedAsset.id,
                    name: selectedAsset.name
                },
                measurements: formData,
                observations,
                assessments
            };

            // Log to Protocol History with full details
            addEntry({
                protocolId: 'field-audit',
                protocolName: 'Field Audit Report',
                assetId: selectedAsset.id,
                assetName: selectedAsset.name,
                type: 'protocol',
                details: auditData
            });

            localStorage.setItem(`field_audit_${Date.now()} `, JSON.stringify(auditData));

            // ⚠️ NC-4.9: WIRE TO TELEMETRY STORE
            // This ensures manual audit metrics trigger immediate AI brain recalculation
            const telemetryState = useTelemetryStore.getState();
            telemetryState.updateTelemetry({
                mechanical: {
                    vibration: formData.vibration ? parseFloat(formData.vibration) : 0,
                    bearingTemp: formData.bearingTemp ? parseFloat(formData.bearingTemp) : 0,
                    axialPlay: formData.axialPlay ? parseFloat(formData.axialPlay) : 0,
                },
                insulationResistance: formData.insulationResistance ? parseFloat(formData.insulationResistance) : telemetryState.insulationResistance,
                geodeticData: {
                    settlement: formData.geodeticSettlement ? parseFloat(formData.geodeticSettlement) : telemetryState.geodeticData.settlement,
                    tilt: telemetryState.geodeticData.tilt
                },
                hydraulic: {
                    head: (formData.headWaterLevel && formData.tailWaterLevel) ?
                        parseFloat(formData.headWaterLevel) - parseFloat(formData.tailWaterLevel) : telemetryState.hydraulic.head
                },
                // Trigger brain refresh
                acousticMatch: 99.2 // Standard baseline
            });

            // NC-4.9 Trigger Analysis
            await telemetryState.runDeepAnalysis();

            pushNotification('INFO', 'Field audit submitted successfully - Brain recalculating...');

            // Reset form
            setFormData({});
            setObservations('');
            setOperatorName('');

            if (onSubmitSuccess) onSubmitSuccess();
            onClose();

        } catch (error) {
            pushNotification('WARNING', 'Failed to submit audit');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 ${Z_INDEX.modal} flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto`}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        w-full max-w-2xl bg-slate-950/95 backdrop-blur-xl rounded-2xl
                        border border-cyan-500/30 ${SECTOR_GLOW.mechanical}
                        overflow-hidden my-8
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                                    Field Audit Form
                                </h2>
                                <p className="text-[10px] text-slate-500 font-mono">
                                    {selectedAsset?.name || '—'} • {selectedAsset?.turbineProfile?.type ? selectedAsset.turbineProfile.type.toUpperCase() : 'STANDARD'} Profile
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* STEPPER HEADER */}
                    <div className="px-6 pb-2 pt-0 flex justify-between items-center">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setStep(s as any)}>
                                <div className={`w-8 h-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-slate-700'
                                    }`} />
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${step === s ? 'text-white' : 'text-slate-600'
                                    }`}>
                                    {s === 1 ? 'Primary' : s === 2 ? 'Hydraulic' : s === 3 ? 'Specific' : 'Obs'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6 max-h-[calc(100vh-350px)] overflow-y-auto">

                        {/* STEPS 1-3: METRICS */}
                        {step <= 3 && (
                            <>
                                <motion.div
                                    key={`step-${step}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Render Fields */}
                                    {(() => {
                                        // Smart Branching Logic for Step 3
                                        let fieldsToShow = currentStepFields;

                                        // Check for Primary Issues (from Assessments)
                                        const primaryIssues = assessments.some(a =>
                                            // Simplification: If ANY assessment is warning/critical, trigger forensics.
                                            a.status !== 'nominal'
                                        );

                                        if (step === 3) {
                                            // Split fields
                                            const govFields = currentStepFields.filter(f => ['accumulatorPressure', 'pumpRunTime', 'gateOpening'].includes(f.key));
                                            const forensicFields = currentStepFields.filter(f => !['accumulatorPressure', 'pumpRunTime', 'gateOpening'].includes(f.key));

                                            // Render Logic
                                            return (
                                                <div className="space-y-6">
                                                    {/* Standard / Governor Fields */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {govFields.map(f => renderField(f))}
                                                    </div>

                                                    {/* Diagnostic Drill-Down (Conditional) */}
                                                    {(primaryIssues || formData['force_forensics']) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            className={`
                                                                relative p-4 rounded-xl border border-cyan-500/50 bg-cyan-950/20
                                                                shadow-[0_0_20px_rgba(6,182,212,0.15)] z-40 overflow-hidden
                                                            `}
                                                        >
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 box-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                                                                <h3 className="text-xs font-black text-cyan-100 uppercase tracking-widest">
                                                                    Diagnostic Drill-Down ({selectedAsset?.turbineProfile?.type?.toUpperCase()})
                                                                </h3>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {forensicFields.map(f => renderField(f))}
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {!primaryIssues && !formData['force_forensics'] && forensicFields.length > 0 && (
                                                        <button
                                                            onClick={() => setFormData(p => ({ ...p, force_forensics: 'true' }))}
                                                            className="w-full py-2 text-[10px] font-bold uppercase text-slate-500 hover:text-cyan-400 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all"
                                                        >
                                                            + Expand Advanced Diagnostics
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // Steps 1 & 2 (Standard Grid)
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentStepFields.map(f => renderField(f))}
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            </>
                        )}

                        {/* STEP 4: OBSERVATIONS */}
                        {step === 4 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {/* Operator Name (Moved to Step 4 for signing off) */}
                                <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">
                                        Operator Sign-Off <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={operatorName}
                                        onChange={(e) => setOperatorName(e.target.value)}
                                        placeholder="Enter your name to certify results"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-cyan-400" />
                                        Operational Senses
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Drain Water Color */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Drainage Water</label>
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                                onChange={(e) => setObservations(prev => prev + ` [Water: ${e.target.value}]`)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Clear">Clear</option>
                                                <option value="Turbid">Turbid / Cloudy</option>
                                                <option value="Oily">Oily Sheen</option>
                                            </select>
                                        </div>

                                        {/* Smell */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Atmosphere</label>
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                                onChange={(e) => setObservations(prev => prev + ` [Smell: ${e.target.value}]`)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Ozone">Ozone / Electrical</option>
                                                <option value="Burning">Burning / Hot Metal</option>
                                                <option value="Damp">Damp / Moldy</option>
                                            </select>
                                        </div>

                                        {/* Sound */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Acoustic</label>
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                                onChange={(e) => setObservations(prev => prev + ` [Sound: ${e.target.value}]`)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Normal Hum">Normal Operating Hum</option>
                                                <option value="Knocking">Knocking / Banging</option>
                                                <option value="High Whine">High Frequency Whine</option>
                                                <option value="Gravelly">Gravelly (Cavitation)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">
                                            Field Notes
                                        </label>
                                        <textarea
                                            value={observations}
                                            onChange={(e) => setObservations(e.target.value)}
                                            placeholder="Detailed findings..."
                                            rows={2}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none resize-none text-xs"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Live Assessments Summary (Always visible if any exists) */}
                        {assessments.length > 0 && (
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10 mt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">
                                        Live Intelligence ({assessments.length})
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {assessments.map((assessment, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-2 rounded border-l-2 text-[10px] ${assessment.status === 'critical' ? 'border-red-500 bg-red-500/5 text-red-200' :
                                                assessment.status === 'warning' ? 'border-amber-500 bg-amber-500/5 text-amber-200' :
                                                    'border-emerald-500 bg-emerald-500/5 text-emerald-200'
                                                }`}
                                        >
                                            <span className="font-bold mr-2">{assessment.field}:</span>
                                            {assessment.recommendation.substring(0, 100)}...
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-6 border-t border-white/10 flex gap-3 bg-slate-900/80 backdrop-blur-md absolute bottom-0 left-0 right-0 rounded-b-2xl">
                        {step > 1 ? (
                            <ModernButton
                                variant="ghost"
                                onClick={() => setStep(s => Math.max(1, s - 1) as any)}
                                className="flex-1"
                            >
                                Back
                            </ModernButton>
                        ) : (
                            <ModernButton
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </ModernButton>
                        )}

                        {step < 4 ? (
                            <ModernButton
                                variant="primary"
                                onClick={() => setStep(s => Math.min(4, s + 1) as any)}
                                className="flex-1"
                            >
                                Next Step
                            </ModernButton>
                        ) : (
                            <ModernButton
                                variant={hasCritical ? 'danger' : 'primary'}
                                onClick={handleSubmit}
                                disabled={isSubmitting || !operatorName.trim()}
                                className="flex-1"
                            >
                                {isSubmitting ? 'Syncing...' : 'Sign & Submit'}
                            </ModernButton>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
