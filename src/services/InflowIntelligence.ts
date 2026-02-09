export interface BasinParams {
  areaKm2: number;
  timeOfConcentrationHours: number;
  runoffCoefficient: number;
}

export interface WeatherInputs {
  hourlyRainfallMM: number[];
  hourlySnowMeltMM: number[];
  soilMoisturePct: number;
}

export interface InflowPoint {
  hour: number;
  inflowM3s: number;
  confidence: number;
}

export class InflowIntelligence {
  public static forecast24h(basin: BasinParams, inputs: WeatherInputs): InflowPoint[] {
    const res: InflowPoint[] = [];
    const coeff = Math.min(0.95, Math.max(0.1, basin.runoffCoefficient * (inputs.soilMoisturePct / 100) * 1.5));
    for (let h = 0; h < 24; h++) {
      const rain = Number(inputs.hourlyRainfallMM[h] || 0);
      const melt = Number(inputs.hourlySnowMeltMM[h] || 0);
      const totalMm = rain + melt;
      const volumeM3 = (totalMm / 1000) * (basin.areaKm2 * 1e6);
      const qM3s = (volumeM3 / 3600) * coeff;
      const lag = basin.timeOfConcentrationHours;
      const idx = Math.min(23, Math.max(0, Math.round(h + lag)));
      res.push({
        hour: idx,
        inflowM3s: qM3s,
        confidence: Math.max(0.5, Math.min(0.95, (inputs.soilMoisturePct / 100) * 0.9))
      });
    }
    const map: Record<number, { sum: number; conf: number; count: number }> = {};
    for (const p of res) {
      if (!map[p.hour]) map[p.hour] = { sum: 0, conf: 0, count: 0 };
      map[p.hour].sum += p.inflowM3s * p.confidence;
      map[p.hour].conf += p.confidence;
      map[p.hour].count += 1;
    }
    const out: InflowPoint[] = Object.entries(map).map(([hour, v]) => ({
      hour: Number(hour),
      inflowM3s: v.sum / Math.max(1, v.conf),
      confidence: v.conf / Math.max(1, v.count)
    }));
    return out.sort((a, b) => a.hour - b.hour);
  }
}
