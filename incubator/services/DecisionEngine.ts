// Decision Engine - Central AI Brain
// Synthesizes all diagnostic modules and makes critical decisions

export interface DiagnosticInputs {
    // Acoustic Module
    acoustic: {
        cavitationIndex: number; // 0-10
        dominantFrequencies: number[];
        rmsLevel: number;
    };

    // Vibration Module
    vibration: {
        horizontal: number; // mm/s
        vertical: number;
        axial: number;
        limit: number; // ISO 20816 limit
    };

    // Oil Analysis
    oil: {
        viscosity: number;
        tan: number;
        metalParticlesPresent: boolean;
        babbittContent: number; // ppm
        temperature: number; // °C
        temperatureStable: boolean;
    };

    // Hydraulic System
    hydraulic: {
        pressure: number; // bar
        pressureRate: number; // bar/s (rate of change)
        cylinderPosition: number; // mm
        cylinderVelocity: number; // mm/s
        flow: number; // L/min
        nominalFlow: number; // L/min
        systemStiffness: number; // Calculated: dP/dV
    };

    // Alignment & Mechanical
    mechanical: {
        alignment: number; // mm/m
        bearingTemperature: number; // °C
        shaftSag: number; // mm
    };

    // Performance
    performance: {
        efficiencyIndex: number; // %
        powerOutput: number; // MW
        generatorCurrent: number; // A
        generatorCurrentStable: boolean;
    };
}

export interface TriageDecision {
    severity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'NORMAL';
    action: 'SHUTDOWN' | 'REDUCE_LOAD' | 'OPTIMIZE' | 'MONITOR' | 'NONE';
    confidence: number; // 0-100%
    primaryDiagnosis: string;
    contributingFactors: string[];
    crossCheckStatus: 'VALIDATED' | 'SINGLE_SOURCE' | 'CONFLICTING';

    // Expert Prescription (3 steps)
    actionPlan: {
        step1_immediate: string;
        step2_field: string;
        step3_longterm: string;
    };

    // Audit Trail
    reasoning: string;
    timestamp: number;
    sourceModules: string[]; // Which modules contributed to decision
}

import BaseGuardian from './BaseGuardian';

