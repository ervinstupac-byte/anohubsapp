// Particle Analysis Service - AI Visual Classification
// Identifies particle types from ferography microscope images

export interface ParticleImage {
    imageData: string; // Base64 or URL
    magnification: number; // e.g., 400x
    timestamp: number;
}

export interface ParticleClassification {
    particleType: 'BABBITT_FLAKE' | 'FATIGUE_CHUNK' | 'CUTTING_WEAR' | 'SAND' | 'RUST' | 'FIBER';
    confidence: number; // 0-100%
    characteristics: {
        shape: 'FLAKY' | 'CHUNKY' | 'ANGULAR' | 'SPHERICAL' | 'FIBROUS';
        appearance: 'SHINY' | 'DARK' | 'RUSTY' | 'TRANSPARENT';
        size: number; // microns
        count: number;
    };
    source: string; // What component is wearing
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FerographyReport {
    timestamp: number;
    assetId: number;
    particles: ParticleClassification[];
    overallWearRate: 'NORMAL' | 'ELEVATED' | 'SEVERE' | 'CATASTROPHIC';
    recommendations: string[];
}

export class ParticleAnalysisService {
    /**
     * AI Visual Classification of Particle Type
     * Simulates ML model trained on ferography images
     */
    static classifyParticle(image: ParticleImage, metalContent: any): ParticleClassification {
        // In production: Use TensorFlow.js or similar for real image analysis
        // For now, simulate based on metal content ratios

        const { tin, lead, copper, iron } = metalContent;
        const babbittTotal = tin + lead + copper;

        // RULE 1: Shiny flaky particles = Babbitt metal (bearing wear)
        if (babbittTotal > iron && tin > 10) {
            return {
                particleType: 'BABBITT_FLAKE',
                confidence: 92,
                characteristics: {
                    shape: 'FLAKY',
                    appearance: 'SHINY',
                    size: 15, // microns
                    count: Math.floor(babbittTotal * 2)
                },
                source: 'Babbitt bearing lining (bijeli metal)',
                severity: babbittTotal > 50 ? 'CRITICAL' : babbittTotal > 30 ? 'HIGH' : 'MEDIUM'
            };
        }

        // RULE 2: Dark chunky particles = Fatigue (gears/shaft)
        if (iron > babbittTotal && iron > 50) {
            return {
                particleType: 'FATIGUE_CHUNK',
                confidence: 88,
                characteristics: {
                    shape: 'CHUNKY',
                    appearance: 'DARK',
                    size: 25, // microns
                    count: Math.floor(iron * 1.5)
                },
                source: 'Zamor materijala zupčanika ili vratila',
                severity: iron > 100 ? 'CRITICAL' : iron > 70 ? 'HIGH' : 'MEDIUM'
            };
        }

        // RULE 3: Angular shiny particles = Cutting wear (normal)
        if (iron > 10 && iron < 40) {
            return {
                particleType: 'CUTTING_WEAR',
                confidence: 75,
                characteristics: {
                    shape: 'ANGULAR',
                    appearance: 'SHINY',
                    size: 8,
                    count: Math.floor(iron * 3)
                },
                source: 'Normalno trošenje (run-in period)',
                severity: 'LOW'
            };
        }

        // Default: Unknown contamination
        return {
            particleType: 'SAND',
            confidence: 60,
            characteristics: {
                shape: 'ANGULAR',
                appearance: 'TRANSPARENT',
                size: 12,
                count: 100
            },
            source: 'Externa kontaminacija (pijesak/prašina)',
            severity: 'MEDIUM'
        };
    }

    /**
     * Generate comprehensive ferography report
     */
    static generateFerographyReport(
        assetId: number,
        images: ParticleImage[],
        metalContent: any
    ): FerographyReport {
        const particles: ParticleClassification[] = [];

        // Classify each image
        for (const image of images) {
            const classification = this.classifyParticle(image, metalContent);
            particles.push(classification);
        }

        // Determine overall wear rate
        const criticalCount = particles.filter(p => p.severity === 'CRITICAL').length;
        const highCount = particles.filter(p => p.severity === 'HIGH').length;

        let overallWearRate: FerographyReport['overallWearRate'];
        if (criticalCount > 0) overallWearRate = 'CATASTROPHIC';
        else if (highCount > 2) overallWearRate = 'SEVERE';
        else if (highCount > 0) overallWearRate = 'ELEVATED';
        else overallWearRate = 'NORMAL';

        // Generate recommendations
        const recommendations: string[] = [];

        const babbittParticles = particles.filter(p => p.particleType === 'BABBITT_FLAKE');
        if (babbittParticles.length > 0) {
            recommendations.push(
                '🔴 HITNO: Provjeriti aksijalni zazor ležajeva. Babbitt metal (bijeli metal) se odljuštiava.'
            );
            recommendations.push(
                'Planirati zamjenu ležajeva u roku od 2-4 sedmice prije potpunog otkaza.'
            );
        }

        const fatigueParticles = particles.filter(p => p.particleType === 'FATIGUE_CHUNK');
        if (fatigueParticles.length > 0) {
            recommendations.push(
                '🟡 UPOZORENJE: Metalne čestice ukazuju na zamor materijala. Magnetna provjera pukotina obavezna.'
            );
            recommendations.push(
                'NDT (non-destructive testing) na zupčanicima i vratilu.'
            );
        }

        if (overallWearRate === 'NORMAL') {
            recommendations.push(
                '✅ Normalan nivo habanja. Nastaviti sa redovnim monitoringom.'
            );
        }

        return {
            timestamp: Date.now(),
            assetId,
            particles,
            overallWearRate,
            recommendations
        };
    }

    /**
     * AI Correlation: Temperature + Particles → Diagnosis
     */
    static correlateTempAndParticles(
        particles: ParticleClassification[],
        bearingTemp: number,
        baselineTemp: number
    ): string | null {
        const tempRise = bearingTemp - baselineTemp;
        const babbittParticles = particles.filter(p => p.particleType === 'BABBITT_FLAKE');

        if (babbittParticles.length > 0 && tempRise > 10) {
            const totalCount = babbittParticles.reduce((sum, p) => sum + p.characteristics.count, 0);

            return `🤖 AI KORELACIJA: Rast temperature ležaja (${tempRise.toFixed(1)}°C) + ${totalCount} Babbitt čestica (sjajne ljuspičaste) = HITNO: Provjeriti aksijalni zazor, ležaj gubi materijal!`;
        }

        return null;
    }
}
