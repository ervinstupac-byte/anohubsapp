import type { Meta, StoryObj } from '@storybook/react';
import { ModernButton } from './ModernButton';
import { Rocket } from 'lucide-react';

const meta: Meta<typeof ModernButton> = {
  title: 'Shared/UI/ModernButton',
  component: ModernButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModernButton>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Launch',
    icon: <Rocket className="w-4 h-4" />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width',
    fullWidth: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
