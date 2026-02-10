// Oil Analysis Service - Chemical Fingerprinting
// Tracks oil degradation and contamination

export interface OilSample {
    sampleId: string;
    timestamp: number;
    assetId: string;
    location: 'BEARING_UPPER' | 'BEARING_LOWER' | 'GEARBOX' | 'SERVO_SYSTEM';

    // Chemical parameters
    viscosityIndex: number; // cSt @ 40°C (typical: 46-68 for turbine oil)
    tan: number; // Total Acid Number (mg KOH/g) - typical: <0.5 fresh, >2.0 critical
    dielectricConstant: number; // (typical: 2.0-2.2, >2.5 indicates moisture)
    waterContent: number; // ppm (parts per million)

    // Particle count (ISO 4406 code)
    particleCount: {
        size_4um: number; // particles > 4 microns per mL
        size_6um: number; // particles > 6 microns per mL
        size_14um: number; // particles > 14 microns per mL
    };

    // Metal content (ppm)
    metalContent: {
        iron: number;
        copper: number;
        lead: number;
        tin: number;
        aluminum: number;
        chromium: number;
    };
}

export interface OilAnalysisResult {
    timestamp: number;
    overallHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
    healthScore: number; // 0-100

    findings: Array<{
        category: 'VISCOSITY' | 'ACIDITY' | 'MOISTURE' | 'CONTAMINATION' | 'WEAR';
        severity: 'INFO' | 'WARNING' | 'CRITICAL';
        message: string;
        recommendation: string;
    }>;

    predictedOilLife: number; // Hours until oil change required
}

export class OilAnalysisService {
    /**
     * Analyze oil sample and detect anomalies
     */
    static analyzeOilSample(sample: OilSample, baseline?: OilSample): OilAnalysisResult {
        const findings: OilAnalysisResult['findings'] = [];
        let healthScore = 100;

        // 1. VISCOSITY INDEX ANALYSIS
        const viscosityDrop = baseline
            ? ((sample.viscosityIndex - baseline.viscosityIndex) / baseline.viscosityIndex) * 100
            : 0;

        if (sample.viscosityIndex < 40) {
            findings.push({
                category: 'VISCOSITY',
                severity: 'CRITICAL',
                message: `Pad viskoziteta na ${sample.viscosityIndex} cSt signalizira prodor vode ili pregrijavanje ulja.`,
                recommendation: 'HITNO: Zamjena ulja. Provjeriti brtvila i hladnjak ulja.'
            });
            healthScore -= 30;
        } else if (viscosityDrop < -15) {
            findings.push({
                category: 'VISCOSITY',
                severity: 'WARNING',
                message: `Viskozitet opao za ${Math.abs(viscosityDrop).toFixed(0)}% od baseline.`,
                recommendation: 'Planirati zamjenu ulja u naredna 2-3 mjeseca.'
            });
            healthScore -= 15;
        }

        // 2. TAN (TOTAL ACID NUMBER) ANALYSIS
        if (sample.tan > 2.0) {
            findings.push({
                category: 'ACIDITY',
                severity: 'CRITICAL',
                message: `TAN od ${sample.tan.toFixed(2)} mg KOH/g ukazuje na kritičnu oksidaciju ulja.`,
                recommendation: 'HITNO: Zamjena ulja. Ulje je potpuno degradirano.'
            });
            healthScore -= 35;
        } else if (sample.tan > 1.0) {
            findings.push({
                category: 'ACIDITY',
                severity: 'WARNING',
                message: `Rast kiselosti (TAN ${sample.tan.toFixed(2)}) zbog oksidacije ulja.`,
                recommendation: 'Zamjena ulja preporučena u roku od mjesec dana.'
            });
            healthScore -= 20;
        } else if (sample.tan > 0.5) {
            findings.push({
                category: 'ACIDITY',
                severity: 'INFO',
                message: `TAN ${sample.tan.toFixed(2)} - ulje u dobroj kondic iji, ali prati trend.`,
                recommendation: 'Ponovna analiza za 3 mjeseca.'
            });
        }

        // 3. DIELECTRIC CONSTANT (MOISTURE DETECTION)
        if (sample.dielectricConstant > 2.5) {
            const estimatedMoisture = (sample.dielectricConstant - 2.0) * 1000; // Simplified
            findings.push({
                category: 'MOISTURE',
                severity: 'CRITICAL',
                message: `Detekcija vlage u realnom vremenu: Dielectric constant ${sample.dielectricConstant.toFixed(2)} (procjena ~${estimatedMoisture.toFixed(0)} ppm vode).`,
                recommendation: 'HITNO: Provjeriti brtvila. Vlaga uzrokuje koroziju ležajeva!'
            });
            healthScore -= 25;
        } else if (sample.waterContent > 200) {
            findings.push({
                category: 'MOISTURE',
                severity: 'WARNING',
                message: `Sadržaj vode ${sample.waterContent} ppm prekoračuje limit (200 ppm).`,
                recommendation: 'Aktivirati vakuum dehidraciju ili zamijeniti ulje.'
            });
            healthScore -= 15;
        }

        // 4. METAL CONTENT ANALYSIS (WEAR DETECTION)
        const { iron, copper, lead, tin } = sample.metalContent;

        // Babbitt metal wear (Sn + Pb + Cu)
        const babbittTotal = tin + lead + copper;
        if (babbittTotal > 50) {
            findings.push({
                category: 'WEAR',
                severity: 'CRITICAL',
                message: `Visok nivo Babbitt metala (Sn: ${tin} ppm, Pb: ${lead} ppm, Cu: ${copper} ppm) - Total: ${babbittTotal} ppm.`,
                recommendation: 'HITNO: Provjeriti aksijalni zazor, ležaj gubi materijal! Inspekcija ležajeva obavezna.'
            });
            healthScore -= 40;
        }

        // Iron (gear/shaft fatigue)
        if (iron > 100) {
            findings.push({
                category: 'WEAR',
                severity: 'CRITICAL',
                message: `Ekstreman nivo željeza (${iron} ppm) - zamor materijala zupčanika ili vratila.`,
                recommendation: 'HITNO: Vibracijksa analiza i magnetna provjera pukotina.'
            });
            healthScore -= 35;
        } else if (iron > 50) {
            findings.push({
                category: 'WEAR',
                severity: 'WARNING',
                message: `Povećan nivo željeza (${iron} ppm) - mogu ći početak habanja.`,
                recommendation: 'Praćenje trenda. Ferografska analiza preporučena.'
            });
            healthScore -= 10;
        }

        // 5. PARTICLE COUNT (ISO 4406)
        const isoCode = this.calculateISOCode(sample.particleCount);
        if (isoCode.includes('24') || isoCode.includes('25')) {
            findings.push({
                category: 'CONTAMINATION',
                severity: 'CRITICAL',
                message: `Kritična kontaminacija česticama (ISO ${isoCode}).`,
                recommendation: 'Filtracija ulja ili zamjena. Provjeriti filtere.'
            });
            healthScore -= 20;
        }

        // Determine overall health
        let overallHealth: OilAnalysisResult['overallHealth'];
        if (healthScore >= 85) overallHealth = 'EXCELLENT';
        else if (healthScore >= 70) overallHealth = 'GOOD';
        else if (healthScore >= 50) overallHealth = 'FAIR';
        else if (healthScore >= 30) overallHealth = 'POOR';
        else overallHealth = 'CRITICAL';

        // Predict oil life
        const predictedOilLife = this.predictOilLife(sample, healthScore);

        return {
            timestamp: Date.now(),
            overallHealth,
            healthScore: Math.max(0, healthScore),
            findings,
            predictedOilLife
        };
    }

