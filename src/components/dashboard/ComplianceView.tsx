import React from 'react';
import { FileCheck, Activity, BarChart2, Shield } from 'lucide-react';

interface ComplianceViewProps {
    report: {
        lastTestDate: string;
        overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
        rejection: {
            speed: number;
            pressure: number;
            passed: boolean;
        };
        step: {
            damping: number;
            riseTime: number;
        };
    };
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ report }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-900/30 rounded-full">
                    <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Performance Verification</h2>
                    <p className="text-xs text-slate-400">IEEE/IEC Grid Code Compliance • {report.overallStatus}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">

                {/* 1. LOAD REJECTION */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-400" />
                        Load Rejection (Trip)
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div>
                                <div className="text-xs text-slate-400">Peak Overspeed</div>
                                <div className={`text-xl font-mono font-bold ${report.rejection.speed > 135 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {report.rejection.speed.toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Limit</div>
                                <div className="text-xs font-mono">135.0%</div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div>
                                <div className="text-xs text-slate-400">Peak Pressure</div>
                                <div className={`text-xl font-mono font-bold ${report.rejection.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {report.rejection.pressure.toFixed(1)} bar
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Result</div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.rejection.passed ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                                    {report.rejection.passed ? 'PASS' : 'FAIL'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. STEP RESPONSE */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-blue-400" />
                        Governor Step Response
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Damping (Zeta)</div>
                                <div className={`text-xl font-mono font-bold ${report.step.damping < 0.3 ? 'text-amber-400' : 'text-blue-300'}`}>
                                    {report.step.damping.toFixed(3)}
                                </div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Rise Time</div>
                                <div className="text-xl font-mono font-bold text-white">
                                    {report.step.riseTime.toFixed(2)}s
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded bg-slate-800/50 border border-slate-600 text-center">
                            <div className="text-xs text-slate-500 mb-1">Grid Readiness</div>
                            <div className={`text-lg font-bold ${report.overallStatus === 'COMPLIANT' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {report.overallStatus === 'COMPLIANT' ? 'READY FOR SERVICE' : 'TUNING REQUIRED'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. REPORT DOWNLOAD */}
                <div className="col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-purple-400" />
                        <div>
                            <div className="text-sm font-bold text-white">Official Certificate</div>
                            <div className="text-xs text-slate-400">Last Generated: {report.lastTestDate}</div>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors">
                        Download IEEE Report
                    </button>
                </div>

            </div>
        </div>
    );
};
