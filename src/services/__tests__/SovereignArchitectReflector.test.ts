import { describe, it, expect } from 'vitest';
import { generateArchitectReport } from '../SovereignArchitectReflector';

describe('SovereignArchitectReflector', () => {
  it('generates an architect report with summary and subsystems count', () => {
    const report = generateArchitectReport();
    expect(report).toHaveProperty('summary');
    expect(report.summary.startsWith('I am aware of')).toBe(true);
    // Should be aware of at least 5 subsystems
    expect(report.subsystemsCount).toBeGreaterThanOrEqual(5);
  });
});