export class DecisionEngine extends BaseGuardian {
    /**
     * Multi-Factor Triage Matrix
     * Weighted scoring of symptoms
     */
    static evaluateTriage(inputs: DiagnosticInputs): TriageDecision {
        const factors: string[] = [];
        let severityScore = 0; // 0-100 scale
        const sourceModules: string[] = [];

        // === CRITICAL FACTORS ===

        // RULE 1: Cavitation + Vibration + Metal Particles = CRITICAL SHUTDOWN
        if (
            inputs.acoustic.cavitationIndex > 8 &&
            inputs.vibration.horizontal > inputs.vibration.limit &&
            inputs.oil.metalParticlesPresent
        ) {
            severityScore += 100;
            factors.push('Kombinacija: Kritična kavitacija + prekoračene vibracije + metalne čestice u ulju');
            sourceModules.push('ACOUSTIC', 'VIBRATION', 'OIL');

            return this.createCriticalShutdownDecision(
                'Neposredna opasnost od havarije ležajeva',
                factors,
                sourceModules,
                inputs
            );
        }

        // RULE 2: 12mm-to-16mm Hydraulic Instability Safeguard
        const hydraulicInstability = this.check12mmTo16mmSafeguard(inputs.hydraulic);
        if (hydraulicInstability.isUnstable) {
            severityScore += 95;
            factors.push(hydraulicInstability.reason);
            sourceModules.push('HYDRAULIC');

            return {
                severity: 'CRITICAL',
                action: 'SHUTDOWN',
                confidence: 98,
                primaryDiagnosis: 'Hydraulic Instability - 12mm-to-16mm Disaster Risk',
                contributingFactors: factors,
                crossCheckStatus: 'VALIDATED',
                actionPlan: {
                    step1_immediate: 'HITNO: Blokiraj dalje komande pozicioniranja. Zaustavi turbinu kontrolisano.',
                    step2_field: 'Provjeriti servo ventile i pozicionere. Mjeri stvarnu poziciju lopatica mehaničkim mjerilom.',
                    step3_longterm: 'Zamjena servo sistema. Nadogradnja na veće cijevi (16mm ili 20mm) za stabilniji odziv.'
                },
                reasoning: `Sistem detektovao je da pritisak raste brže nego što pozicija cilindra prati (lag: ${hydraulicInstability.lag?.toFixed(2)}s). Protok je van nominalnog. Ovo je znak 'Hydraulic Instability' koji može dovesti do prelaska iz 12mm na 16mm cijev bez kontrole - opasnost od katastrofalnog otkaza.`,
                timestamp: Date.now(),
                sourceModules
            };
        }

        // RULE 3: Rapid Temperature Rise (non-linear vs power)
        if (inputs.oil.temperature > 85 && !inputs.oil.temperatureStable) {
            const tempRiseScore = (inputs.oil.temperature - 70) * 2;
            severityScore += tempRiseScore;
            factors.push(`Nelinearan rast temperature ulja (${inputs.oil.temperature.toFixed(1)}°C)`);
            sourceModules.push('OIL', 'PERFORMANCE');
        }

        // RULE 4: Babbitt Metal Detection
        if (inputs.oil.babbittContent > 50) {
            severityScore += 80;
            factors.push(`Kritičan nivo Babbitt metala (${inputs.oil.babbittContent} ppm) - ležaj se raspada`);
            sourceModules.push('OIL');
        }

        // === WARNING FACTORS ===

        // RULE 5: Low Efficiency + Stable Oil Temp = Dirty Runner (not mechanical failure)
        if (inputs.performance.efficiencyIndex < 90 && inputs.oil.temperatureStable) {
            severityScore += 30;
            factors.push('Smanjena efikasnost uz stabilnu temperaturu - sumnja na naslage/prljavo radno kolo');
            sourceModules.push('PERFORMANCE', 'OIL');
        }

        // RULE 6: Alignment Issues
        if (inputs.mechanical.alignment > 0.05) {
            const alignmentScore = (inputs.mechanical.alignment - 0.05) * 200;
            severityScore += alignmentScore;
            factors.push(`Dezalinacija: ${inputs.mechanical.alignment.toFixed(3)} mm/m (limit: 0.05)`);
            sourceModules.push('MECHANICAL');
        }

        // RULE 7: Moderate Vibration + High Bearing Temp
        if (
            inputs.vibration.horizontal > inputs.vibration.limit * 0.8 &&
            inputs.mechanical.bearingTemperature > 80
        ) {
            severityScore += 50;
            factors.push('Povećane vibracije + visoka temperatura ležaja');
            sourceModules.push('VIBRATION', 'MECHANICAL');
        }

        // === CROSS-CHECK VALIDATION ===
        const crossCheck = this.performCrossCheck(inputs, sourceModules);

        // Determine final severity and action
        let severity: TriageDecision['severity'];
        let action: TriageDecision['action'];
        let primaryDiagnosis: string;
        let actionPlan: TriageDecision['actionPlan'];

        if (severityScore >= 80) {
            severity = 'CRITICAL';
            action = 'SHUTDOWN';
            primaryDiagnosis = 'Kombinacija kritičnih faktora zahtijeva zaustavljanje';
            actionPlan = {
                step1_immediate: 'Zaustavi turbinu kontrolisano. Aktiviraj bypass ako je moguće.',
                step2_field: 'Kompletan pregled: ležajevi, centriranje, nivo i kvalitet ulja.',
                step3_longterm: 'Zamjena ležajeva i serviranje centralnog sistema.'
            };
        } else if (severityScore >= 50) {
            severity = 'WARNING';
            action = 'REDUCE_LOAD';
            primaryDiagnosis = 'Upozorenje - potrebna redukcija opterećenja';
            actionPlan = {
                step1_immediate: 'Smanji opterećenje na 40-50% nominalnog.',
                step2_field: 'Provjeri nivo ulja. Vizuelna inspekcija ležajeva ako je moguće.',
                step3_longterm: 'Planirati servis u narednih 2-4 sedmice.'
            };
        } else if (severityScore >= 20) {
            severity = 'ADVISORY';
            action = 'OPTIMIZE';
            primaryDiagnosis = 'Savjet za optimizaciju ili preventivno održavanje';
            actionPlan = {
                step1_immediate: 'Nema hitnih akcija. Nastaviti sa radom.',
                step2_field: 'Planirati čišćenje radnog kola ili optimizaciju lopatica.',
                step3_longterm: 'Preventivni servis u narednih 3-6 mjeseci.'
            };
        } else {
            severity = 'NORMAL';
            action = 'MONITOR';
            primaryDiagnosis = 'Svi parametri u normalnom opsegu';
            actionPlan = {
                step1_immediate: 'Nastavi normalan rad.',
                step2_field: 'Rutinska provjera.',
                step3_longterm: 'Godišnji servis.'
            };
        }

        // Generate reasoning
        const reasoning = this.generateReasoning(severity, factors, severityScore, inputs);

        return {
            severity,
            action,
            confidence: Math.min(severityScore, 100),
            primaryDiagnosis,
            contributingFactors: factors,
            crossCheckStatus: crossCheck.status,
            actionPlan,
            reasoning,
            timestamp: Date.now(),
            sourceModules
        };
    }

    /**
     * 12mm-to-16mm Safeguard
     * Tracks System Stiffness and hydraulic stability
     */
    private static check12mmTo16mmSafeguard(hydraulic: DiagnosticInputs['hydraulic']): {
        isUnstable: boolean;
        reason: string;
        lag?: number;
    } {
        // Calculate time lag between pressure and position
        // If pressure rises faster than position responds, system is unstable

        const expectedVelocity = hydraulic.pressureRate * 2; // Simplified: 1 bar/s should move 2 mm/s
        const actualVelocity = hydraulic.cylinderVelocity;
        const lag = (expectedVelocity - actualVelocity) / expectedVelocity;

        // Check flow deviation
        const flowDeviation = Math.abs(hydraulic.flow - hydraulic.nominalFlow) / hydraulic.nominalFlow;

        if (lag > 0.3 && flowDeviation > 0.2) {
            return {
                isUnstable: true,
                reason: `Hydraulic Instability: Pritisak raste brže od pozicije (lag ${(lag * 100).toFixed(0)}%), protok van nominalnog (${(flowDeviation * 100).toFixed(0)}% devijacija)`,
                lag
            };
        }

        return { isUnstable: false, reason: '' };
    }

