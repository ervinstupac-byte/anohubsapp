import React from 'react';
import { useAIPrediction } from '../../../contexts/AIPredictionContext.tsx';
import { useAssetContext } from '../../../contexts/AssetContext.tsx';
import { GlassCard } from '../../../shared/components/ui/GlassCard.tsx';

export const MultiSensorCorrelation: React.FC = () => {
    const { synergeticRisks } = useAIPrediction();
    const { selectedAsset } = useAssetContext();

    if (!selectedAsset) return null;

    const risk = synergeticRisks[selectedAsset.id];
    if (!risk) return null;

    const { detected, probability, triggers, message } = risk;

    // Calculate radar chart positions
    const radius = 60;
    const centerX = 80;
    const centerY = 80;

    const acousticAngle = -90; // Top
    const thermalAngle = 30;   // Bottom right
    const hydraulicAngle = 150; // Bottom left

    const getPointPosition = (angle: number, value: number) => {
        const rad = (angle * Math.PI) / 180;
        const r = radius * value;
        return {
            x: centerX + r * Math.cos(rad),
            y: centerY + r * Math.sin(rad)
        };
    };

    const acousticPos = getPointPosition(acousticAngle, triggers.acoustic ? 1 : 0.3);
    const thermalPos = getPointPosition(thermalAngle, triggers.thermal ? 1 : 0.3);
    const hydraulicPos = getPointPosition(hydraulicAngle, triggers.hydraulic ? 1 : 0.3);

    return (
        <GlassCard className={`border-l-4 ${detected ? 'border-l-red-500 bg-red-950/20' : 'border-l-cyan-500 bg-slate-900/40'}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">
                        🕷️ Multi-Sensor Correlation (Spider Logic)
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        Istovremeno praćenje 3 kritična parametra za detekciju sinergetskog rizika
                    </p>
                </div>
                {detected && (
                    <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg animate-pulse">
                        <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                            {probability}% RISK
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Radar Chart */}
                <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
                    {/* Background circles */}
                    <circle cx={centerX} cy={centerY} r="20" fill="none" stroke="#1e293b" strokeWidth="1" />
                    <circle cx={centerX} cy={centerY} r="40" fill="none" stroke="#1e293b" strokeWidth="1" />
                    <circle cx={centerX} cy={centerY} r="60" fill="none" stroke="#334155" strokeWidth="1.5" />

                    {/* Axis lines */}
                    <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - radius} stroke="#475569" strokeWidth="1" />
                    <line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(30 * Math.PI / 180)} y2={centerY + radius * Math.sin(30 * Math.PI / 180)} stroke="#475569" strokeWidth="1" />
                    <line x1={centerX} y1={centerY} x2={centerX + radius * Math.cos(150 * Math.PI / 180)} y2={centerY + radius * Math.sin(150 * Math.PI / 180)} stroke="#475569" strokeWidth="1" />

                    {/* Triangle connection */}
                    <path
                        d={`M ${acousticPos.x} ${acousticPos.y} L ${thermalPos.x} ${thermalPos.y} L ${hydraulicPos.x} ${hydraulicPos.y} Z`}
                        fill={detected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.1)'}
                        stroke={detected ? '#ef4444' : '#06b6d4'}
                        strokeWidth="2"
                    />

                    {/* Data points */}
                    <circle
                        cx={acousticPos.x}
                        cy={acousticPos.y}
                        r={triggers.acoustic ? "8" : "5"}
                        fill={triggers.acoustic ? '#f59e0b' : '#64748b'}
                        className={triggers.acoustic ? 'animate-pulse' : ''}
                    />
                    <circle
                        cx={thermalPos.x}
                        cy={thermalPos.y}
                        r={triggers.thermal ? "8" : "5"}
                        fill={triggers.thermal ? '#ef4444' : '#64748b'}
                        className={triggers.thermal ? 'animate-pulse' : ''}
                    />
                    <circle
                        cx={hydraulicPos.x}
                        cy={hydraulicPos.y}
                        r={triggers.hydraulic ? "8" : "5"}
                        fill={triggers.hydraulic ? '#3b82f6' : '#64748b'}
                        className={triggers.hydraulic ? 'animate-pulse' : ''}
                    />

                    {/* Center indicator */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r="6"
                        fill={detected ? '#ef4444' : '#0891b2'}
                        className={detected ? 'animate-pulse' : ''}
                    />

                    {/* Labels */}
                    <text x={centerX} y={centerY - radius - 10} fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">ACOUSTIC</text>
                    <text x={centerX + radius + 15} y={centerY + radius / 2} fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="start">THERMAL</text>
                    <text x={centerX - radius - 15} y={centerY + radius / 2} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="end">HYDRAULIC</text>
                </svg>

                {/* Status indicators */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${triggers.acoustic ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <span className={`text-xs font-bold ${triggers.acoustic ? 'text-amber-400' : 'text-slate-500'}`}>
                            Akustični potpis (kavitacija)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${triggers.thermal ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <span className={`text-xs font-bold ${triggers.thermal ? 'text-red-400' : 'text-slate-500'}`}>
                            Termalni trend (ležaj)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${triggers.hydraulic ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <span className={`text-xs font-bold ${triggers.hydraulic ? 'text-blue-400' : 'text-slate-500'}`}>
                            Hidraulička stabilnost
                        </span>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg border ${detected ? 'bg-red-950/30 border-red-500/30' : 'bg-slate-900/30 border-slate-700/30'}`}>
                        <p className={`text-[10px] font-bold ${detected ? 'text-red-300' : 'text-slate-400'}`}>
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
