import type { Meta, StoryObj } from '@storybook/react';
import { ForensicDashboard } from './ForensicDashboard';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config'; // Adjust path as needed
import { useForensics } from '../../hooks/useForensics';

// Mock the hook
// Note: In a real setup, we might use a decorator to mock the hook or context provider
// Here we'll rely on the default behavior or mock it if possible via parameters if supported by the component
// Since ForensicDashboard uses a custom hook, we might need to mock it at module level if we were using Jest/Vitest,
// but for Storybook we often wrap in a context provider or accept props.
// However, ForensicDashboard doesn't take props for state, it uses the hook internally.
// We'll create a wrapper that mocks the hook's return value if possible, or just render it as is 
// assuming the hook has default values or we can control it via global mocks.

// For now, let's render it wrapped in I18nextProvider.

const meta: Meta<typeof ForensicDashboard> = {
  title: 'Forensics/Dashboard',
  component: ForensicDashboard,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div className="bg-black min-h-screen">
            <Story />
        </div>
      </I18nextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ForensicDashboard>;

export const Idle: Story = {};

export const AttackInProgress: Story = {
    // Note: Since we can't easily mock the internal hook state without a Context, 
    // this story might just render the default state unless we modify the component to accept props 
    // or use a mock provider.
    // Ideally, ForensicDashboard should accept `status` as a prop or get it from a Context we can mock.
};
