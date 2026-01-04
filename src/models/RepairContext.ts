export interface RecoveryAction {
    id: string;
    title: string;
    description: string;
    mitigationImpact: string;
    requiredTools: string[];
    stressReductionFactor: number; // 0-1 (e.g., 0.2 means 20% reduction)
}

export interface RecoveryPath {
    conclusion: string;
    actions: RecoveryAction[];
    estimatedLifeExtension: number; // Years
}

export interface RevitalizationPlan {
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    action: string;
    impact: string;
    roiRatio: number; // Return on Investment (e.g. 15.0 means 15x savings vs cost)
    isSmallGapHighImpact: boolean;
    heritageTips?: string[];
}
