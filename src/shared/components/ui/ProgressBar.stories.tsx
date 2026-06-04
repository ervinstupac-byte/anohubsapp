import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Shared/UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 45,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    showLabel: true,
  },
};

export const Success: Story = {
  args: {
    value: 90,
    variant: 'success',
    showLabel: true,
  },
};

export const Warning: Story = {
  args: {
    value: 55,
    variant: 'warning',
    showLabel: true,
  },
};

export const Danger: Story = {
  args: {
    value: 25,
    variant: 'danger',
    showLabel: true,
  },
};
