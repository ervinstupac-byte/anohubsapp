// Legacy Knowledge Service - 'WTF' Case Library
// Repository of expert experience and non-standard field solutions

export interface WTFCase {
    id: string; // e.g., "KM-2024"
    timestamp: number;

    // Classification
    turbineFamily: 'kaplan' | 'francis' | 'pelton' | 'bulb' | 'pit' | 'all';
    component: string; // e.g., "Hydraulic System", "Bearing", "Runner"
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

    // The Story
    symptom: string; // What was heard/seen
    wrongDiagnosis: string; // What others thought it was
    realCause: string; // Your discovery
    solution: string[]; // Step-by-step solution

    // Context
    plantLocation?: string;
    dateOccurred: number;
    author: string;

    // Metadata for search
    keywords: string[]; // For semantic search
    relatedCaseIds?: string[];

    // Media
    photos?: string[]; // URLs to photos
    sketches?: string[]; // URLs to hand-drawn diagrams

    // Validation
    verifiedBy?: string[]; // Other engineers who confirmed this
    timesEncountered: number; // How many times this pattern appeared
}

export interface OldSchoolTip {
    id: string;
    turbineFamily?: string;
    component: string;
    procedure: string;
    tip: string; // Personal note (e.g., "Ovaj vijak uvijek pretegnuti za 5Nm više")
    rationale: string; // Why this tip exists
    author: string;
    criticality: 'MUST_FOLLOW' | 'RECOMMENDED' | 'NICE_TO_KNOW';
}