    /**
     * Calculate ISO 4406 cleanliness code
     */
    private static calculateISOCode(particleCount: OilSample['particleCount']): string {
        const scaleCode = (count: number): string => {
            if (count > 320000) return '25';
            if (count > 160000) return '24';
            if (count > 80000) return '23';
            if (count > 40000) return '22';
            if (count > 20000) return '21';
            if (count > 10000) return '20';
            if (count > 5000) return '19';
            if (count > 2500) return '18';
            if (count > 1300) return '17';
            if (count > 640) return '16';
            if (count > 320) return '15';
            if (count > 160) return '14';
            if (count > 80) return '13';
            return '12';
        };

        const code4 = scaleCode(particleCount.size_4um);
        const code6 = scaleCode(particleCount.size_6um);
        const code14 = scaleCode(particleCount.size_14um);

        return `${code4}/${code6}/${code14}`;
    }

    /**
     * Predict remaining oil life in hours
     */
    private static predictOilLife(sample: OilSample, healthScore: number): number {
        // Simplified model - in production use ML
        const baseLife = 8760; // 1 year in hours

        // TAN aging factor
        const tanFactor = Math.max(0, 1 - (sample.tan / 2.0));

        // Viscosity factor
        const viscFactor = sample.viscosityIndex > 46 ? 1.0 : sample.viscosityIndex / 46;

        // Health score factor
        const healthFactor = healthScore / 100;

        const remainingLife = baseLife * tanFactor * viscFactor * healthFactor;

        return Math.max(0, remainingLife);
    }

    /**
     * Correlate oil analysis with bearing temperature
     */
    static correlateBearingWear(
        oilSample: OilSample,
        bearingTemp: number,
        baselineTemp: number
    ): string | null {
        const { tin, lead, copper } = oilSample.metalContent;
        const babbittTotal = tin + lead + copper;
        const tempIncrease = bearingTemp - baselineTemp;

        if (babbittTotal > 30 && tempIncrease > 10) {
            return `AI KORELACIJA: Rast temperature ležaja (${tempIncrease.toFixed(1)}°C) korelira sa prisustvom Babbitt metala (${babbittTotal} ppm). HITNO: Provjeriti aksijalni zazor, ležaj gubi materijal!`;
        }

        return null;
    }
}
