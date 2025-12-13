import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskProvider, useRisk } from '../../contexts/RiskContext';

const ConsumerTest: React.FC = () => {
  const { disciplineRiskScore, updateDisciplineRiskScore, calculateAndSetQuestionnaireRisk } = useRisk();
  return (
    <div>
      <div data-testid="score">{disciplineRiskScore}</div>
      <button onClick={() => updateDisciplineRiskScore(5, 'add')}>Add 5</button>
      <button onClick={() => updateDisciplineRiskScore(20, 'set')}>Set 20</button>
      <button onClick={() => updateDisciplineRiskScore(0, 'reset')}>Reset</button>
      <button onClick={() => calculateAndSetQuestionnaireRisk({ q1: 'no', q2: 'partially', q4: '', q5: '' })}>Calc risk</button>
    </div>
  );
};

describe('RiskContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with zero and updates via updateDisciplineRiskScore', async () => {
    render(
      <RiskProvider>
        <ConsumerTest />
      </RiskProvider>
    );
    expect(screen.getByTestId('score').textContent).toBe('0');
    await userEvent.click(screen.getByText('Add 5'));
    expect(screen.getByTestId('score').textContent).toBe('5');
    await userEvent.click(screen.getByText('Set 20'));
    expect(screen.getByTestId('score').textContent).toBe('20');
    await userEvent.click(screen.getByText('Reset'));
    expect(screen.getByTestId('score').textContent).toBe('0');
  });

  it('calculates risk from answers', async () => {
    render(
      <RiskProvider>
        <ConsumerTest />
      </RiskProvider>
    );
    await userEvent.click(screen.getByText('Calc risk'));
    // q1 'no' is high = 15, q2 'partially' is medium = 5 => total = 20
    expect(screen.getByTestId('score').textContent).toBe('20');
  });
});

export {};