export interface LegacyValidation {
    caseId: string;
    turbineFamily: string;
    component: string;
    checklistBefore: string[]; // Things to check before starting
    commonMistakes: string[]; // What people usually forget
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class LegacyKnowledgeService {
    private static cases: Map<string, WTFCase> = new Map();
    private static tips: Map<string, OldSchoolTip> = new Map();
    private static validations: Map<string, LegacyValidation> = new Map();

    /**
     * Initialize with seed data (real field cases)
     */
    static initialize() {
        // CASE 1: The 12mm-to-16mm Disaster
        this.addCase({
            id: 'KM-2024',
            timestamp: Date.now(),
            turbineFamily: 'kaplan',
            component: 'Hydraulic System - Servo Control',
            severity: 'CRITICAL',
            symptom: 'Cijevi na rotor-glavi se čudno trzaju. Blade position oscilira +/- 2° pri konstantnom opterećenju.',
            wrongDiagnosis: 'PID kontroler nije dobro tuniran. Servo ventil možda zaglavljen.',
            realCause: 'Inženjer zamijenio 12mm hidrauličku cijev sa 16mm misleći da će biti bolje (veći protok = brži odziv). Rezultat: Promijenio se dinamički otpor sistema (System Stiffness). Natural frequency se pomaknula i sada rezonira sa PID kontrolerom.',
            solution: [
                '1. HITNO: Vrati originalnu 12mm cijev ili dodaj akumulatore za prigušenje',
                '2. Ako se ostaje na 16mm: Re-tuniranje PID parametara (smanjiti Kp za 40%, povećati Kd)',
                '3. Instalirati software limit za maksimalnu brzinu promjene pozicije (< 5°/s)',
                '4. Testirati sa simulacijom prije puštanja u normalan pogon'
            ],
            plantLocation: 'HE Jajce, Unit 2',
            dateOccurred: new Date('2024-03-15').getTime(),
            author: 'Ervin Stupac',
            keywords: ['hydraulic', 'oscillation', 'blade pitch', 'servo', 'trzanje', 'cijev', '12mm', '16mm', 'trzaj'],
            timesEncountered: 3
        });

        // CASE 2: Silent Bearing Killer
        this.addCase({
            id: 'HEJ-2015',
            timestamp: Date.now(),
            turbineFamily: 'francis',
            component: 'Upper Guide Bearing',
            severity: 'CRITICAL',
            symptom: 'Nema očiglednih alarma. Vibracije 40% limita, kavitacija 4/10, temperatura lagano raste (0.5°C/dan). Generator radi normalno.',
            wrongDiagnosis: 'Sve u redu. Parametri u granicama.',
            realCause: 'Progresivno trošenje Babbitt metala. Kombinacija: mala kavitacija + vibracije ispod limita + spor rast temperature = faza 2 od 3 u umiranju ležaja. Analizom ulja pronađeno 45 ppm Babbitt čestica.',
            solution: [
                '1. HITNO: Analiza ulja - provjeri Sn, Pb, Cu sadržaj',
                '2. Ako Babbitt > 30 ppm: Planirati zamjenu ležaja u roku 2-4 sedmice',
                '3. Smanji opterećenje na 70% dok se ne zamijeni ležaj',
                '4. Povećaj frekvenciju vibracijskog monitoringa na dnevno',
                '5. Nakon zamjene: Provjeri centriranje (mogući uzrok preranog habanja)'
            ],
            plantLocation: 'HE Jablanica, Unit 2',
            dateOccurred: new Date('2015-08-20').getTime(),
            author: 'Ervin Stupac',
            keywords: ['bearing', 'silent failure', 'babbitt', 'oil analysis', 'progressive wear', 'ležaj', 'tiho'],
            timesEncountered: 5,
            relatedCaseIds: ['HEJ-2017', 'HEV-2019']
        });

        // CASE 3: Part-Load Vortex
        this.addCase({
            id: 'FR-VORTEX',
            timestamp: Date.now(),
            turbineFamily: 'francis',
            component: 'Draft Tube',
            severity: 'HIGH',
            symptom: 'Glasne vibracije (bukva) na 30% opterećenja. Frekvencija 8-12 Hz. Nestaje na full load i idle.',
            wrongDiagnosis: 'Nešto labavo u draft tube. Možda pukla armatura.',
            realCause: 'Part-load vortex rope - normalna pojava kod Francis turbina na djelimičnom opterećenju. Vortex u draft tube-u rezonira sa konstrukcijom. Nije kvar, ali prolongirani rad ovako oštećuje runner.',
            solution: [
                '1. NE pokušavati popraviti - ovo je dizajn karakteristika',
                '2. Izbjegavaj prolongiran rad 20-40% opterećenja',
                '3. Ako je neophodan part-load rad: Instalirati air injection u draft tube (smanjuje vortex)',
                '4. Optimalno: Ili full load ili idle - ne držati između'
            ],
            plantLocation: 'Višegrad, Unit 1',
            dateOccurred: new Date('2018-11-10').getTime(),
            author: 'Ervin Stupac',
            keywords: ['vortex', 'draft tube', 'part load', 'francis', 'vibration', 'bukva', '30%'],
            timesEncountered: 12
        });

        // CASE 4: Generator False Alarm
        this.addCase({
            id: 'SENSOR-FA',
            timestamp: Date.now(),
            turbineFamily: 'all',
            component: 'Vibration Sensor',
            severity: 'LOW',
            symptom: 'Vibration sensor pokazuje spike do 15 mm/s koji traju < 5 sekundi. Ponavljaju se nasumično.',
            wrongDiagnosis: 'Oštećen ležaj. Problem sa runnerom.',
            realCause: 'Loš kontakt na BNC konektoru akcelerometra. Električni šum. Zvuk turbine normalan, struja generatora stabilna - klasičan false alarm.',
            solution: [
                '1. Provjeri BNC konektor - očisti kontakte',
                '2. Provjeri ožičenje za prekide',
                '3. Ako se nastavi: Zamijeni kabel',
                '4. Cross-check sa akustičkim mjerenjem prije zamjene ležaja!'
            ],
            plantLocation: 'Opća pojava',
            dateOccurred: Date.now(),
            author: 'Ervin Stupac',
            keywords: ['false alarm', 'sensor', 'vibration', 'BNC', 'spike', 'konektor'],
            timesEncountered: 23
        });

        // Add Old School Tips
        this.addTip({
            id: 'TIP-001',
            turbineFamily: 'kaplan',
            component: 'Hub Cover Bolts',
            procedure: 'Pritezanje vijaka na rotor-glavi',
            tip: 'Uvijek pretegnuti za 5Nm više od manuala (manual kaže 180Nm, ti stavi 185Nm)',
            rationale: 'Vibracije na 50Hz uzrokuju da se vijci lagano olabavljuju. Dodatnih 5Nm kompenzira ovo bez rizika od pucanja.',
            author: 'Ervin Stupac',
            criticality: 'RECOMMENDED'
        });

        this.addTip({
            id: 'TIP-002',
            component: 'Bearing Clearance',
            procedure: 'Mjerenje aksijalnog zazora',
            tip: 'Mjeri ujutro prije zagrijavanja turbine. Razlika dan/noć može biti 0.1-0.15mm zbog termalne ekspanzije.',
            rationale: 'Termalna ekspanzija kućišta mijenja zazor. Jutarnje mjerenje daje konzistentne rezultate.',
            author: 'Ervin Stupac',
            criticality: 'MUST_FOLLOW'
        });

        this.addTip({
            id: 'TIP-003',
            turbineFamily: 'francis',
            component: 'Runner Bolts',
            procedure: 'Demontaža runnera',
            tip: 'NIKAD ne skidaj sve vijke odjednom. Redom, dijagonalno, po 1/4 okreta.',
            rationale: 'Runner je pod naprezanjem. Brzo skidanje vijaka može dovesti do pucanja preostalih.',
            author: 'Ervin Stupac',
            criticality: 'MUST_FOLLOW'
        });

        // Add Legacy Validations
        this.addValidation({
            caseId: 'VALIDATION-442',
            turbineFamily: 'kaplan',
            component: 'Hydraulic System',
            checklistBefore: [
                'Provjeri osigurače na potisnoj liniji',
                'Izmjeri pritisak ulja prije pokretanja',
                'Testiraj servo ventile manualno',
                'Provjeri nivo ulja u rezervoaru'
            ],
            commonMistakes: [
                'Zaborave provjeru osigurača - uzrokuje katastrofalan pad pritiska',
                'Ne testiraju servo ventile prije pokretanja - možda zaglavljen',
                'Pretpostavljaju da je nivo ulja OK bez provjere'
            ],
            riskLevel: 'HIGH'
        });
    }

    private static addCase(wtfCase: WTFCase) {
        this.cases.set(wtfCase.id, wtfCase);
    }

    private static addTip(tip: OldSchoolTip) {
        this.tips.set(tip.id, tip);
    }

    private static addValidation(validation: LegacyValidation) {
        this.validations.set(validation.caseId, validation);
    }

    /**
     * Semantic Search - NLP-based query
     */
    static semanticSearch(query: string, turbineFamily?: string): WTFCase[] {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);

        const results: Array<{ case: WTFCase; score: number }> = [];

        for (const wtfCase of this.cases.values()) {
            // Filter by turbine family if specified
            if (turbineFamily && wtfCase.turbineFamily !== 'all' && wtfCase.turbineFamily !== turbineFamily) {
                continue;
            }

            let score = 0;

            // Check keywords (highest weight)
            for (const keyword of wtfCase.keywords) {
                if (queryLower.includes(keyword.toLowerCase())) {
                    score += 10;
                }
            }

            // Check symptom
            for (const word of queryWords) {
                if (wtfCase.symptom.toLowerCase().includes(word)) {
                    score += 5;
                }
            }

            // Check component
            if (queryLower.includes(wtfCase.component.toLowerCase())) {
                score += 8;
            }

            // Check real cause
            for (const word of queryWords) {
                if (wtfCase.realCause.toLowerCase().includes(word)) {
                    score += 3;
                }
            }

            if (score > 0) {
                results.push({ case: wtfCase, score });
            }
        }

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, 5).map(r => r.case);
    }

    /**
     * Get validation checklist for component/turbine
     */
    static getValidationChecklist(
        turbineFamily: string,
        component: string
    ): LegacyValidation | null {
        for (const validation of this.validations.values()) {
            if (
                validation.turbineFamily === turbineFamily &&
                validation.component.toLowerCase().includes(component.toLowerCase())
            ) {
                return validation;
            }
        }
        return null;
    }

    /**
     * Get old school tips for procedure
     */
    static getTipsForProcedure(
        procedure: string,
        turbineFamily?: string
    ): OldSchoolTip[] {
        const tips: OldSchoolTip[] = [];

        for (const tip of this.tips.values()) {
            if (tip.procedure.toLowerCase().includes(procedure.toLowerCase())) {
                if (!turbineFamily || !tip.turbineFamily || tip.turbineFamily === turbineFamily) {
                    tips.push(tip);
                }
            }
        }

        return tips.sort((a, b) => {
            const priority = { MUST_FOLLOW: 0, RECOMMENDED: 1, NICE_TO_KNOW: 2 };
            return priority[a.criticality] - priority[b.criticality];
        });
    }

    /**
     * Get case by ID
     */
    static getCase(id: string): WTFCase | undefined {
        return this.cases.get(id);
    }

    /**
     * Get all cases
     */
    static getAllCases(): WTFCase[] {
        return Array.from(this.cases.values())
            .sort((a, b) => b.timesEncountered - a.timesEncountered);
    }

    /**
     * Get cases by severity
     */
    static getCasesBySeverity(severity: WTFCase['severity']): WTFCase[] {
        return Array.from(this.cases.values())
            .filter(c => c.severity === severity)
            .sort((a, b) => b.timesEncountered - a.timesEncountered);
    }
}

// Initialize on load
LegacyKnowledgeService.initialize();
