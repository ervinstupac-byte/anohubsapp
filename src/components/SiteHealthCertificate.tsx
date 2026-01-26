import React from 'react';
import { Shield, Fish, Activity, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { ComplianceReport } from '../services/AuditorExportService';

interface SiteHealthCertificateProps {
    stationName: string;
    version: string;
    stats: {
        totalGeneratedkW: number;
        totalMoneyLeakkW: number;
        safetyStatus: 'SECURE' | 'AT_RISK';
        complianceStatus: 'COMPLIANT' | 'BREACHED';
        activeAlarms: number;
    };
    onExportReport: () => void;
}

export function SiteHealthCertificate({
    stationName,
    version,
    stats,
    onExportReport
}: SiteHealthCertificateProps) {

    // Calculate leak percentage
    const lossPercentage = (stats.totalMoneyLeakkW / (stats.totalGeneratedkW + stats.totalMoneyLeakkW)) * 100;

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-xl overflow-hidden border-4 border-slate-700 shadow-2xl">
            {/* HERDER */}
            <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        {stationName}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-mono border border-emerald-500/30">
                            v{version} STABLE
                        </span>
                        <span className="text-slate-400 text-sm">System Health Certificate</span>
                    </div>
                </div>
                <div className="h-16 w-16 bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-slate-600">
                    <Shield className="w-8 h-8 text-emerald-400" />
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* LEFT COLUMN: VITAL SIGNS */}
                <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Vital Signs</h3>

                    {/* PRODUCTION vs LOSS */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-slate-400 text-sm">Efficiency Balance</span>
                            <span className="text-red-400 text-xs font-mono">{lossPercentage.toFixed(2)}% LOSS</span>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${100 - lossPercentage}%` }}
                            />
                            <div
                                className="h-full bg-red-500/80 stripe-pattern"
                                style={{ width: `${lossPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-mono">
                            <span className="text-emerald-400">{stats.totalGeneratedkW.toLocaleString()} kW GENERATED</span>
                            <span className="text-red-400">{stats.totalMoneyLeakkW.toLocaleString()} kW LEAKING</span>
                        </div>
                    </div>

                    {/* STATUS GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${stats.safetyStatus === 'SECURE' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className={`w-5 h-5 ${stats.safetyStatus === 'SECURE' ? 'text-emerald-400' : 'text-red-400'}`} />
                                <span className="font-bold text-sm">SAFETY SHIELD</span>
                            </div>
                            <div className={`text-lg font-bold ${stats.safetyStatus === 'SECURE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stats.safetyStatus}
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg border ${stats.complianceStatus === 'COMPLIANT' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Fish className={`w-5 h-5 ${stats.complianceStatus === 'COMPLIANT' ? 'text-blue-400' : 'text-orange-400'}`} />
                                <span className="font-bold text-sm">ECOLOGICAL</span>
                            </div>
                            <div className={`text-lg font-bold ${stats.complianceStatus === 'COMPLIANT' ? 'text-blue-400' : 'text-orange-400'}`}>
                                {stats.complianceStatus}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CERTIFICATION & SEAL */}
                <div className="flex flex-col items-center justify-center space-y-6 text-center border-l border-slate-800 pl-8">

                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full"></div>
                        <div className="relative border-4 border-emerald-500/30 rounded-full p-8 bg-slate-900">
                            <CheckCircle className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
                            VERIFIED
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">SYSTEM CERTIFIED</h2>
                        <ul className="text-sm text-slate-400 space-y-1">
                            <li className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> All Systems Woven
                            </li>
                            <li className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> All Monsters Detected
                            </li>
                            <li className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> All Stories Recorded
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={onExportReport}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors group"
                    >
                        <FileText className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                        <span>Export Compliance PDF</span>
                    </button>

                </div>
            </div>

            {/* FOOTER */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
                SIGNED BY: SCADA NERVOUS SYSTEM • {new Date().toLocaleDateString()} • ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </div>
    );
}
