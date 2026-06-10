/**
 * PrecisionInput Component
 * 0.01mm precision input with hundredths slider
 */

import React, { useState } from 'react';

interface PrecisionInputProps {
    value: number;
    onChange: (value: number) => void;
    unit: 'mm';
    min?: number;
    max?: number;
    label: string;
}

export const PrecisionInput: React.FC<PrecisionInputProps> = ({
    value,
    onChange,
    unit,
    min = 0,
    max = 2.00,
    label
}) => {
    const [hundredths, setHundredths] = useState(Math.round(value * 100));

    const handleSliderChange = (newHundredths: number) => {
        setHundredths(newHundredths);
        onChange(newHundredths / 100);
    };

    const handleInputChange = (newHundredths: number) => {
        const clamped = Math.max(min * 100, Math.min(max * 100, newHundredths));
        setHundredths(clamped);
        onChange(clamped / 100);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-white">
                {label}
            </label>
            <div className="flex items-center gap-4">
                {/* Slider for coarse adjustment */}
                <input
                    type="range"
                    min={min * 100}
                    max={max * 100}
                    step={1}
                    value={hundredths}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2dd4bf]"
                />

                {/* Numeric input for fine adjustment */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-4 py-2 min-w-[200px]">
                    <input
                        type="number"
                        value={hundredths}
                        onChange={(e) => handleInputChange(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-white text-right font-mono w-16 outline-none"
                        step={1}
                    />
                    <span className="text-slate-400 text-sm">hundredths</span>
                    <span className="text-white font-bold">=</span>
                    <span className="text-[#2dd4bf] font-mono font-bold text-lg">
                        {(hundredths / 100).toFixed(2)}{unit}
                    </span>
                </div>
            </div>

            {/* Visual feedback */}
            <div className="text-xs text-slate-400">
                Precision: 0.01{unit} increments | Range: {min.toFixed(2)}-{max.toFixed(2)}{unit}
            </div>
        </div>
    );
};

/**
 * DigitalSignatureInput Component
 * Engineer details and signature generation
 */

interface DigitalSignatureInputProps {
    engineerName: string;
    engineerLicense: string;
    onEngineerNameChange: (name: string) => void;
    onEngineerLicenseChange: (license: string) => void;
}

export const DigitalSignatureInput: React.FC<DigitalSignatureInputProps> = ({
    engineerName,
    engineerLicense,
    onEngineerNameChange,
    onEngineerLicenseChange
}) => {
    return (
        <div className="space-y-4 p-4 bg-slate-900 border border-slate-700 rounded">
            <h3 className="text-sm font-bold text-[#2dd4bf]">Digital Signature</h3>

            <div>
                <label className="block text-sm font-bold text-white mb-2">
                    Engineer Name
                </label>
                <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => onEngineerNameChange(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-[#2dd4bf]"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-white mb-2">
                    Engineer License Number
                </label>
                <input
                    type="text"
                    value={engineerLicense}
                    onChange={(e) => onEngineerLicenseChange(e.target.value)}
                    placeholder="e.g., ING-2024-12345"
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white font-mono outline-none focus:border-[#2dd4bf]"
                />
            </div>

            <div className="text-xs text-slate-400 p-2 bg-blue-950/20 border border-blue-500/30 rounded">
                <strong className="text-blue-300">Note:</strong> Measurements will be cryptographically signed with SHA-256 hash for audit trail integrity.
            </div>
        </div>
    );
};

/**
 * MeasurementMethodSelector Component
 */

interface MeasurementMethodSelectorProps {
    method: 'FEELER_GAUGE' | 'MICROMETER' | 'DIAL_INDICATOR' | 'LASER';
    onChange: (method: 'FEELER_GAUGE' | 'MICROMETER' | 'DIAL_INDICATOR' | 'LASER') => void;
}

export const MeasurementMethodSelector: React.FC<MeasurementMethodSelectorProps> = ({
    method,
    onChange
}) => {
    const methods: Array<{
        value: 'FEELER_GAUGE' | 'MICROMETER' | 'DIAL_INDICATOR' | 'LASER';
        label: string;
        icon: string;
    }> = [
            { value: 'FEELER_GAUGE', label: 'Feeler Gauge', icon: '📏' },
            { value: 'MICROMETER', label: 'Micrometer', icon: '🔧' },
            { value: 'DIAL_INDICATOR', label: 'Dial Indicator', icon: '⏱️' },
            { value: 'LASER', label: 'Laser Scanner', icon: '🔴' }
        ];

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-white">
                Measurement Method
            </label>
            <div className="grid grid-cols-2 gap-3">
                {methods.map(m => (
                    <button
                        key={m.value}
                        onClick={() => onChange(m.value)}
                        className={`py-3 px-4 rounded font-bold transition-all flex items-center gap-2 justify-center ${method === m.value
                                ? 'bg-[#2dd4bf] text-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-xl">{m.icon}</span>
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
