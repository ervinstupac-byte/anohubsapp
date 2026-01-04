// Institutional Knowledge Service
// Preserves 15+ years of field engineering expertise

export interface ExpertKnowledgeEntry {
    id: string;
    incidentPattern: string; // "Kaplan horizontal hydraulic runaway"
    turbineFamily: 'KAPLAN' | 'FRANCIS' | 'PELTON';
    turbineVariant: string;

    // The core knowledge
    symptoms: Record<string, any>; // {"servo_pressure_spike": true, "noise": "loud bang"}
    rootCause: string;
    solution: string;

    // The "war story" - what makes this valuable
    fieldNotes: string; // "Happened at 3am during winter startup..."
    lessonLearned: string;
    preventiveMeasures: string[];

    // Attribution and validation
    reportedBy: string; // Engineer who witnessed
    verifiedBy: string[]; // Other engineers who confirm
    confidenceScore: number; // 0-1, increases with verifications

    // Community engagement
    upvotes: number;
    downvotes: number;
    viewCount: number;

    // References
    relatedForensicRecordings: string[];
    relatedInterlockEvents: string[];

    tags: string[];
    createdAt: number;
    updatedAt: number;
}

export interface EngineerNote {
    id: string;
    assetId: string;
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
    relevanceScore: number; // 0-1
    matchedSymptoms: string[];
    matchedTags: string[];
}

export class InstitutionalKnowledgeService {
    private static knowledgeBase: Map<string, ExpertKnowledgeEntry> = new Map();

