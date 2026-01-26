import React from 'react';
import { Lock, Unlock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyInterlock {
    id: string;
    name: string;
    status: 'OK' | 'NOT_OK';
    value: any;
    required: boolean;
}

interface SafetyMatrixProps {
    assetId: string;
    interlocks: {
        oil: SafetyInterlock[];
        cooling: SafetyInterlock[];
        brake: SafetyInterlock[];
        electrical: SafetyInterlock[];
    };
    permissionToStart: boolean;
}

export const SafetyMatrix: React.FC<SafetyMatrixProps> = ({ assetId, interlocks, permissionToStart }) => {
    const allInterlocks = [
        ...interlocks.oil,
        ...interlocks.cooling,
        ...interlocks.brake,
        ...interlocks.electrical
    ];

    const failedInterlocks = allInterlocks.filter(i => i.required && i.status !== 'OK');
    const totalRequired = allInterlocks.filter(i => i.required).length;
    const totalOk = allInterlocks.filter(i => i.required && i.status === 'OK').length;

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                {permissionToStart ? (
                    <Unlock className="w-6 h-6 text-emerald-400" />
                ) : (
                    <Lock className="w-6 h-6 text-red-400" />
                )}
                Safety Interlock Matrix - {assetId}
            </div>

            {/* Permission Status */}
            <div className={`mb-6 p-4 rounded-lg border-2 ${permissionToStart
                    ? 'bg-emerald-950 border-emerald-500'
                    : 'bg-red-950 border-red-500'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold mb-1">
                            {permissionToStart ? (
                                <span className="text-emerald-300">✓ PERMISSION TO START</span>
                            ) : (
                                <span className="text-red-300">✗ LOCKED - CANNOT START</span>
                            )}
                        </div>
                        <div className="text-sm text-slate-400">
                            {totalOk} / {totalRequired} required conditions met
                        </div>
                    </div>
                    {permissionToStart ? (
                        <CheckCircle className="w-16 h-16 text-emerald-400" />
                    ) : (
                        <AlertTriangle className="w-16 h-16 text-red-400 animate-pulse" />
                    )}
                </div>

                {!permissionToStart && failedInterlocks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-500/30">
                        <div className="text-sm font-bold text-red-300 mb-2">Failed Conditions:</div>
                        <ul className="space-y-1">
                            {failedInterlocks.map((interlock, i) => (
                                <li key={i} className="text-xs text-red-400">
                                    • {interlock.name}: {JSON.stringify(interlock.value)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Cause & Effect Logic Gates */}
            <div className="grid grid-cols-2 gap-6">
                {/* Oil System */}
                <InterlockGroup
                    title="Lubrication Oil System"
                    icon="🛢️"
                    interlocks={interlocks.oil}
                />

                {/* Cooling System */}
                <InterlockGroup
                    title="Cooling Water System"
                    icon="❄️"
                    interlocks={interlocks.cooling}
                />

                {/* Brake System */}
                <InterlockGroup
                    title="Mechanical Brake"
                    icon="🔧"
                    interlocks={interlocks.brake}
                />

                {/* Electrical */}
                <InterlockGroup
                    title="Electrical Protection"
                    icon="⚡"
                    interlocks={interlocks.electrical}
                />
            </div>

            {/* Logic Diagram */}
            <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-6">
                <div className="text-sm font-bold text-slate-300 mb-4">Cause & Effect Logic</div>

                <div className="flex items-center justify-center">
                    <svg width="800" height="200" className="text-slate-400">
                        {/* Oil AND gate */}
                        <g>
                            <rect x="20" y="20" width="120" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                            <text x="80" y="45" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">OIL OK</text>
                            <line x1="140" y1="40" x2="180" y2="40" stroke="#64748b" strokeWidth="2" />
                        </g>

                        {/* Cooling AND gate */}
                        <g>
                            <rect x="20" y="80" width="120" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                            <text x="80" y="105" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">COOLING OK</text>
                            <line x1="140" y1="100" x2="180" y2="100" stroke="#64748b" strokeWidth="2" />
                        </g>

                        {/* Brake AND gate */}
                        <g>
                            <rect x="20" y="140" width="120" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                            <text x="80" y="165" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">BRAKE OK</text>
                            <line x1="140" y1="160" x2="180" y2="160" stroke="#64748b" strokeWidth="2" />
                        </g>

                        {/* AND gate symbol */}
                        <g>
                            <path d="M 180 30 L 180 170 L 220 170 L 220 30 Z M 220 100 Q 260 100 260 50 Q 260 150 220 150"
                                fill="none" stroke={permissionToStart ? '#10b981' : '#ef4444'} strokeWidth="3" />
                            <text x="200" y="105" textAnchor="middle" fill={permissionToStart ? '#10b981' : '#ef4444'} fontSize="14" fontWeight="bold">AND</text>
                            <line x1="260" y1="100" x2="320" y2="100" stroke={permissionToStart ? '#10b981' : '#ef4444'} strokeWidth="3" />
                        </g>

                        {/* Permission output */}
                        <g>
                            <rect x="320" y="70" width="180" height="60"
                                fill={permissionToStart ? '#064e3b' : '#7f1d1d'}
                                stroke={permissionToStart ? '#10b981' : '#ef4444'}
                                strokeWidth="3" rx="8" />
                            <text x="410" y="105" textAnchor="middle"
                                fill={permissionToStart ? '#10b981' : '#ef4444'}
                                fontSize="16" fontWeight="bold">
                                {permissionToStart ? 'START ENABLED' : 'START LOCKED'}
                            </text>
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    );
};

// Interlock Group Component
const InterlockGroup: React.FC<{
    title: string;
    icon: string;
    interlocks: SafetyInterlock[];
}> = ({ title, icon, interlocks }) => {
    const allOk = interlocks.every(i => !i.required || i.status === 'OK');

    return (
        <div className={`bg-slate-900 border rounded-lg p-4 ${allOk ? 'border-emerald-500/30' : 'border-red-500/30'
            }`}>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                    <div className="text-sm font-bold text-white">{title}</div>
                    <div className={`text-xs ${allOk ? 'text-emerald-400' : 'text-red-400'}`}>
                        {allOk ? 'All conditions met' : 'Failed conditions detected'}
                    </div>
                </div>
                {allOk ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
            </div>

            <div className="space-y-2">
                {interlocks.map((interlock, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between text-xs p-2 rounded ${interlock.status === 'OK'
                                ? 'bg-emerald-950/30 text-emerald-300'
                                : 'bg-red-950/30 text-red-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${interlock.status === 'OK' ? 'bg-emerald-500' : 'bg-red-500'
                                }`} />
                            <span>{interlock.name}</span>
                            {interlock.required && (
                                <span className="text-[10px] text-amber-400">(Required)</span>
                            )}
                        </div>
                        <span className="font-mono">{JSON.stringify(interlock.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
