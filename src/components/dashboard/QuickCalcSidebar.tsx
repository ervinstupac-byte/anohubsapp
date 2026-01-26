import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, X, Copy, Check, ArrowLeftRight } from 'lucide-react';
import Decimal from 'decimal.js';

/**
 * QuickCalcSidebar — Field Utility Tool
 * 
 * Floating action button that expands into precision unit converters.
 * Uses Decimal.js for all calculations to maintain engineering precision.
 * 
 * Converters:
 * - Pressure: bar ↔ psi
 * - Distance: mm ↔ inch
 * - Temperature: °C ↔ °F
 */

// Conversion constants with high precision
const CONVERSIONS = {
    bar_to_psi: new Decimal('14.5037737797'),
    psi_to_bar: new Decimal('0.0689475729'),
    mm_to_inch: new Decimal('0.0393700787'),
    inch_to_mm: new Decimal('25.4'),
};

interface ConverterConfig {
    id: string;
    name: string;
    leftUnit: string;
    rightUnit: string;
    leftToRight: (val: Decimal) => Decimal;
    rightToLeft: (val: Decimal) => Decimal;
    precision: number;
}

const CONVERTERS: ConverterConfig[] = [
    {
        id: 'pressure',
        name: 'Pressure',
        leftUnit: 'bar',
        rightUnit: 'psi',
        leftToRight: (val) => val.mul(CONVERSIONS.bar_to_psi),
        rightToLeft: (val) => val.mul(CONVERSIONS.psi_to_bar),
        precision: 4
    },
    {
        id: 'distance',
        name: 'Distance',
        leftUnit: 'mm',
        rightUnit: 'inch',
        leftToRight: (val) => val.mul(CONVERSIONS.mm_to_inch),
        rightToLeft: (val) => val.mul(CONVERSIONS.inch_to_mm),
        precision: 4
    },
    {
        id: 'torque',
        name: 'Torque',
        leftUnit: 'Nm',
        rightUnit: 'lbf·ft',
        leftToRight: (val) => val.mul(new Decimal('0.7375621493')),
        rightToLeft: (val) => val.mul(new Decimal('1.3558179483')),
        precision: 2
    },
    {
        id: 'temperature',
        name: 'Temperature',
        leftUnit: '°C',
        rightUnit: '°F',
        leftToRight: (val) => val.mul(new Decimal('1.8')).plus(32),
        rightToLeft: (val) => val.minus(32).div(new Decimal('1.8')),
        precision: 2
    }
];

interface ConverterState {
    leftValue: string;
    rightValue: string;
    activeField: 'left' | 'right';
}

export const QuickCalcSidebar: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [converters, setConverters] = useState<Record<string, ConverterState>>(() => {
        const initial: Record<string, ConverterState> = {};
        CONVERTERS.forEach(c => {
            initial[c.id] = { leftValue: '', rightValue: '', activeField: 'left' };
        });
        return initial;
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleValueChange = useCallback((
        converterId: string,
        field: 'left' | 'right',
        inputValue: string
    ) => {
        const converter = CONVERTERS.find(c => c.id === converterId);
        if (!converter) return;

        // Allow empty or partial input
        if (inputValue === '' || inputValue === '-') {
            setConverters(prev => ({
                ...prev,
                [converterId]: { leftValue: field === 'left' ? inputValue : '', rightValue: field === 'right' ? inputValue : '', activeField: field }
            }));
            return;
        }

        try {
            const value = new Decimal(inputValue);
            let leftVal = '';
            let rightVal = '';

            if (field === 'left') {
                leftVal = inputValue;
                rightVal = converter.leftToRight(value).toFixed(converter.precision);
            } else {
                rightVal = inputValue;
                leftVal = converter.rightToLeft(value).toFixed(converter.precision);
            }

            setConverters(prev => ({
                ...prev,
                [converterId]: { leftValue: leftVal, rightValue: rightVal, activeField: field }
            }));
        } catch {
            // Invalid number, just update the input field
            setConverters(prev => ({
                ...prev,
                [converterId]: {
                    ...prev[converterId],
                    [field === 'left' ? 'leftValue' : 'rightValue']: inputValue,
                    activeField: field
                }
            }));
        }
    }, []);

    const copyToClipboard = useCallback(async (value: string, id: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            console.error('Failed to copy');
        }
    }, []);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed bottom-6 right-6 z-50
                    w-14 h-14 rounded-full
                    bg-gradient-to-br from-cyan-500 to-blue-600
                    shadow-[0_0_20px_rgba(6,182,212,0.4)]
                    hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
                    flex items-center justify-center
                    transition-all duration-300
                    ${isOpen ? 'rotate-45' : 'rotate-0'}
                `}
                title={t('dashboard.quickCalc.title')}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Calculator className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Sidebar Panel */}
            <div
                className={`
                    fixed right-0 top-0 bottom-0 z-40
                    w-96 bg-slate-950/95 backdrop-blur-xl
                    border-l border-white/10
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    overflow-y-auto
                `}
            >
                {/* Header */}
                <div className="sticky top-0 bg-slate-950/90 backdrop-blur-sm border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <Calculator className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                    Unit Converter
                                </h2>
                                <p className="text-[10px] text-slate-500 font-mono">
                                    Decimal.js Precision
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Converters */}
                <div className="p-4 space-y-6">
                    {CONVERTERS.map((converter) => (
                        <div
                            key={converter.id}
                            className="p-4 bg-slate-900/50 rounded-2xl border border-white/5"
                        >
                            <div className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-4">
                                {converter.name}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Left Input */}
                                <div className="flex-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                                        {converter.leftUnit}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={converters[converter.id]?.leftValue || ''}
                                            onChange={(e) => handleValueChange(converter.id, 'left', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-white text-lg font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="0"
                                        />
                                        {converters[converter.id]?.leftValue && (
                                            <button
                                                onClick={() => copyToClipboard(converters[converter.id].leftValue, `${converter.id}-left`)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded transition-colors"
                                                title="Copy"
                                            >
                                                {copiedId === `${converter.id}-left` ? (
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 px-1">
                                    <ArrowLeftRight className="w-4 h-4 text-slate-600" />
                                </div>

                                {/* Right Input */}
                                <div className="flex-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                                        {converter.rightUnit}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={converters[converter.id]?.rightValue || ''}
                                            onChange={(e) => handleValueChange(converter.id, 'right', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-white text-lg font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="0"
                                        />
                                        {converters[converter.id]?.rightValue && (
                                            <button
                                                onClick={() => copyToClipboard(converters[converter.id].rightValue, `${converter.id}-right`)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded transition-colors"
                                                title="Copy"
                                            >
                                                {copiedId === `${converter.id}-right` ? (
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <p className="text-[9px] text-slate-600 text-center font-mono">
                        High-precision calculations using Decimal.js
                    </p>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
