
// ===========================================
// CONTEXT ENGINE TYPES
// ===========================================

export type EntityType = 'COMPONENT' | 'PHYSICS' | 'RISK' | 'DOCUMENT' | 'HISTORY';

export type ContextTag =
    | 'hydraulic'
    | 'mechanical'
    | 'electrical'
    | 'safety'
    | 'maintenance'
    | 'critical'
    | 'efficiency'
    | 'civil'
    | 'fluid'
    | 'control'
    | 'diagnostics'
    | 'precision'
    | 'thermal';

export interface ContextTrigger {
    // 1. Data-Driven Trigger
    sensorId?: string;       // e.g., 'francis.sensors.rpm' (dot notation)
    threshold?: {
        min?: number;
        max?: number;
        condition?: 'GT' | 'LT' | 'EQ'; // Greater Than, Less Than, Equal
    };

    // 2. Navigation-Driven Trigger
    routeMatcher?: string;   // Regex string e.g., "francis\/sop\/penstock"

    // 3. State-Driven Trigger
    requiredState?: string;  // e.g., 'MAINTENANCE_MODE'
}

export interface RelatedResource {
    id: string;
    title: string;
    type: 'PDF' | 'LINK' | 'COMPONENT' | 'LOG';
    url?: string; // Internal route or external link
    preview?: string; // Short text preview
}

export interface KnowledgeNode {
    id: string;              // Unique ID e.g., 'ctx_penstock_hammer'
    type: EntityType;
    title: string;
    description: string;

    // Taxonomy
    tags: ContextTag[];

    // Activation Logic
    triggers: ContextTrigger[];

    // Content Payload
    insights: string[];      // "Water Hammer risk is elevated."
    resources: RelatedResource[];
}

export interface ActiveContext {
    nodes: KnowledgeNode[];
    score: number; // Relevance score (0-1)
}
