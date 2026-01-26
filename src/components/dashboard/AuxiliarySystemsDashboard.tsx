import React from 'react';
import { Battery, Fuel, Zap, Power } from 'lucide-react';

interface AuxiliarySystemsProps {
    dcStation: {
        batteryBankVoltage: number; // VDC
        batteryChargeCurrent: number; // A
        batterySOC: number; // 0-100%
        batteryHealth: 'GOOD' | 'FAIR' | 'POOR';
        chargerStatus: 'CHARGING' | 'FLOAT' | 'OFFLINE';
    };
    dieselGenerator: {
        readiness: 'READY' | 'NOT_READY' | 'RUNNING';
        fuelLevel: number; // %
        startBatteryVoltage: number; // VDC
        engineTemperature: number; // °C
        lastTest: number; // timestamp
    };
    stationService: {
        acBusVoltage: number; // VAC
        acFrequency: number; // Hz
        activePower: number; // kW
        backupAvailable: boolean;
    };
}

export const AuxiliarySystemsDashboard: React.FC<AuxiliarySystemsProps> = ({
    dcStation,
    dieselGenerator,
    stationService
}) => {
    const daysSinceTest = Math.floor((Date.now() - dieselGenerator.lastTest) / (1000 * 60 * 60 * 24));

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Power className="w-6 h-6 text-purple-400" />
                Auxiliary Systems & Station Service
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* DC Station Battery */}
                <div className="bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Battery className="w-5 h-5 text-blue-400" />
                        <div className="text-lg font-bold text-blue-300">DC Battery Bank</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Voltage</div>
                            <div className="text-2xl font-bold text-blue-300 font-mono">
                                {dcStation.batteryBankVoltage.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-500">VDC</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 mb-1">SOC</div>
                            <div className="text-2xl font-bold text-emerald-300 font-mono">
                                {dcStation.batterySOC.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* Battery SOC Bar */}
                    <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div
                            className={`absolute inset-y-0 left-0 transition-all ${dcStation.batterySOC > 80 ? 'bg-emerald-500' :
                                    dcStation.batterySOC > 50 ? 'bg-blue-500' :
                                        dcStation.batterySOC > 30 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${dcStation.batterySOC}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-slate-500 mb-1">Charge Current</div>
                            <div className="text-blue-400 font-mono">{dcStation.batteryChargeCurrent.toFixed(1)} A</div>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-slate-500 mb-1">Health</div>
                            <div className={`font-bold ${dcStation.batteryHealth === 'GOOD' ? 'text-emerald-400' :
                                    dcStation.batteryHealth === 'FAIR' ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {dcStation.batteryHealth}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 p-2 bg-slate-800 rounded text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Charger Status</span>
                            <span className={`font-bold ${dcStation.chargerStatus === 'CHARGING' ? 'text-blue-400' :
                                    dcStation.chargerStatus === 'FLOAT' ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {dcStation.chargerStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Diesel Generator */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${dieselGenerator.readiness === 'READY' ? 'border-emerald-500' :
                        dieselGenerator.readiness === 'RUNNING' ? 'border-blue-500' : 'border-red-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Fuel className="w-5 h-5 text-amber-400" />
                        <div className="text-lg font-bold text-amber-300">Emergency Diesel Generator</div>
                    </div>

                    {/* Readiness Status */}
                    <div className={`mb-4 p-3 rounded-lg border-2 ${dieselGenerator.readiness === 'READY' ? 'bg-emerald-950 border-emerald-500' :
                            dieselGenerator.readiness === 'RUNNING' ? 'bg-blue-950 border-blue-500' :
                                'bg-red-950 border-red-500'
                        }`}>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${dieselGenerator.readiness === 'READY' ? 'text-emerald-300' :
                                    dieselGenerator.readiness === 'RUNNING' ? 'text-blue-300' : 'text-red-300'
                                }`}>
                                {dieselGenerator.readiness}
                            </div>
                            {dieselGenerator.readiness === 'READY' && (
                                <div className="text-xs text-emerald-400 mt-1">Auto-start enabled</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-slate-500 mb-1">Fuel Level</div>
                            <div className="text-amber-400 font-mono font-bold">{dieselGenerator.fuelLevel.toFixed(0)}%</div>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-slate-500 mb-1">Start Battery</div>
                            <div className="text-blue-400 font-mono">{dieselGenerator.startBatteryVoltage.toFixed(1)} VDC</div>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-slate-500 mb-1">Engine Temp</div>
                            <div className="text-emerald-400 font-mono">{dieselGenerator.engineTemperature.toFixed(0)}°C</div>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-slate-500 mb-1">Last Test</div>
                            <div className="text-purple-400 font-mono">{daysSinceTest}d ago</div>
                        </div>
                    </div>

                    {daysSinceTest > 30 && (
                        <div className="p-2 bg-amber-950 border border-amber-500 rounded text-xs text-amber-300">
                            ⚠️ Test overdue - schedule load bank test
                        </div>
                    )}
                </div>

                {/* AC Station Service */}
                <div className="col-span-2 bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <div className="text-lg font-bold text-purple-300">AC Station Service</div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">AC Bus Voltage</div>
                            <div className="text-2xl font-bold text-purple-300 font-mono">
                                {stationService.acBusVoltage.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">VAC</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Frequency</div>
                            <div className={`text-2xl font-bold font-mono ${Math.abs(stationService.acFrequency - 50) < 0.1 ? 'text-emerald-300' : 'text-amber-300'
                                }`}>
                                {stationService.acFrequency.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500">Hz</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Active Power</div>
                            <div className="text-2xl font-bold text-blue-300 font-mono">
                                {stationService.activePower.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">kW</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Backup Status</div>
                            <div className={`text-lg font-bold ${stationService.backupAvailable ? 'text-emerald-300' : 'text-red-300'
                                }`}>
                                {stationService.backupAvailable ? '✓ AVAILABLE' : '✗ UNAVAILABLE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
