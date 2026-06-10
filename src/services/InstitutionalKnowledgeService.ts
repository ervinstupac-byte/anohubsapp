import ExperienceLedgerService from './ExperienceLedgerService';

export interface ExpertKnowledgeEntry {
    id: string;
    incidentPattern: string;
    turbineFamily: 'KAPLAN' | 'FRANCIS' | 'PELTON';
    turbineVariant: string;
    symptoms: Record<string, unknown>;
    rootCause: string;
    solution: string;
    fieldNotes: string;
    lessonLearned: string;
    preventiveMeasures: string[];
    reportedBy: string;
    verifiedBy: string[];
    confidenceScore: number;
    upvotes: number;
    downvotes: number;
    viewCount: number;
    relatedForensicRecordings: string[];
    relatedInterlockEvents: string[];
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

export interface EngineerNote {
    id: string;
    assetId: number;
    engineerId: string;
    engineerName: string;
    noteType: 'OBSERVATION' | 'TIP' | 'WARNING' | 'SUCCESS_STORY';
    title: string;
    content: string;
    upvotes: number;
    isPinned: boolean;
    photoUrls: string[];
    videoUrl?: string;
    createdAt: number;
}

export interface KnowledgeSearchResult {
    entry: ExpertKnowledgeEntry;
    relevanceScore: number;
    matchedSymptoms: string[];
    matchedTags: string[];
}

export class InstitutionalKnowledgeService {
    private static knowledgeBase: Map<string, ExpertKnowledgeEntry> = new Map();

