// Auto-Report Generator UI - One-Click Service Report
// Integrates with AutoReportService for PDF generation

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Sparkles, CheckCircle } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { autoReportService, ServiceMeasurement } from '../services/AutoReportService';
import { useAssetContext } from '../contexts/AssetContext';

export const AutoReportGenerator: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const [isGenerating, setIsGenerating] = useState(false);
    const [measurements, setMeasurements] = useState<ServiceMeasurement[]>([
        {
            parameter: 'Vibration (Horizontal)',
            asFound: 5.2,
            asLeft: 3.1,
            unit: 'mm/s',
            standard: 4.5,
            improvement: -40.4
        },
        {
            parameter: 'Shaft Alignment',
            asFound: 0.082,
            asLeft: 0.038,
            unit: 'mm/m',
            standard: 0.05,
            improvement: -53.7
        },
        {
            parameter: 'Cavitation Index',
            asFound: 7.8,
            asLeft: 5.2,
            unit: '(0-10)',
            standard: 5.0,
            improvement: -33.3
        },
        {
            parameter: 'Bearing Temperature (Upper)',
            asFound: 78.5,
            asLeft: 68.2,
            unit: '°C',
            standard: 70.0,
            improvement: -13.1
        },
        {
            parameter: 'Hydraulic Efficiency',
            asFound: 89.5,
            asLeft: 92.3,
            unit: '%',
            standard: 92.0,
            improvement: 3.1
        }
    ]);

    const [serviceType, setServiceType] = useState('Centriranje vratila i optimizacija lopatica');
    const [engineerName, setEngineerName] = useState('Ervin Stupac');

    const handleGenerate = async () => {
        if (!selectedAsset) {
            alert('Molimo odaberite turbinu');
            return;
        }

        setIsGenerating(true);

        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const blob = autoReportService.quickGenerateFromMeasurements(
            selectedAsset as any, // Cast to any or EnhancedAsset if imported
            measurements,
            serviceType,
            engineerName
        );

        // Download
        autoReportService.reportGen.downloadReport(
            blob,
            `ServiceReport_${selectedAsset.name}_${new Date().toISOString().split('T')[0]}.pdf`
        );

        setIsGenerating(false);
    };

    const addMeasurement = () => {
        setMeasurements([
            ...measurements,
            {
                parameter: 'New Parameter',
                asFound: 0,
                asLeft: 0,
                unit: '',
                standard: 0,
                improvement: 0
            }
        ]);
    };

    const updateMeasurement = (index: number, field: keyof ServiceMeasurement, value: any) => {
        const updated = [...measurements];
        (updated[index] as any)[field] = value;

        // Auto-calculate improvement
        if (field === 'asFound' || field === 'asLeft') {
            const asFound = updated[index].asFound;
            const asLeft = updated[index].asLeft;
            updated[index].improvement = ((asLeft - asFound) / asFound) * 100;
        }

        setMeasurements(updated);
    };

    if (!selectedAsset) {
        return (
            <GlassCard className="max-w-4xl mx-auto text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Odaberite turbinu za generisanje izvještaja</p>
            </GlassCard>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Auto-Report</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-2">
                        Generator
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    AI-powered PDF izvještaj za {selectedAsset.name}
                </p>
            </div>

            {/* Service Info */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-black text-white mb-4">Informacije o servisu</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                            Tip servisa
                        </label>
                        <input
                            type="text"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                            Inžinjer
                        </label>
                        <input
                            type="text"
                            value={engineerName}
                            onChange={(e) => setEngineerName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Measurements Table */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-white">Mjerenja (As-Found / As-Left)</h3>
                    <button
                        onClick={addMeasurement}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-400 text-xs font-bold hover:bg-purple-500/30 transition-colors"
                    >
                        + Dodaj mjerenje
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-2 px-2 text-slate-400 font-bold uppercase">Parametar</th>
                                <th className="text-left py-2 px-2 text-slate-400 font-bold uppercase">As-Found</th>
                                <th className="text-left py-2 px-2 text-slate-400 font-bold uppercase">As-Left</th>
                                <th className="text-left py-2 px-2 text-slate-400 font-bold uppercase">Unit</th>
                                <th className="text-left py-2 px-2 text-slate-400 font-bold uppercase">Standard</th>
                                <th className="text-left py-2 px-2 text-slate-400 font-bold uppercase">Improvement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {measurements.map((m, index) => (
                                <tr key={index} className="border-b border-slate-800">
                                    <td className="py-2 px-2">
                                        <input
                                            type="text"
                                            value={m.parameter}
                                            onChange={(e) => updateMeasurement(index, 'parameter', e.target.value)}
                                            className="w-full px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-white text-xs"
                                        />
                                    </td>
                                    <td className="py-2 px-2">
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={m.asFound}
                                            onChange={(e) => updateMeasurement(index, 'asFound', parseFloat(e.target.value))}
                                            className="w-20 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-white text-xs"
                                        />
                                    </td>
                                    <td className="py-2 px-2">
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={m.asLeft}
                                            onChange={(e) => updateMeasurement(index, 'asLeft', parseFloat(e.target.value))}
                                            className="w-20 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-white text-xs"
                                        />
                                    </td>
                                    <td className="py-2 px-2">
                                        <input
                                            type="text"
                                            value={m.unit}
                                            onChange={(e) => updateMeasurement(index, 'unit', e.target.value)}
                                            className="w-16 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-white text-xs"
                                        />
                                    </td>
                                    <td className="py-2 px-2">
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={m.standard}
                                            onChange={(e) => updateMeasurement(index, 'standard', parseFloat(e.target.value))}
                                            className="w-20 px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-white text-xs"
                                        />
                                    </td>
                                    <td className="py-2 px-2">
                                        <span className={`font-bold ${m.improvement < 0 ? 'text-emerald-400' : m.improvement > 0 ? 'text-amber-400' : 'text-slate-400'
                                            }`}>
                                            {m.improvement > 0 ? '+' : ''}{m.improvement.toFixed(1)}%
                                            {m.improvement < 0 && ' ✓'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* AI Preview */}
            <GlassCard className="p-6 bg-gradient-to-br from-purple-950/30 to-pink-950/30 border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-black text-white">AI generiše automatski:</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>
                            <strong className="text-purple-400">Akustična analiza:</strong> "Kavitacija smanjena za 15% nakon optimizacije kuta lopatica"
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>
                            <strong className="text-purple-400">Vibracije:</strong> Procjena produženja životnog vijeka ležajeva
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>
                            <strong className="text-purple-400">12-mjesečne preporuke:</strong> Prilagođeno tipu turbine (Francis/Kaplan/Pelton)
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>
                            <strong className="text-purple-400">Posljedice ignorisanja:</strong> Procjena rizika i troškova zastoja
                        </span>
                    </li>
                </ul>
            </GlassCard>

            {/* Generate Button */}
            <div className="text-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-12 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl font-black uppercase text-white text-lg flex items-center gap-3 mx-auto hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Sparkles className="w-6 h-6 animate-spin" />
                            Generišem izvještaj...
                        </>
                    ) : (
                        <>
                            <Download className="w-6 h-6" />
                            Generiši PDF Izvještaj
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};
