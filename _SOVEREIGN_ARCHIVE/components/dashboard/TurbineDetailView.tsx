import React from 'react';
import { Droplet, AlertCircle, Gauge } from 'lucide-react';

interface TurbineDetailViewProps {
    turbineType: 'FRANCIS' | 'KAPLAN' | 'PELTON' | 'BANKI';
    sensors: {
        vibBearing1: number;
        vibBearing2: number;
        tempBearing1: number;
        tempBearing2: number;
        pressureInlet: number;
        pressureDraft: number;
        gateOpening?: number;
        bladeAngle?: number;
        needlePosition?: number[];
        airValve?: number;
    };
}

export const TurbineDetailView: React.FC<TurbineDetailViewProps> = ({ turbineType, sensors }) => {
    return (
        <div className="h-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-purple-400" />
                {turbineType} Turbine - P&ID Schematic
            </div>

            <div className="h-[calc(100%-3rem)] relative border border-slate-700 rounded-lg bg-slate-900">
                {turbineType === 'FRANCIS' && <FrancisPID sensors={sensors} />}
                {turbineType === 'KAPLAN' && <KaplanPID sensors={sensors} />}
                {turbineType === 'PELTON' && <PeltonPID sensors={sensors} />}
                {turbineType === 'BANKI' && <BankiMichellPID sensors={sensors} />}
            </div>
        </div>
    );
};

// Francis Turbine P&ID
const FrancisPID: React.FC<{ sensors: any }> = ({ sensors }) => {
    return (
        <div className="relative w-full h-full p-8">
            {/* Water flow path */}
            <div className="absolute top-20 left-20 w-80 h-12 border-4 border-blue-500 rounded flex items-center justify-center">
                <Droplet className="w-6 h-6 text-blue-400 animate-pulse" />
                <span className="ml-2 text-sm text-blue-300 font-mono">Penstock Flow →</span>
            </div>

            {/* Spiral Case */}
            <div className="absolute top-48 left-32 w-64 h-64 border-4 border-blue-600 rounded-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-bold text-blue-300">Spiral Case</div>
                    <div className="text-xs text-slate-400 mt-1">Pressure Distribution</div>
                </div>
            </div>

            {/* Runner (center) */}
            <div className="absolute top-64 left-56 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                <div className="text-xs text-white font-bold">⚙️</div>
            </div>

            {/* Draft Tube */}
            <div className="absolute top-96 left-48 w-32 h-40 border-4 border-blue-500 flex items-center justify-center" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
                <div className="text-xs text-blue-300 font-mono">Draft Tube</div>
            </div>

            {/* Sensor Overlays */}
            <SensorTag label="PRESS_INLET" value={`${sensors.pressureInlet} bar`} position={{ top: 24, left: 180 }} status="normal" />
            <SensorTag label="VIB_BEARING_1" value={`${sensors.vibBearing1} mm/s`} position={{ top: 60, right: 80 }} status={sensors.vibBearing1 > 2.5 ? 'warning' : 'normal'} />
            <SensorTag label="TEMP_BEARING_1" value={`${sensors.tempBearing1}°C`} position={{ top: 90, right: 80 }} status={sensors.tempBearing1 > 50 ? 'warning' : 'normal'} />
            <SensorTag label="DRAFT_TUBE_PRESS" value={`${sensors.pressureDraft} bar`} position={{ bottom: 40, left: 160 }} status="normal" />
            <SensorTag label="GATE_OPENING" value={`${sensors.gateOpening}%`} position={{ top: 140, left: 80 }} status="normal" />

            {/* Air Injection System (Francis-specific) */}
            <div className="absolute bottom-20 right-20 bg-slate-800 border border-amber-500 rounded p-3">
                <div className="text-xs font-bold text-amber-400 mb-1">Air Injection</div>
                <div className="text-xs text-slate-300 font-mono">Status: STANDBY</div>
                <div className="text-[10px] text-slate-500 mt-1">Vortex suppression</div>
            </div>
        </div>
    );
};

