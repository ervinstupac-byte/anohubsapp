import React, { useState, useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { BackButton } from './BackButton';
import { Thermometer, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface StatorThermalParams {
  slot1Temp: number; // °C
  slot2Temp: number; // °C
  slot3Temp: number; // °C
  slot4Temp: number; // °C
  slot5Temp: number; // °C
  slot6Temp: number; // °C
  slot7Temp: number; // °C
  slot8Temp: number; // °C
  slot9Temp: number; // °C
  slot10Temp: number; // °C
  slot11Temp: number; // °C
  slot12Temp: number; // °C
  coolingWaterInletTemp: number; // °C
  coolingWaterOutletTemp: number; // °C
}

interface StatorThermalResults {
  hotSpotTemperature: number; // °C
  insulationAgingRate: number; // % per year
  thermalStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  recommendations: string[];
}

export const StatorWindingThermalLab: React.FC = () => {
  const [params, setParams] = useState<StatorThermalParams>({
    slot1Temp: 65, slot2Temp: 66, slot3Temp: 67, slot4Temp: 68,
    slot5Temp: 69, slot6Temp: 70, slot7Temp: 71, slot8Temp: 72,
    slot9Temp: 73, slot10Temp: 74, slot11Temp: 75, slot12Temp: 76,
    coolingWaterInletTemp: 25,
    coolingWaterOutletTemp: 35
  });

  const [results, setResults] = useState<StatorThermalResults | null>(null);

  const calculateStatorThermal = useMemo(() => {
    const slotTemps = [
      params.slot1Temp, params.slot2Temp, params.slot3Temp, params.slot4Temp,
      params.slot5Temp, params.slot6Temp, params.slot7Temp, params.slot8Temp,
      params.slot9Temp, params.slot10Temp, params.slot11Temp, params.slot12Temp
    ];

    const avgSlotTemp = slotTemps.reduce((a, b) => a + b, 0) / slotTemps.length;
    const maxSlotTemp = Math.max(...slotTemps);
    const minSlotTemp = Math.min(...slotTemps);
    const tempVariation = maxSlotTemp - minSlotTemp;

    // Calculate hot spot temperature
    // Hot spot is typically 10-20°C above average slot temperature
    const hotSpotTemperature = maxSlotTemp + 15;

    // Calculate insulation aging rate using Arrhenius equation
    // Aging rate doubles for every 10°C increase (Montsinger's rule)
    const baseTemp = 90; // °C (reference temperature)
    const tempDiff = hotSpotTemperature - baseTemp;
    const insulationAgingRate = Math.pow(2, tempDiff / 10) * 0.5; // % per year

    // Thermal status assessment
    // Normal: < 110°C, Elevated: 110-130°C, Critical: > 130°C
    let thermalStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';
    if (hotSpotTemperature > 130) thermalStatus = 'CRITICAL';
    else if (hotSpotTemperature > 110) thermalStatus = 'ELEVATED';

    const recommendations: string[] = [];
    if (thermalStatus === 'CRITICAL') {
      recommendations.push('🚨 Critical thermal status: Hot spot > 130°C - immediate action required');
      recommendations.push('⚠️ High insulation aging rate - reduce load or improve cooling');
    } else if (thermalStatus === 'ELEVATED') {
      recommendations.push('⚠️ Elevated thermal status: Hot spot 110-130°C - monitor closely');
      recommendations.push('📊 Check cooling system and airflow distribution');
    } else {
      recommendations.push('✅ Normal thermal status: Hot spot < 110°C - normal operation');
    }

    if (tempVariation > 15) {
      recommendations.push('🌡️ High temperature variation > 15°C: Check cooling water flow distribution');
    }

    if (insulationAgingRate > 5) {
      recommendations.push('⚠️ High aging rate > 5%/year: Insulation life significantly reduced');
    }

    const coolingWaterRise = params.coolingWaterOutletTemp - params.coolingWaterInletTemp;
    if (coolingWaterRise > 15) {
      recommendations.push('💧 High cooling water rise > 15°C: Check cooler performance');
    }

    if (coolingWaterRise < 5) {
      recommendations.push('💧 Low cooling water rise < 5°C: Possible overcooling - check system efficiency');
    }

    return {
      hotSpotTemperature,
      insulationAgingRate,
      thermalStatus,
      recommendations
    };
  }, [params]);

  const handleCalculate = () => {
    setResults(calculateStatorThermal);
  };

  const handleReset = () => {
    setParams({
      slot1Temp: 65, slot2Temp: 66, slot3Temp: 67, slot4Temp: 68,
      slot5Temp: 69, slot6Temp: 70, slot7Temp: 71, slot8Temp: 72,
      slot9Temp: 73, slot10Temp: 74, slot11Temp: 75, slot12Temp: 76,
      coolingWaterInletTemp: 25,
      coolingWaterOutletTemp: 35
    });
    setResults(null);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Stator Winding <span className="text-cyan-400">Thermal Lab</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Thermal mapping and insulation aging rate prediction
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Temperature Readings (°C)" className="border-t-4 border-t-cyan-500">
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Slot Temperatures</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((slot) => (
                  <ModernInput
                    key={`slot-${slot}`}
                    label={`Slot ${slot}`}
                    type="number"
                    value={params[`slot${slot}Temp` as keyof StatorThermalParams] as number}
                    onChange={(e) => setParams({ ...params, [`slot${slot}Temp` as keyof StatorThermalParams]: parseFloat(e.target.value) || 0 })}
                    min="20"
                    max="150"
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModernInput
                label="Cooling Water Inlet (°C)"
                type="number"
                value={params.coolingWaterInletTemp}
                onChange={(e) => setParams({ ...params, coolingWaterInletTemp: parseFloat(e.target.value) || 0 })}
                icon={<Thermometer className="w-4 h-4" />}
                min="10"
                max="50"
              />
              <ModernInput
                label="Cooling Water Outlet (°C)"
                type="number"
                value={params.coolingWaterOutletTemp}
                onChange={(e) => setParams({ ...params, coolingWaterOutletTemp: parseFloat(e.target.value) || 0 })}
                icon={<Thermometer className="w-4 h-4" />}
                min="10"
                max="60"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <ModernButton onClick={handleCalculate} variant="primary" className="flex-1">
                Calculate Thermal
              </ModernButton>
              <ModernButton onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </ModernButton>
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard title="Thermal Analysis" className="border-t-4 border-t-purple-500">
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${results.thermalStatus === 'CRITICAL' ? 'bg-red-950/20 border-red-500' : results.thermalStatus === 'ELEVATED' ? 'bg-amber-950/20 border-amber-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thermal Status</p>
                    <p className="text-2xl font-black text-white">{results.thermalStatus}</p>
                  </div>
                  <Thermometer className={`w-12 h-12 ${results.thermalStatus === 'CRITICAL' ? 'text-red-400' : results.thermalStatus === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hot Spot Temperature</p>
                <p className="text-3xl font-black text-white">{results.hotSpotTemperature.toFixed(1)} °C</p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Insulation Aging Rate</p>
                <p className="text-3xl font-black text-white">{results.insulationAgingRate.toFixed(2)} %/year</p>
              </div>

              {results.recommendations.length > 0 && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Recommendations</p>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-cyan-400">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