    static async submitKnowledge(
        engineerId: string,
        engineerName: string,
        entry: Omit<ExpertKnowledgeEntry, 'id' | 'reportedBy' | 'verifiedBy' | 'confidenceScore' | 'upvotes' | 'downvotes' | 'viewCount' | 'createdAt' | 'updatedAt'>
    ): Promise<ExpertKnowledgeEntry> {
        const knowledge: ExpertKnowledgeEntry = {
            id: `KNOWLEDGE-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            ...entry,
            reportedBy: engineerId,
            verifiedBy: [],
            confidenceScore: 0.5,
            upvotes: 0,
            downvotes: 0,
            viewCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.knowledgeBase.set(knowledge.id, knowledge);

        await ExperienceLedgerService.record({
            symptom_observed: knowledge.incidentPattern,
            actual_cause: knowledge.rootCause,
            resolution_steps: [knowledge.solution, ...knowledge.preventiveMeasures].join('\n'),
            asset_id: null
        });

        return knowledge;
    }

    static async searchBySymptoms(
        symptoms: string[],
        turbineFamily?: string
    ): Promise<KnowledgeSearchResult[]> {
        const remote = await ExperienceLedgerService.lookupDiagnosis(symptoms.join(' '));
        if (remote.success && remote.data?.length) {
            for (const row of remote.data as Array<Record<string, unknown>>) {
                const pattern = String(row.symptom_key || row.symptom_observed || 'Field incident');
                if (!this.knowledgeBase.has(pattern)) {
                    this.knowledgeBase.set(pattern, {
                        id: String(row.id || pattern),
                        incidentPattern: pattern,
                        turbineFamily: (turbineFamily as ExpertKnowledgeEntry['turbineFamily']) || 'FRANCIS',
                        turbineVariant: 'unknown',
                        symptoms: { remote_match: true },
                        rootCause: String(row.actual_cause || row.root_cause || ''),
                        solution: String(row.resolution_steps || row.solution || ''),
                        fieldNotes: '',
                        lessonLearned: '',
                        preventiveMeasures: [],
                        reportedBy: 'experience_ledger',
                        verifiedBy: [],
                        confidenceScore: 0.7,
                        upvotes: 0,
                        downvotes: 0,
                        viewCount: 0,
                        relatedForensicRecordings: [],
                        relatedInterlockEvents: [],
                        tags: symptoms,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                }
            }
        }

        const results: KnowledgeSearchResult[] = [];

        for (const entry of this.knowledgeBase.values()) {
            if (turbineFamily && entry.turbineFamily !== turbineFamily) continue;

            const matchedSymptoms: string[] = [];
            let symptomMatchScore = 0;

            for (const symptom of symptoms) {
                if (JSON.stringify(entry.symptoms).toLowerCase().includes(symptom.toLowerCase())) {
                    matchedSymptoms.push(symptom);
                    symptomMatchScore += 1;
                }
            }

            const matchedTags: string[] = [];
            let tagMatchScore = 0;

            for (const symptom of symptoms) {
                if (entry.tags.some(tag => tag.toLowerCase().includes(symptom.toLowerCase()))) {
                    matchedTags.push(symptom);
                    tagMatchScore += 0.5;
                }
            }

            const totalScore = (symptomMatchScore + tagMatchScore) / Math.max(symptoms.length, 1);

            if (matchedSymptoms.length > 0 || matchedTags.length > 0) {
                results.push({
                    entry,
                    relevanceScore: totalScore * entry.confidenceScore,
                    matchedSymptoms,
                    matchedTags
                });
            }
        }

        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return results.slice(0, 10);
    }

    static async verifyKnowledge(knowledgeId: string, verifierId: string, verifierName: string): Promise<void> {
        const entry = this.knowledgeBase.get(knowledgeId);
        if (!entry) throw new Error('Knowledge entry not found');

        if (!entry.verifiedBy.includes(verifierId)) {
            entry.verifiedBy.push(verifierId);
            entry.confidenceScore = Math.min(0.95, 0.5 + entry.verifiedBy.length * 0.1);
            entry.updatedAt = Date.now();
            console.log(`Verified "${entry.incidentPattern}" by ${verifierName}`);
        }
    }

    static async voteKnowledge(knowledgeId: string, vote: 'UP' | 'DOWN'): Promise<void> {
        const entry = this.knowledgeBase.get(knowledgeId);
        if (!entry) throw new Error('Knowledge entry not found');

        if (vote === 'UP') entry.upvotes++;
        else entry.downvotes++;

        const totalVotes = entry.upvotes + entry.downvotes;
        if (totalVotes > 0) {
            const voteRatio = entry.upvotes / totalVotes;
            entry.confidenceScore = entry.confidenceScore * 0.7 + voteRatio * 0.3;
        }
        entry.updatedAt = Date.now();
    }

    static async trackView(knowledgeId: string): Promise<void> {
        const entry = this.knowledgeBase.get(knowledgeId);
        if (entry) entry.viewCount++;
    }

    static async getByPattern(pattern: string): Promise<ExpertKnowledgeEntry[]> {
        const results: ExpertKnowledgeEntry[] = [];
        for (const entry of this.knowledgeBase.values()) {
            if (entry.incidentPattern.toLowerCase().includes(pattern.toLowerCase())) {
                results.push(entry);
            }
        }
        return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    static async addFieldNote(note: Omit<EngineerNote, 'id' | 'upvotes' | 'isPinned' | 'createdAt'>): Promise<EngineerNote> {
        const fieldNote: EngineerNote = {
            ...note,
            id: `NOTE-${Date.now()}`,
            upvotes: 0,
            isPinned: false,
            createdAt: Date.now()
        };

        await ExperienceLedgerService.record({
            symptom_observed: note.title,
            actual_cause: note.noteType,
            resolution_steps: note.content,
            asset_id: note.assetId ? String(note.assetId) : null
        });

        return fieldNote;
    }
}

export const SEED_KNOWLEDGE: Array<Omit<ExpertKnowledgeEntry, 'id' | 'reportedBy' | 'verifiedBy' | 'confidenceScore' | 'upvotes' | 'downvotes' | 'viewCount' | 'createdAt' | 'updatedAt'>> = [
    {
        incidentPattern: 'Kaplan Horizontal Hydraulic Runaway After Pipe Replacement',
        turbineFamily: 'KAPLAN',
        turbineVariant: 'kaplan_horizontal',
        symptoms: {
            servo_pressure_spike: true,
            hose_rupture: true,
            loud_bang: true
        },
        rootCause: 'Hydraulic hose diameter change without system recharacterization.',
        solution: 'Replace hose with correct diameter and retune PID controller.',
        fieldNotes: 'Happened during emergency repair with wrong stock part.',
        lessonLearned: 'Hydraulic systems are sensitive to component changes.',
        preventiveMeasures: ['Stock correct replacement parts', 'Require consultant sign-off for non-standard components'],
        relatedForensicRecordings: [],
        relatedInterlockEvents: [],
        tags: ['hydraulic', 'runaway', 'kaplan', 'critical']
    },
    {
        incidentPattern: 'Francis Draft Tube Vortex Core at Part Load',
        turbineFamily: 'FRANCIS',
        turbineVariant: 'francis_vertical',
        symptoms: {
            low_frequency_vibration: true,
            draft_tube_pressure_oscillation: true,
            load_below_70_percent: true
        },
        rootCause: 'Unstable vortex core at part load excites draft tube resonance.',
        solution: 'Install air admission system or increase load above 70%.',
        fieldNotes: 'Customer reported washing-machine sound during low water season.',
        lessonLearned: 'Francis turbines perform poorly at sustained part load.',
        preventiveMeasures: ['Include air admission in specs', 'Monitor draft tube pressure oscillation'],
        relatedForensicRecordings: [],
        relatedInterlockEvents: [],
        tags: ['francis', 'vortex', 'draft-tube', 'part-load', 'vibration']
    },
    {
        incidentPattern: 'Pelton Water Hammer from Emergency Stop',
        turbineFamily: 'PELTON',
        turbineVariant: 'pelton_horizontal',
        symptoms: {
            pressure_spike_in_penstock: true,
            deflector_closed_too_fast: true
        },
        rootCause: 'Emergency shutdown closed nozzle before deflector lead time elapsed.',
        solution: 'Program deflector-first shutdown sequence with minimum 2s delay.',
        fieldNotes: 'Grid fault triggered emergency stop and penstock weld crack.',
        lessonLearned: 'Pelton emergency stops must respect hydraulic transients.',
        preventiveMeasures: ['Test emergency stop monthly', 'Install surge protection'],
        relatedForensicRecordings: [],
        relatedInterlockEvents: [],
        tags: ['pelton', 'water-hammer', 'emergency-stop', 'critical']
    }
];

SEED_KNOWLEDGE.forEach(entry => {
    InstitutionalKnowledgeService.submitKnowledge('SYSTEM', 'AnoHUB Knowledge Base', entry);
});
