import React from 'react';
import { TelemetryData } from '../../contexts/TelemetryContext';
import { GlassCard, StatusBadge } from '../../shared/components/ui';
import { StatusIndicator } from '../../shared/components/ui/StatusIndicator';

type Props = {
  telemetry?: TelemetryData | null;
};

type Nozzle = NonNullable<TelemetryData['pelton']>['nozzles'][number];

function NozzleCard({ index, nozzle }: { index: number; nozzle: Nozzle | null }) {
  const needle = nozzle?.needlePct ?? null;
  const deflectorOpen = nozzle?.deflectorOpen;
  const jetPressureBar = nozzle?.jetPressureBar;

  const srText = `Nozzle ${index}. Needle ${needle !== null ? `${needle.toFixed(1)} percent` : 'not available'}. Deflector ${deflectorOpen === true ? 'open' : deflectorOpen === false ? 'closed' : 'unknown'}. Pressure ${jetPressureBar !== undefined ? `${jetPressureBar.toFixed(2)} bar` : 'unknown'}.`;

  return (
    <li role="listitem" aria-label={`Nozzle ${index}`} className="h-full">
      <GlassCard variant="deep" noPadding className="h-full flex flex-col">
        <div className="p-3 flex-1 flex flex-col justify-between" aria-describedby={`nozzle-${index}-sr`}>
          <div>
            <div className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-2">Nozzle {index}</div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-300">Needle:</span>
                <span id={`nozzle-${index}-needle`} className="text-slate-200 font-bold" aria-live="polite">{needle !== null ? `${needle.toFixed(1)}%` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Deflector:</span>
                <span id={`nozzle-${index}-deflector`} className={`font-bold ${
                  deflectorOpen === true ? 'text-emerald-400' :
                  deflectorOpen === false ? 'text-red-400' :
                  'text-slate-300'
                }`} aria-live="polite">
                  {deflectorOpen ? 'OPEN' : deflectorOpen === false ? 'CLOSED' : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Pressure:</span>
                <span id={`nozzle-${index}-pressure`} className="text-slate-200 font-bold" aria-live="polite">{jetPressureBar !== undefined ? `${jetPressureBar.toFixed(2)}b` : '—'}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={needle !== null && needle > 75 ? 'critical' : needle !== null && needle > 50 ? 'warning' : 'nominal'}
                size="sm"
                variant="dot"
                label={needle !== null ? `${needle.toFixed(0)}%` : 'N/A'}
                className="" 
                aria-hidden={false}
              />
              <div className="text-xs text-slate-400 font-mono" aria-hidden="false">{needle !== null ? `${needle.toFixed(1)}%` : 'N/A'}</div>
            </div>
            <div className="text-xs text-slate-400 font-mono" aria-hidden="false">{jetPressureBar !== undefined ? `${jetPressureBar.toFixed(2)}b` : '—'}</div>
          </div>
          <span id={`nozzle-${index}-sr`} className="sr-only">{srText}</span>
        </div>
      </GlassCard>
    </li>
  );
}

export const PeltonScadaPanel: React.FC<Props> = ({ telemetry }) => {
  const pelton = telemetry?.pelton;
  const nozzleIndexes = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-4">
      {/* Header */}
      <GlassCard variant="commander" className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-cyan-400 uppercase tracking-wider">Pelton SCADA</h2>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-[0.2em]">10MW Multi-Jet Hydraulic Turbine</p>
          </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="text-[10px] text-slate-300 uppercase">Turbine ID</div>
          <div className="text-lg font-mono font-black text-slate-200">{pelton?.turbineId ?? telemetry?.assetId ?? 'UNKNOWN'}</div>
          <div>
            <StatusBadge route={`/assets/${pelton?.turbineId ?? telemetry?.assetId ?? 'unknown'}`} />
          </div>
        </div>
      </GlassCard>

      {/* Nozzle Grid */}
      <div>
        <div className="text-[10px] text-slate-300 uppercase font-mono tracking-[0.2em] font-black mb-2">Nozzle Array (6x)</div>
        <ul role="list" aria-label="Nozzle array" className="grid grid-cols-6 gap-2 list-none p-0 m-0">
          {nozzleIndexes.map(i => {
            const nozzle = (pelton?.nozzles || [])?.find(n => n.index === i) || null;
            return <NozzleCard key={i} index={i} nozzle={nozzle} />;
          })}
        </ul>
      </div>

      {/* Generator Cooling & Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* Generator Cooling */}
        <GlassCard title="Generator Cooling (Końcar)" subtitle="Upper Bearing & Active Loop" variant="deep">
          <div className="space-y-3">
            <div role="group" aria-labelledby="gen-bearing-label" className="p-3 bg-slate-800/50 rounded border border-slate-700">
              <div id="gen-bearing-label" className="text-[10px] text-slate-300 font-mono uppercase mb-1">Bearing Temp (°C)</div>
              <div className={`text-2xl font-black font-mono ${
                pelton?.generatorCooling?.bearingTempC !== undefined
                  ? pelton.generatorCooling.bearingTempC > 100 ? 'text-red-400' :
                    pelton.generatorCooling.bearingTempC > 80 ? 'text-amber-400' :
                    'text-emerald-400'
                  : 'text-slate-400'
              }`} aria-live="polite">
                {pelton?.generatorCooling?.bearingTempC !== undefined ? pelton.generatorCooling.bearingTempC.toFixed(1) : 'N/A'}
              </div>
            </div>
            <div role="group" aria-labelledby="gen-coolant-label" className="p-3 bg-slate-800/50 rounded border border-slate-700">
              <div id="gen-coolant-label" className="text-[10px] text-slate-300 font-mono uppercase mb-1">Coolant Flow (L/s)</div>
              <div className="text-2xl font-black font-mono text-cyan-400" aria-live="polite">
                {pelton?.generatorCooling?.coolantFlowLps !== undefined ? pelton.generatorCooling.coolantFlowLps.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div role="group" aria-labelledby="gen-cooling-status" className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700">
              <div id="gen-cooling-status" className="sr-only">Generator cooling status</div>
              <StatusIndicator
                status={pelton?.generatorCooling?.bearingCoolingPresent ? 'nominal' : 'critical'}
                size="sm"
                variant="led"
                label={pelton?.generatorCooling?.bearingCoolingPresent ? 'ACTIVE' : 'INACTIVE'}
                aria-hidden={false}
              />
              <span className="text-xs font-mono text-slate-300" aria-live="polite">
                {pelton?.generatorCooling?.bearingCoolingPresent ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Performance Summary */}
        <GlassCard title="Performance Summary" subtitle="Calculated & Telemetry" variant="deep">
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Output (MW)</div>
              <div className="text-2xl font-black font-mono text-slate-200">
                {telemetry?.output !== undefined ? telemetry.output.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Efficiency (%)</div>
              <div className={`text-2xl font-black font-mono ${
                telemetry?.efficiency !== undefined
                  ? telemetry.efficiency > 90 ? 'text-emerald-400' :
                    telemetry.efficiency > 70 ? 'text-slate-200' :
                    'text-amber-400'
                  : 'text-slate-400'
              }`}>
                {telemetry?.efficiency !== undefined ? telemetry.efficiency.toFixed(1) : 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
              <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Cavitation Index</div>
              <div className={`text-2xl font-black font-mono ${
                telemetry?.cavitationIntensity !== undefined
                  ? telemetry.cavitationIntensity < 2 ? 'text-emerald-400' :
                    telemetry.cavitationIntensity < 5 ? 'text-amber-400' :
                    'text-red-400'
                  : 'text-slate-400'
              }`}>
                {telemetry?.cavitationIntensity !== undefined ? telemetry.cavitationIntensity.toFixed(2) : 'N/A'}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default PeltonScadaPanel;
