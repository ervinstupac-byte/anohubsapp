import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Questionnaire from '../Questionnaire';
import { QuestionnaireProvider } from '../../contexts/QuestionnaireContext';
import { RiskProvider } from '../../contexts/RiskContext';
import { NavigationProvider } from '../../contexts/NavigationContext';
import type { NavigationContextType } from '../../types';

describe('Questionnaire component', () => {
  test('renders operational data fields and disables continue button when required fields are empty', async () => {
    const navValue: NavigationContextType = {
      navigateTo: () => {},
      navigateBack: () => {},
      navigateToHub: () => {},
      navigateToTurbineDetail: () => {},
      showFeedbackModal: () => {}
    };
    render(
      <NavigationProvider value={navValue}>
        <RiskProvider>
          <QuestionnaireProvider>
            <Questionnaire onShowSummary={() => {}} />
          </QuestionnaireProvider>
        </RiskProvider>
      </NavigationProvider>
    );

    // Check presence of operational input placeholder (label and input are not connected by id)
    expect(screen.getByPlaceholderText(/Godina puštanja u rad/i)).toBeInTheDocument();

    // Continue button should be present and initially disabled
    const continueButton = screen.getByRole('button', { name: /Nastavi na procjenu discipline/i });
    expect(continueButton).toBeDisabled();
  });

  test('fills operational data, advances through questions, and completes assessment updating risk', async () => {
    const navValue: NavigationContextType = {
      navigateTo: () => {},
      navigateBack: () => {},
      navigateToHub: () => {},
      navigateToTurbineDetail: () => {},
      showFeedbackModal: () => {}
    };

    const showSummary = vi.fn();
    render(
      <NavigationProvider value={navValue}>
        <RiskProvider>
          <QuestionnaireProvider>
            <Questionnaire onShowSummary={showSummary} />
          </QuestionnaireProvider>
        </RiskProvider>
      </NavigationProvider>
    );

    // Fill required operational fields (first 4)
    const commissioning = screen.getByPlaceholderText(/Godina puštanja u rad/i);
    const maintenance = screen.getByPlaceholderText(/Ciklus održavanja/i);
    const power = screen.getByPlaceholderText(/Projektirana izlazna snaga/i);
    const turbineType = screen.getByPlaceholderText(/Tip turbine/i);

    await userEvent.type(commissioning, '2020');
    await userEvent.type(maintenance, '1');
    await userEvent.type(power, '2');
    await userEvent.type(turbineType, 'Francis');

    // Next button should be enabled
    const nextBtn = screen.getByRole('button', { name: /Nastavi na procjenu discipline/i });
    expect(nextBtn).toBeEnabled();
    await userEvent.click(nextBtn);

    // Now in question steps; click options for each question
    const firstQuestionOption = screen.getByText(/Nikad|Unutar nominalnih granica|Potpuno ažurna/i);
    await userEvent.click(firstQuestionOption);

    const QUESTIONS_COUNT = 3; // matches component QUESTIONS in Questionnaire
    for (let i = 1; i <= QUESTIONS_COUNT; i++) {
      // Select a visible option (the first option button)
      const optionButtons = screen.getAllByRole('button').filter(b => b.className.includes('p-4'));
      if (optionButtons.length > 0) {
        await userEvent.click(optionButtons[0]);
      }
      const nextQuestionBtn = screen.getByRole('button', { name: /Sljedeće pitanje|Završi procjenu/i });
      await userEvent.click(nextQuestionBtn);
    }

    // Now we should be on the final summary button
    const summaryButton = screen.getByRole('button', { name: /Prikaži sažetak i izvještaj o riziku/i });
    await userEvent.click(summaryButton);

    // Should call summary show
    expect(showSummary).toHaveBeenCalled();
  });
});