    /**
     * Submit new knowledge entry from field engineer
     */
    static async submitKnowledge(
        engineerId: string,
        engineerName: string,
        entry: Omit<ExpertKnowledgeEntry, 'id' | 'reportedBy' | 'verifiedBy' | 'confidenceScore' | 'upvotes' | 'downvotes' | 'viewCount' | 'createdAt' | 'updatedAt'>
    ): Promise<ExpertKnowledgeEntry> {
        const knowledge: ExpertKnowledgeEntry = {
            id: `KNOWLEDGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...entry,
            reportedBy: engineerId,
            verifiedBy: [],
            confidenceScore: 0.5, // Initial score
            upvotes: 0,
            downvotes: 0,
            viewCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.knowledgeBase.set(knowledge.id, knowledge);

        // In production: Save to Supabase
        /*
        await supabase.from('expert_knowledge').insert({
            incident_pattern: knowledge.incidentPattern,
            turbine_family: knowledge.turbineFamily,
            turbine_variant: knowledge.turbineVariant,
            symptoms: knowledge.symptoms,
            root_cause: knowledge.rootCause,
            solution: knowledge.solution,
            field_notes: knowledge.fieldNotes,
            lesson_learned: knowledge.lessonLearned,
            preventive_measures: knowledge.preventiveMeasures,
            reported_by: engineerId,
            tags: knowledge.tags
        });
        */

        console.log(`📚 New knowledge entry added by ${engineerName}: ${knowledge.incidentPattern}`);

        return knowledge;
    }

    /**
     * Search knowledge base by symptoms (AI-powered)
     * This is how AnoHUB "remembers" Marko's 15 years of experience
     */
    static async searchBySymptoms(
        symptoms: string[], // ["servo_pressure_spike", "hose_rupture", "loud_bang"]
        turbineFamily?: string
    ): Promise<KnowledgeSearchResult[]> {
        const results: KnowledgeSearchResult[] = [];

        for (const [id, entry] of this.knowledgeBase.entries()) {
            // Filter by turbine family if specified
            if (turbineFamily && entry.turbineFamily !== turbineFamily) continue;

            // Calculate symptom match
            const matchedSymptoms: string[] = [];
            let symptomMatchScore = 0;

            for (const symptom of symptoms) {
                if (JSON.stringify(entry.symptoms).toLowerCase().includes(symptom.toLowerCase())) {
                    matchedSymptoms.push(symptom);
                    symptomMatchScore += 1;
                }
            }

            // Calculate tag match
            const matchedTags: string[] = [];
            let tagMatchScore = 0;

            for (const symptom of symptoms) {
                if (entry.tags.some(tag => tag.toLowerCase().includes(symptom.toLowerCase()))) {
                    matchedTags.push(symptom);
                    tagMatchScore += 0.5;
                }
            }

            const totalScore = (symptomMatchScore + tagMatchScore) / symptoms.length;

            // Include if at least one symptom matches
            if (matchedSymptoms.length > 0 || matchedTags.length > 0) {
                results.push({
                    entry,
                    relevanceScore: totalScore * entry.confidenceScore, // Weight by community validation
                    matchedSymptoms,
                    matchedTags
                });
            }
        }

        // Sort by relevance
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return results.slice(0, 10); // Top 10 results
    }

    /**
     * Verify knowledge entry (another engineer confirms it)
     * Increases confidence score
     */
    static async verifyKnowledge(
        knowledgeId: string,
        verifierId: string,
        verifierName: string
    ): Promise<void> {
        const entry = this.knowledgeBase.get(knowledgeId);
        if (!entry) throw new Error('Knowledge entry not found');

        if (!entry.verifiedBy.includes(verifierId)) {
            entry.verifiedBy.push(verifierId);

            // Increase confidence score
            // Formula: confidence = 0.5 + (verifications * 0.1), max 0.95
            entry.confidenceScore = Math.min(0.95, 0.5 + entry.verifiedBy.length * 0.1);
            entry.updatedAt = Date.now();

            console.log(`✅ ${verifierName} verified "${entry.incidentPattern}" (confidence: ${(entry.confidenceScore * 100).toFixed(0)}%)`);
        }
    }

    /**
     * Upvote/downvote knowledge entry
     */
    static async voteKnowledge(
        knowledgeId: string,
        vote: 'UP' | 'DOWN'
    ): Promise<void> {
        const entry = this.knowledgeBase.get(knowledgeId);
        if (!entry) throw new Error('Knowledge entry not found');

        if (vote === 'UP') {
            entry.upvotes++;
        } else {
            entry.downvotes++;
        }

        // Adjust confidence based on community feedback
        const totalVotes = entry.upvotes + entry.downvotes;
        if (totalVotes > 0) {
            const voteRatio = entry.upvotes / totalVotes;
            entry.confidenceScore = entry.confidenceScore * 0.7 + voteRatio * 0.3; // Weighted average
        }

        entry.updatedAt = Date.now();
    }

    /**
     * Track view (for analytics)
     */
    static async trackView(knowledgeId: string): Promise<void> {
        const entry = this.knowledgeBase.get(knowledgeId);
        if (entry) {
            entry.viewCount++;
        }
    }

    /**
     * Get knowledge for specific incident pattern
     */
    static async getByPattern(pattern: string): Promise<ExpertKnowledgeEntry[]> {
        const results: ExpertKnowledgeEntry[] = [];

        for (const entry of this.knowledgeBase.values()) {
            if (entry.incidentPattern.toLowerCase().includes(pattern.toLowerCase())) {
                results.push(entry);
            }
        }

        return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    /**
     * Get top contributors (leaderboard)
     */
    static async getTopContributors(limit: number = 10): Promise<Array<{
        engineerId: string;
        contributionCount: number;
        totalUpvotes: number;
        averageConfidence: number;
    }>> {
        const contributorMap = new Map<string, {
            count: number;
            upvotes: number;
            confidenceSum: number;
        }>();

        for (const entry of this.knowledgeBase.values()) {
            const existing = contributorMap.get(entry.reportedBy) || {
                count: 0,
                upvotes: 0,
                confidenceSum: 0
            };

            existing.count++;
            existing.upvotes += entry.upvotes;
            existing.confidenceSum += entry.confidenceScore;

            contributorMap.set(entry.reportedBy, existing);
        }

        const contributors = Array.from(contributorMap.entries()).map(([id, stats]) => ({
            engineerId: id,
            contributionCount: stats.count,
            totalUpvotes: stats.upvotes,
            averageConfidence: stats.confidenceSum / stats.count
        }));

        return contributors
            .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
            .slice(0, limit);
    }

    /**
     * Add engineer field note (quick tip)
     */
    static async addFieldNote(note: Omit<EngineerNote, 'id' | 'upvotes' | 'isPinned' | 'createdAt'>): Promise<EngineerNote> {
        const fieldNote: EngineerNote = {
            ...note,
            id: `NOTE-${Date.now()}`,
            upvotes: 0,
            isPinned: false,
            createdAt: Date.now()
        };

        console.log(`📝 Field note added by ${note.engineerName}: ${note.title}`);

        return fieldNote;
    }

    /**
     * AI-assisted knowledge extraction from forensic recordings
     * Automatically suggest knowledge entries from incidents
     */
    static async extractKnowledgeFromIncident(
        forensicRecordingId: string,
        incidentDescription: string
    ): Promise<Partial<ExpertKnowledgeEntry>> {
        // AI analysis of forensic data to suggest knowledge entry
        // This could use GPT-4 to analyze telemetry patterns

        const suggestion: Partial<ExpertKnowledgeEntry> = {
            incidentPattern: incidentDescription,
            symptoms: {
                // Extracted from forensic data
            },
            rootCause: 'AI-suggested based on pattern analysis',
            solution: 'Requires engineer review',
            fieldNotes: 'Auto-generated from forensic recording. Please review and enhance.',
            tags: ['auto-generated', 'needs-review']
        };

        console.log('🤖 AI suggested knowledge entry from incident');

        return suggestion;
    }
}

// ===== SEED DATA (Examples of institutional knowledge) =====

export const SEED_KNOWLEDGE: Array<Omit<ExpertKnowledgeEntry, 'id' | 'reportedBy' | 'verifiedBy' | 'confidenceScore' | 'upvotes' | 'downvotes' | 'viewCount' | 'createdAt' | 'updatedAt'>> = [
    {
        incidentPattern: 'Kaplan Horizontal Hydraulic Runaway After Pipe Replacement',
        turbineFamily: 'KAPLAN',
        turbineVariant: 'kaplan_horizontal',
        symptoms: {
            servo_pressure_spike: true,
            hose_rupture: true,
            pipe_diameter_change: true,
            loud_bang: true,
            blade_uncontrolled_movement: true
        },
        rootCause: '12mm hydraulic hose replaced with 16mm without system recharacterization. Increased oil volume reduced damping, pressure spike exceeded design limits.',
        solution: '1. Replace hose with correct 12mm diameter\n2. Increase accumulator volume to compensate if 16mm required\n3. Install pressure relief valve at 15 bar\n4. Retune PID controller for new hydraulic dynamics',
        fieldNotes: 'Happened at 3am during emergency repair. Technician used "what we had in stock". The larger hose seemed like an upgrade but caused catastrophic failure. ALWAYS simulate hydraulic changes before implementation. The sound was like a gunshot - woke up the entire village.',
        lessonLearned: 'Hydraulic system is HIGHLY sensitive to component changes. Even "minor" pipe diameter changes can cause disasters. NEVER bypass safety validation.',
        preventiveMeasures: [
            'Implement mandatory Safety Interlock for all hydraulic changes',
            'Train technicians on hydraulic transient physics',
            'Stock correct replacement parts - no improvisation',
            'Require consultant sign-off for non-standard components'
        ],
        relatedForensicRecordings: [],
        relatedInterlockEvents: [],
        tags: ['hydraulic', 'runaway', 'kaplan', 'horizontal', 'critical', '12mm-16mm', 'pipe']
    },
    {
        incidentPattern: 'Francis Draft Tube Vortex Core at Part Load',
        turbineFamily: 'FRANCIS',
        turbineVariant: 'francis_vertical',
        symptoms: {
            low_frequency_vibration: true,
            draft_tube_pressure_oscillation: true,
            noise_increase: true,
            efficiency_drop: true,
            load_below_70_percent: true
        },
        rootCause: 'Operating at 45% load creates unstable vortex core in draft tube. Vortex shedding frequency (1.2 Hz) excites draft tube resonance.',
        solution: '1. Install air admission system at draft tube inlet\n2. Increase load to >70% design point\n3. If must operate at part load, adjust guide vane settings to minimize swirl\n4. Consider installing vortex suppression cone retrofit',
        fieldNotes: 'Customer complained of "washing machine sound" during low water season when forced to run at 40% load. The vibration was felt throughout the powerhouse. Air admission immediately solved it - like magic. Cost $5k, saved $500k in potential damage.',
        lessonLearned: 'Francis turbines HATE part-load operation. Design point is king. If you must operate off-design, install air admission system from day one.',
        preventiveMeasures: [
            'Include air admission system in all Francis specs',
            'Educate operators on optimal load range',
            'Monitor draft tube pressure oscillation as early warning',
            'Consider variable-speed drive for part-load flexibility'
        ],
        relatedForensicRecordings: [],
        relatedInterlockEvents: [],
        tags: ['francis', 'vortex', 'draft-tube', 'part-load', 'vibration', 'air-admission']
    },
    {
        incidentPattern: 'Pelton Water Hammer from Emergency Stop',
        turbineFamily: 'PELTON',
        turbineVariant: 'pelton_horizontal',
        symptoms: {
            pressure_spike_in_penstock: true,
            deflector_closed_too_fast: true,
            pipe_damage: true,
            water_column_separation: true
        },
        rootCause: 'Emergency shutdown activated deflector without lead time. Nozzle closed simultaneously, causing water hammer (pressure spike to 180 bar from 100 bar design).',
        solution: '1. ALWAYS close deflector BEFORE nozzle (minimum 2 second lead)\n2. Install surge tank upstream of nozzle\n3. Program emergency sequence: Deflector → 2s delay → Nozzle\n4. Add pressure relief valve on penstock',
        fieldNotes: 'Grid fault triggered emergency stop. Operator heard "BOOM" from penstock. Inspection found weld crack in elbow joint. This was a $200k repair that could have destroyed the entire penstock. Emergency sequences MUST be properly programmed - test them!',
        lessonLearned: 'Pelton emergency stops are NOT instant. Hydraulic transients will destroy your system if you close too fast. Deflector is your friend - use it first.',
        preventiveMeasures: [
            'Test emergency stop sequence monthly',
            'Install surge protection (tank or air chamber)',
            'Train operators on proper shutdown sequence',
            'Implement interlock: deflector must close before nozzle can move'
        ],
        relatedForensicRecordings: [],
        relatedInterlockEvents: [],
        tags: ['pelton', 'water-hammer', 'emergency-stop', 'deflector', 'penstock', 'critical']
    }
];

// Load seed data
SEED_KNOWLEDGE.forEach(entry => {
    InstitutionalKnowledgeService.submitKnowledge(
        'SYSTEM',
        'AnoHUB Knowledge Base',
        entry
    );
});
