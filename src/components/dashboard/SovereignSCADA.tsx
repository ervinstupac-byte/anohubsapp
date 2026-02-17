import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, Settings, Power, Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { UnityPulse } from './SovereignDashboardV2';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

interface TurbineStatus {
    id: string;
    name: string;
    type: 'FRANCIS' | 'KAPLAN' | 'PELTON' | 'BANKI';
    status: 'OPTIMAL' | 'MONITORING' | 'DEGRADED' | 'OFFLINE';
    load: number; // MW
    capacity: number; // MW
    heff: number; // 0-1
    vibration: number; // mm/s
    temperature: number; // °C
}

export const SovereignSCADA: React.FC = () => {
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'OVERVIEW' | 'DETAIL' | 'TRENDS'>('OVERVIEW');

    // Simulated fleet data
    const fleet: TurbineStatus[] = [
        { id: 'UNIT-1', name: 'Zakučac 1', type: 'FRANCIS', status: 'OPTIMAL', load: 42, capacity: 50, heff: 0.93, vibration: 1.6, temperature: 38 },
        { id: 'UNIT-2', name: 'Zakučac 2', type: 'FRANCIS', status: 'OPTIMAL', load: 45, capacity: 50, heff: 0.92, vibration: 1.8, temperature: 40 },
        { id: 'UNIT-3', name: 'Peruća K1', type: 'KAPLAN', status: 'DEGRADED', load: 30, capacity: 40, heff: 0.89, vibration: 2.3, temperature: 42 },
        { id: 'UNIT-4', name: 'Peruća K2', type: 'KAPLAN', status: 'OPTIMAL', load: 38, capacity: 40, heff: 0.94, vibration: 1.4, temperature: 36 },
        { id: 'UNIT-5', name: 'Senj P1', type: 'PELTON', status: 'MONITORING', load: 30, capacity: 35, heff: 0.90, vibration: 2.0, temperature: 39 },
        { id: 'UNIT-6', name: 'Lešće BM1', type: 'BANKI', status: 'MONITORING', load: 18, capacity: 25, heff: 0.85, vibration: 2.6, temperature: 44 }
    ];

    const totalLoad = fleet.reduce((sum, u) => sum + u.load, 0);
    const totalCapacity = fleet.reduce((sum, u) => sum + u.capacity, 0);

    return (
        <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden">
            {/* ISA 101 Header Bar */}
            <div className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
                        <span className="text-xl font-bold">HYDRO INTELLIGENCE PLATFORM</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                        Analysis Core v31.0 | Unity Index: 1.000
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Power className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-mono">
                            {totalLoad.toFixed(0)} / {totalCapacity} MW
                        </span>
                    </div>
                    <div className="text-xs text-slate-400">
                        {new Date().toLocaleTimeString('hr-HR')}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="h-[calc(100vh-4rem)] flex">

                {/* Left Sidebar - Fleet Overview */}
                <div className="w-80 bg-slate-900 border-r border-slate-700 p-4 overflow-y-auto">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                        Fleet Status
                    </div>

                    <div className="space-y-2">
                        {fleet.map((unit) => {
                            const loadPct = (unit.load / unit.capacity) * 100;
                            const statusColors = {
                                OPTIMAL: 'emerald',
                                MONITORING: 'amber',
                                DEGRADED: 'orange',
                                OFFLINE: 'red'
                            };
                            const color = statusColors[unit.status];

                            return (
                                <div
                                    key={unit.id}
                                    onClick={() => setSelectedUnit(unit.id)}
                                    className={`p-3 rounded-none cursor-pointer transition-all ${selectedUnit === unit.id
                                            ? `bg-${color}-950 border-2 border-${color}-500`
                                            : 'bg-slate-800 border border-slate-700 hover:bg-slate-750'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="text-sm font-bold">{unit.id}</div>
                                            <div className="text-xs text-slate-400">{unit.name}</div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-none bg-${color}-500 animate-pulse`} />
                                    </div>

                                    <div className="relative h-2 bg-slate-700 rounded-none overflow-hidden mb-2">
                                        <div
                                            className={`absolute inset-y-0 left-0 bg-${color}-500 transition-all`}
                                            style={{ width: `${loadPct}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <div className="text-slate-500 text-[10px]">Load</div>
                                            <div className="font-mono">{unit.load.toFixed(0)}MW</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-[10px]">H_eff</div>
                                            <div className="font-mono">{(unit.heff * 100).toFixed(0)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-[10px]">Vib</div>
                                            <div className="font-mono">{unit.vibration.toFixed(1)}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Center - Main Display */}
                <div className="flex-1 bg-slate-950 p-6">
                    {viewMode === 'OVERVIEW' && (
                        <div className="h-full flex flex-col">
                            {/* Digital Twin - Unity Pulse Integration */}
                            <div className="flex-1 flex items-center justify-center">
                                <UnityPulse
                                    liveROI={125480}
                                    systemIntegrity={97.3}
                                    unityIndex={1.0}
                                />
                            </div>

                            {/* Fleet Status Bar */}
                            <div className="grid grid-cols-6 gap-4 mt-6">
                                {fleet.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="bg-slate-800 border border-slate-700 rounded-none p-3 text-center"
                                    >
                                        <div className="text-xs text-slate-400 mb-1">{unit.id}</div>
                                        <div className="text-2xl font-bold font-mono mb-1">
                                            {unit.load}<span className="text-sm text-slate-500">MW</span>
                                        </div>
                                        <div className="text-xs text-emerald-400">
                                            {(unit.heff * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewMode === 'DETAIL' && selectedUnit && (
                        <TurbineDetailView unit={fleet.find(u => u.id === selectedUnit)!} />
                    )}

                    {viewMode === 'TRENDS' && (
                        <TrendsView />
                    )}
                </div>

                {/* Right Sidebar - Control Panel */}
                <div className="w-96 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto">
                    <SovereignCommandPanel selectedUnit={selectedUnit} />
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-slate-800 border border-slate-700 rounded-none p-2">
                {['OVERVIEW', 'DETAIL', 'TRENDS'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as any)}
                        className={`px-4 py-2 rounded-none text-sm font-mono transition-all ${viewMode === mode
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Turbine Detail P&ID View
const TurbineDetailView: React.FC<{ unit: TurbineStatus }> = ({ unit }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="text-2xl font-bold mb-4">{unit.id} - {unit.type} Turbine</div>

            <div className="flex-1 bg-slate-900 rounded-none border border-slate-700 p-6 relative">
                {/* Simplified P&ID - would be full SVG schematic in production */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⚙️</div>
                        <div className="text-xl font-bold">{unit.type}</div>
                        <div className="text-sm text-slate-400 mt-2">
                            P&ID Schematic (SVG would render here)
                        </div>
                    </div>
                </div>

                {/* Sensor Overlays */}
                <div className="absolute top-6 right-6 bg-slate-800/90 border border-slate-700 rounded-none p-3 space-y-2">
                    <SensorBadge label="VIB_BEARING_1" value={`${unit.vibration} mm/s`} status="normal" />
                    <SensorBadge label="TEMP_BEARING_1" value={`${unit.temperature}°C`} status="normal" />
                    <SensorBadge label="POWER_ACTIVE" value={`${unit.load} MW`} status="normal" />
                </div>
            </div>
        </div>
    );
};

// Trends Analytics View
const TrendsView: React.FC = () => {
    const mechanical = useTelemetryStore(state => state.mechanical);
    const hydraulic = useTelemetryStore(state => state.hydraulic);
    
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const now = new Date();
                const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                const newPoint = {
                    time: timeStr,
                    vibration: mechanical.vibrationX || 0,
                    power: (mechanical.powerKW || 0) / 1000,
                    head: hydraulic.head || 0
                };
                const newData = [...prev, newPoint];
                if (newData.length > 20) newData.shift(); // Keep last 20 points
                return newData;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [mechanical, hydraulic]);

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                Real-Time Trend Analytics
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                {/* Vibration vs Power */}
                <div className="bg-slate-900 rounded-none border border-slate-700 p-4 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Vibration vs Power</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={[0, 'auto']} />
                                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} domain={[0, 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ fontSize: 12 }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="power" stroke="#10b981" fillOpacity={1} fill="url(#colorPower)" name="Power (MW)" />
                                <Area yAxisId="right" type="monotone" dataKey="vibration" stroke="#f59e0b" fillOpacity={1} fill="url(#colorVib)" name="Vibration (mm/s)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hydraulic Head */}
                <div className="bg-slate-900 rounded-none border border-slate-700 p-4 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Hydraulic Head Stability</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#06b6d4" fontSize={10} domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ fontSize: 12 }}
                                />
                                <Line type="stepAfter" dataKey="head" stroke="#06b6d4" strokeWidth={2} dot={false} name="Net Head (m)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sovereign Command Panel
const SovereignCommandPanel: React.FC<{ selectedUnit: string | null }> = ({ selectedUnit }) => {
    return (
        <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Sovereign Command
            </div>

            {selectedUnit ? (
                <>
                    <div className="bg-slate-800 border border-slate-700 rounded-none p-3">
                        <div className="text-sm font-bold mb-3">Manual Control: {selectedUnit}</div>

                        <div className="space-y-3">
                            <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-none text-sm font-mono transition-all">
                                🛑 Trigger Veto
                            </button>

                            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-none text-sm font-mono transition-all">
                                ⚙️ Adjust Governor
                            </button>

                            <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-none text-sm font-mono transition-all">
                                ✅ Approve Action
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-amber-500/30 rounded-none p-3">
                        <div className="text-xs font-bold text-amber-400 mb-2">⚠️ WRITE ACCESS</div>
                        <div className="text-xs text-slate-400">
                            Changes require ARCHITECT approval (Multi-Sig)
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-sm text-slate-500 text-center py-8">
                    Select a unit from the fleet overview
                </div>
            )}
        </div>
    );
};

// Helper Component
const SensorBadge: React.FC<{ label: string; value: string; status: 'normal' | 'warning' | 'critical' }> = ({ label, value, status }) => {
    const colors = { normal: 'emerald', warning: 'amber', critical: 'red' };
    const color = colors[status];

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-xs font-mono font-bold text-${color}-400`}>{value}</div>
        </div>
    );
};
