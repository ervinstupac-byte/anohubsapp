import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from './GlassCard';
import { Cpu } from 'lucide-react';
import { ModernButton } from './ModernButton';

const meta: Meta<typeof GlassCard> = {
  title: 'Shared/UI/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const Default: Story = {
  args: {
    children: <p className="text-slate-300">Card content here</p>,
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Subtitle',
    children: <p className="text-slate-300">Card content with title and subtitle</p>,
  },
};

export const WithIcon: Story = {
  args: {
    title: 'System Status',
    icon: <Cpu className="w-6 h-6" />,
    children: <p className="text-slate-300">Card with icon</p>,
  },
};

export const WithAction: Story = {
  args: {
    title: 'Quick Actions',
    action: <ModernButton size="sm" variant="ghost">Action</ModernButton>,
    children: <p className="text-slate-300">Card with action button</p>,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="grid gap-4">
      <GlassCard title="Base Variant" variant="base">
      <p className="text-slate-300">Base glass card</p>
      </GlassCard>
      <GlassCard title="Deep Variant" variant="deep">
        <p className="text-slate-300">Deep glass card</p>
      </GlassCard>
      <GlassCard title="Commander Variant" variant="commander">
        <p className="text-slate-300">Commander glass card</p>
      </GlassCard>
    </div>
  ),
};
