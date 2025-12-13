import React from 'react';
import { render, screen } from '@testing-library/react';
import InstallationGuarantee from '../InstallationGuarantee';

describe('InstallationGuarantee component', () => {
  test('renders heading and protocol steps', () => {
    render(<InstallationGuarantee />);
    expect(screen.getByText(/Installation Standard/i)).toBeInTheDocument();
    expect(screen.getByText(/Precision Assembly/i)).toBeInTheDocument();
    // Check for at least one protocol step
    expect(screen.getByText(/Laser shaft alignment/i)).toBeInTheDocument();
  });
});
