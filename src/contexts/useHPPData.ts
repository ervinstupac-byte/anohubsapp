import { useEffect, useCallback } from 'react';
import { useHPPDesign } from './HPPDesignContext.tsx';
import { useRisk } from './RiskContext.tsx';

/**
 * useHPPData - Central Dispatcher Hook
 * Bridiing HPPBuilder (Design) and RiskAssessment (Diagnostics)
 */
export const useHPPData = () => {
    const { currentDesign } = useHPPDesign();
    const { updateThresholds } = useRisk();

    const syncDesignToRisk = useCallback(() => {
        if (!currentDesign) return;

        const { head, flow } = currentDesign.parameters;
        const overrides: Record<string, { high: string[], medium: string[] }> = {};

        // 1. Dynamic Alignment Thresholds based on Head
        // If head > 200m (Pelton/High Francis), the tolerance is extremely critical
        if (head > 200) {
            overrides['q2'] = {
                high: ['no', 'paper only'],
                medium: ['partially']
            };
        } else {
            overrides['q2'] = {
                high: ['no'],
                medium: ['partially', 'paper only']
            };
        }

        // 2. Vibration Thresholds based on Flow (MW equivalent)
        // High flow turbines have more kinetic energy, making monitoring critical
        if (flow > 100) {
            overrides['q14'] = {
                high: ['not installed/functional', 'some require checking'],
                medium: []
            };
        } else {
            overrides['q14'] = {
                high: ['not installed/functional'],
                medium: ['some require checking']
            };
        }

        // 3. Foundation Thresholds based on Specific Speed (n_sq)
        const n_sq = parseFloat(currentDesign.calculations.n_sq);
        if (n_sq > 350) { // Kaplan
            overrides['q3'] = {
                high: ['no', 'unknown', 'scheduled'],
                medium: []
            };
        }

        updateThresholds(overrides);
    }, [currentDesign, updateThresholds]);

    // Automatically sync when design changes
    useEffect(() => {
        syncDesignToRisk();
    }, [currentDesign?.parameters.head, currentDesign?.parameters.flow, syncDesignToRisk]);

    return {
        syncDesignToRisk,
        currentDesign
    };
};