// Kaplan Turbine P&ID
const KaplanPID: React.FC<{ sensors: any }> = ({ sensors }) => {
    return (
        <div className="relative w-full h-full p-8">
            {/* Runner with adjustable blades */}
            <div className="absolute top-48 left-1/2 transform -translate-x-1/2 w-48 h-48 border-4 border-emerald-600 rounded-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl animate-spin" style={{ animationDuration: '2s' }}>⚙️</div>
                    <div className="text-xs text-emerald-300 font-mono mt-2">Runner</div>
                </div>
            </div>

            {/* Blade Angle Indicator */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-slate-800 border-2 border-emerald-500 rounded-lg p-4">
                <div className="text-sm font-bold text-emerald-300 mb-2">Blade Angle (φ)</div>
                <div className="text-3xl font-mono text-emerald-400">{sensors.bladeAngle?.toFixed(1)}°</div>
                <div className="text-xs text-slate-400 mt-1">Servo Position</div>
            </div>

            {/* Guide Vanes */}
            <div className="absolute top-48 left-32 w-24 h-48 border-2 border-blue-500 rounded flex items-center justify-center">
                <div className="text-xs text-blue-300 font-mono transform -rotate-90">Guide Vanes</div>
            </div>

            {/* Sensors */}
            <SensorTag label="HUB_PRESSURE" value={`${sensors.pressureDraft} bar`} position={{ bottom: 60, left: '50%' }} status="normal" />
            <SensorTag label="BLADE_ANGLE" value={`${sensors.bladeAngle}°`} position={{ top: 120, right: 80 }} status="normal" />
            <SensorTag label="CONJUGATE_ERROR" value="0.8%" position={{ top: 150, right: 80 }} status="normal" />

            {/* Servo Compensation Warning */}
            <div className="absolute bottom-20 right-20 bg-amber-950 border border-amber-500 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <div className="text-xs font-bold text-amber-400">Servo Compensation</div>
                </div>
                <div className="text-xs text-amber-300 font-mono">+2.1° backlash offset</div>
                <div className="text-[10px] text-slate-400 mt-1">Software shimming active</div>
            </div>
        </div>
    );
};

// Pelton Turbine P&ID
const PeltonPID: React.FC<{ sensors: any }> = ({ sensors }) => {
    const nozzles = sensors.needlePosition || [45, 50, 38, 52, 48, 51];

    return (
        <div className="relative w-full h-full p-8">
            {/* Pelton Runner */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-yellow-600 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '1.5s' }}>
                <div className="text-6xl">🏵️</div>
            </div>

            {/* Nozzles arranged in circle */}
            {nozzles.map((position: number, i: number) => {
                const angle = (i / nozzles.length) * 2 * Math.PI;
                const radius = 200;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <div
                        key={i}
                        className="absolute bg-slate-800 border border-blue-500 rounded p-2"
                        style={{
                            top: `calc(50% + ${y}px)`,
                            left: `calc(50% + ${x}px)`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="text-xs font-bold text-blue-300">Nozzle {i + 1}</div>
                        <div className="text-xs text-blue-400 font-mono">{position}mm</div>
                        {i === 2 && (
                            <div className="text-[10px] text-amber-400 mt-1">⚠️ High freq</div>
                        )}
                    </div>
                );
            })}

            {/* High-frequency monitoring badge */}
            <div className="absolute top-20 right-20 bg-purple-950 border border-purple-500 rounded p-3">
                <div className="text-xs font-bold text-purple-300 mb-1">High-Freq Monitoring</div>
                <div className="text-xs text-purple-400 font-mono">10ms sampling</div>
                <div className="text-[10px] text-slate-400 mt-1">Water hammer detection</div>
            </div>
        </div>
    );
};

// Banki-Michell P&ID
const BankiMichellPID: React.FC<{ sensors: any }> = ({ sensors }) => {
    return (
        <div className="relative w-full h-full p-8">
            {/* Crossflow Runner (rectangular) */}
            <div className="absolute top-48 left-1/2 transform -translate-x-1/2 w-64 h-32 border-4 border-cyan-600 rounded flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-bold text-cyan-300">Crossflow Runner</div>
                    <div className="text-xs text-slate-400 mt-1">Two-stage flow</div>
                </div>
            </div>

            {/* Nozzle */}
            <div className="absolute top-56 left-32 w-32 h-16 border-2 border-blue-500 rounded bg-blue-900/20 flex items-center justify-center">
                <div className="text-xs text-blue-300 font-mono">Nozzle</div>
            </div>

            {/* Air Regulation Valve */}
            <div className="absolute top-72 right-32 bg-slate-800 border-2 border-amber-500 rounded-lg p-4">
                <div className="text-sm font-bold text-amber-300 mb-2">Air Valve</div>
                <div className="text-3xl font-mono text-amber-400">{sensors.airValve}%</div>
                <div className="text-xs text-slate-400 mt-1">Ventilation control</div>
            </div>

            {/* Internal Ventilation Ports */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 border-2 border-cyan-500 rounded-full flex items-center justify-center">
                        <div className="text-xs text-cyan-300">V{i}</div>
                    </div>
                ))}
            </div>

            <SensorTag label="AIR_VALVE" value={`${sensors.airValve}%`} position={{ top: 120, right: 100 }} status="normal" />
            <SensorTag label="INTERNAL_PRESS" value={`1.02 bar`} position={{ bottom: 80, left: '50%' }} status="normal" />
        </div>
    );
};

// Sensor Tag Component
const SensorTag: React.FC<{
    label: string;
    value: string;
    position: any;
    status: 'normal' | 'warning' | 'critical';
}> = ({ label, value, position, status }) => {
    const colors = {
        normal: 'emerald',
        warning: 'amber',
        critical: 'red'
    };
    const color = colors[status];

    return (
        <div
            className={`absolute bg-slate-800/95 border-2 border-${color}-500 rounded px-3 py-2 shadow-lg`}
            style={position}
        >
            <div className={`text-xs font-bold text-${color}-300`}>{label}</div>
            <div className={`text-sm font-mono text-${color}-400`}>{value}</div>
        </div>
    );
};
