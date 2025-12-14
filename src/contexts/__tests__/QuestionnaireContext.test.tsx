import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionnaireProvider, useQuestionnaire } from '../../contexts/QuestionnaireContext';

const Consumer: React.FC = () => {
  const { operationalData, setOperationalData, setAnswer, answers } = useQuestionnaire();
  return (
    <div>
      <div data-testid="head">{operationalData.head}</div>
      <button onClick={() => setOperationalData('head', '12.34')}>Set Head</button>
      <div data-testid="answer">{answers['q1'] || ''}</div>
      <button onClick={() => setAnswer('q1', 'Never')}>Answer Q1</button>
    </div>
  );
};

describe('QuestionnaireContext', () => {
  test('allows updating operational data and answers', async () => {
    render(
      <QuestionnaireProvider>
        <Consumer />
      </QuestionnaireProvider>
    );

    const setHeadBtn = screen.getByText('Set Head');
    await userEvent.click(setHeadBtn);
    expect(screen.getByTestId('head')).toHaveTextContent('12.34');

    const answerBtn = screen.getByText('Answer Q1');
    await userEvent.click(answerBtn);
    expect(screen.getByTestId('answer')).toHaveTextContent('Never');
  });
});
