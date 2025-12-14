import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Hub } from './Hub';
import { NavigationProvider } from '../contexts/NavigationContext';

const meta: Meta<typeof Hub> = {
  title: 'Components/Hub',
  component: Hub,
};

export default meta;
type Story = StoryObj<typeof Hub>;

export const Default: Story = {
  render: () => (
    <NavigationProvider value={{ navigateTo: () => {}, navigateBack: () => {}, navigateToHub: () => {}, navigateToTurbineDetail: () => {}, showFeedbackModal: () => {} }}>
      <Hub />
    </NavigationProvider>
  )
};
