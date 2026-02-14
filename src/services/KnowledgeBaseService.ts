import { SovereignMemory } from './SovereignMemory';

export interface OracleResult {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    type: 'LEGACY_RULE' | 'INCIDENT_REPORT' | 'ANCIENT_WISDOM';
    confidence: number;
}

const KNOWLEDGE_BASE = [
    {
        id: 'LEGACY_001',
        title: 'Spiral Casing Weld Protocol',
        content: 'The Ant-King decreed in 2026: Do not weld the Casing blindly. Check the fillet radius first. Use Generative Design V5.0 (File: D42_Gen5). Maintain the curve.',
        type: 'LEGACY_RULE'
    },
    {
        id: 'LEGACY_002',
        title: 'Cavitation Resonance',
        content: 'Warning: 120Hz hum indicates draft tube vortex rope. Do not increase load. Inject air at 2.5 bar immediately.',
        type: 'INCIDENT_REPORT'
    },
    {
        id: 'LEGACY_003',
        title: 'The Great Blackout of 2024',
        content: 'Lesson: Grid stability requires 20% inertia reserve. Never disconnect the flywheel during storm mode.',
        type: 'ANCIENT_WISDOM'
    },
    {
        id: 'LEGACY_004',
        title: 'Corrosion Protection Constants',
        content: 'Magnesium anodes deplete 3x faster in brackish water. Use Zinc for salinity > 15ppt. Reference NACE SP0169.',
        type: 'LEGACY_RULE'
    }
];

/**
 * KNOWLEDGE_BASE SERVICE (Formerly Historical Data Service)
 * The Living Archive 🗣️📜
 * Answers questions from the future using the Master's preserved logic.
 */
export const KnowledgeBaseService = {
    search: (query: string): OracleResult[] => {
        if (!query || query.length < 2) return [];

        const q = query.toLowerCase();
        return KNOWLEDGE_BASE.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.content.toLowerCase().includes(q)
        ).map(item => ({
            ...item,
            excerpt: item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content,
            type: item.type as any,
            confidence: 0.95
        }));
    },

    // Legacy method for backward compatibility if needed
    consult: (query: string): string => {
        const results = KnowledgeBaseService.search(query);
        if (results.length > 0) {
            return `[ARCHIVE]: ${results[0].content}`;
        }
        return `[ARCHIVE]: The silence is deafening.`;
    },

    learnFromOverride: (context: string, data: any) => {
        // In a real system, this would write to the vector database
        console.log(`[KnowledgeBase] Learning from override: ${context}`, data);
    }
};
