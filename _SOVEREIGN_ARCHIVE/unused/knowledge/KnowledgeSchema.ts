
export interface KnowledgeStandard {
    code: string;
    title: string;
    description: string;
    limits: Record<string, {
        value: number;
        unit: string;
        severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
    }[]>;
    referenceUrl?: string;
}

export interface TroubleshootingRule {
    id: string;
    symptom: string;
    condition: string; // JavaScript expression string to evaluate against TechState
    probableCauses: string[];
    remedies: string[];
    kbReference: string; // e.g. KB-REF-04
}

export interface MaintenanceProcedure {
    id: string;
    title: string;
    steps: {
        order: number;
        action: string;
        safetyCheck?: string;
    }[];
    toolsRequired: string[];
}

export interface KnowledgeBase {
    standards: KnowledgeStandard[];
    troubleshooting: TroubleshootingRule[];
    procedures: MaintenanceProcedure[];
}