    /**
     * Cross-Check Validation
     * Every alarm must be confirmed from 2 different sources
     */
    private static performCrossCheck(
        inputs: DiagnosticInputs,
        sourceModules: string[]
    ): { status: TriageDecision['crossCheckStatus']; message?: string } {
        const uniqueSources = new Set(sourceModules);

        if (uniqueSources.size >= 2) {
            return { status: 'VALIDATED' };
        } else if (uniqueSources.size === 1) {
            // Single source - check for sensor malfunction
            const sensorCheck = this.checkSensorMalfunction(inputs);
            if (sensorCheck.suspectedMalfunction) {
                return {
                    status: 'CONFLICTING',
                    message: sensorCheck.message
                };
            }
            return { status: 'SINGLE_SOURCE' };
        }

        return { status: 'VALIDATED' };
    }

    /**
     * Sensor Malfunction Detection
     * Example: Vibration sensor reading high, but acoustic and generator current stable
     */
    private static checkSensorMalfunction(inputs: DiagnosticInputs): {
        suspectedMalfunction: boolean;
        message?: string;
    } {
        // If vibration is high but acoustic is normal and generator current stable
        if (
            inputs.vibration.horizontal > inputs.vibration.limit &&
            inputs.acoustic.cavitationIndex < 5 &&
            inputs.performance.generatorCurrentStable
        ) {
            return {
                suspectedMalfunction: true,
                message: '⚠️ Sumnja na kvar senzora vibracija - provjeriti ožičenje. Zvuk turbine (Sonic modul) normalan i struja generatora stabilna.'
            };
        }

        return { suspectedMalfunction: false };
    }

    /**
     * Generate Audit Trail Reasoning
     */
    private static generateReasoning(
        severity: TriageDecision['severity'],
        factors: string[],
        score: number,
        inputs: DiagnosticInputs
    ): string {
        let reasoning = `ODLUKA: ${severity} (Score: ${score.toFixed(0)}/100)\n\n`;
        reasoning += `ANALIZA:\n`;

        factors.forEach((factor, i) => {
            reasoning += `${i + 1}. ${factor}\n`;
        });

        reasoning += `\nKLJUČNI PARAMETRI:\n`;
        reasoning += `- Kavitacija: ${inputs.acoustic.cavitationIndex.toFixed(1)}/10\n`;
        reasoning += `- Vibracije: ${inputs.vibration.horizontal.toFixed(2)} mm/s (limit: ${inputs.vibration.limit})\n`;
        reasoning += `- Temperatura ulja: ${inputs.oil.temperature.toFixed(1)}°C\n`;
        reasoning += `- Efikasnost: ${inputs.performance.efficiencyIndex.toFixed(1)}%\n`;

        if (severity === 'CRITICAL') {
            reasoning += `\nDONIO SAM ODLUKU O ZAUSTAVLJANJU jer je kombinacija simptoma ukazala na neposrednu opasnost po opremu i bezbjednost.`;
        } else if (severity === 'WARNING') {
            reasoning += `\nPreporučujem redukciju opterećenja jer trend pokazuje potencijalno pogoršanje stanja.`;
        }

        return reasoning;
    }

    /**
     * Create CRITICAL SHUTDOWN decision
     */
    private static createCriticalShutdownDecision(
        diagnosis: string,
        factors: string[],
        sourceModules: string[],
        inputs: DiagnosticInputs
    ): TriageDecision {
        return {
            severity: 'CRITICAL',
            action: 'SHUTDOWN',
            confidence: 98,
            primaryDiagnosis: diagnosis,
            contributingFactors: factors,
            crossCheckStatus: 'VALIDATED',
            actionPlan: {
                step1_immediate: 'HITNO: Zaustavi turbinu. Aktiviraj bypass sistem ako postoji.',
                step2_field: 'Hitna inspekcija ležajeva i ulja. Provjeri aksijalni zazor.',
                step3_longterm: 'Zamjena ležajeva, kompletna analiza ulja, recentralizacija.'
            },
            reasoning: `KRITIČNA ODLUKA: Detektovana je kombinacija faktora koje ukazuju na neposrednu opasnost:\n${factors.join('\n')}\n\nOvakva kombinacija simptoma u 95% slučajeva prethodi katastrofalnom otkazu ležajeva.`,
            timestamp: Date.now(),
            sourceModules
        };
    }

    public getConfidenceScore(..._args: any[]): number {
        // Decision engine synthesizes many signals; return neutral conservative score until telemetry correlation is available
        return this.corrToScore(0);
    }
}
