import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
