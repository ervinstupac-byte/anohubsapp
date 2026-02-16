// import { supabase } from './supabaseClient'; // Lazy loaded to avoid test environment crashes

export interface LearningModifiers {
    thresholdMultiplier: number;
    confidencePenalty: number;
    reason?: string;
}

export interface FeedbackItem {
    action_id: string;
    reason: string;
    timestamp: string;
    context?: any;
}

export class FeedbackIntelligence {

    /**
     * Analyze recent vetoes to see if a specific action type is being rejected frequently.
     * @param actionType The type/category of action (e.g. "INCREASE_LOAD", "START_PUMP")
     * @param simulatedHistory Optional history for testing without DB
     */
    public static async getLearningModifiers(actionType: string, simulatedHistory?: FeedbackItem[]): Promise<LearningModifiers> {
        let history: FeedbackItem[] = [];

        if (simulatedHistory) {
            history = simulatedHistory;
        } else {
            try {
                // Dynamic import to avoid top-level side effects (like import.meta.env access in Node tests)
                const { supabase } = await import('./supabaseClient');

                // Fetch last 7 days of feedback
                const { data, error } = await supabase
                    .from('operator_feedback')
                    .select('*')
                    .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

                if (data) history = data;
            } catch (e) {
                // Fail safe
                return { thresholdMultiplier: 1.0, confidencePenalty: 0 };
            }
        }

        // Filter for this action type (Assuming reason or context contains the action type string for now)
        // In a real system, we'd have a structured 'action_type' column.
        // We'll search reason or context text.
        const relevantVetoes = history.filter(h =>
            (h.reason && h.reason.toLowerCase().includes(actionType.toLowerCase())) ||
            (h.context && JSON.stringify(h.context).toLowerCase().includes(actionType.toLowerCase()))
        );

        const vetoCount = relevantVetoes.length;

        // LEARNING LOGIC:
        // 3+ Vetoes => Start hesitating.
        // Multiplier = 1.0 + (ExcessVetoes * 0.15)
        // If 3 vetoes: 1.0
        // If 4 vetoes: 1.15
        // If 5 vetoes: 1.30

        // Revised per user request: "If vetoed > 3 times... increase by 15%"
        // So at 4 vetoes ( > 3), we apply 1.15.

        let multiplier = 1.0;
        let penalty = 0;
        const threshold = 3;

        if (vetoCount > threshold) {
            multiplier = 1.0 + ((vetoCount - threshold) * 0.15);
            penalty = 0.1 * (vetoCount - threshold); // Reduce confidence
        }

        // Extract most common reason
        let commonReason = undefined;
        if (vetoCount > 0) {
            const reasons = relevantVetoes.map(r => r.reason);
            // Simple mode
            commonReason = reasons.sort((a, b) =>
                reasons.filter(v => v === a).length - reasons.filter(v => v === b).length
            ).pop();
        }

        return {
            thresholdMultiplier: multiplier,
            confidencePenalty: Math.min(penalty, 0.5), // Cap penalty at 0.5
            reason: commonReason
        };
    }
}
