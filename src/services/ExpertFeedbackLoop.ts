/**
 * ExpertFeedbackLoop
 * - Records manual overrides
 * - Allows updating Bayesian priors for guardians (ShaftSealGuardian, ThrustBearingMaster)
 */

import { SovereignMemory } from './SovereignMemory';

export type OverrideRecord = { timestamp: number; actor: string; action: string; context?: any; validated?: boolean };

export default class ExpertFeedbackLoop {
  private memory: SovereignMemory;

  constructor() {
    this.memory = new SovereignMemory();
  }

  recordOverride(r: OverrideRecord) {
    try {
      this.memory.saveOverrideRecord(r);
    } catch (e) {
      console.warn('Failed to record override', e);
    }
  }

  /**
   * Self-adjust simple Bayesian prior for a guardian based on validated overrides.
   * Example: increase prior probability of seal-failure when many validated overrides indicated true positives.
   */
  adjustPriors(guardianKey: string, validatedTruePositives: number, validatedTotal: number) {
    // Retrieve existing prior from memory (if any)
    const key = `prior_${guardianKey}`;
    let prior = ((this.memory as any).getItem && (this.memory as any).getItem(key)) as number | null;
    if (prior === null || prior === undefined) prior = 0.05; // default prior

    // Bayesian update (Beta-like): new_prior ~ (alpha + TP) / (alpha+beta + N)
    const alpha = prior * 100;
    const beta = (1 - prior) * 100;
    const newPrior = (alpha + validatedTruePositives) / (alpha + beta + validatedTotal);
    try {
      this.memory.saveOverrideRecord({ timestamp: Date.now(), actor: 'system', action: `update_prior:${guardianKey}`, context: { old: prior, new: newPrior } });
    } catch (e) { /* ignore */ }
    return newPrior;
  }
}
