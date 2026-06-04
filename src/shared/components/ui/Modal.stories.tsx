import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { ModernButton } from './ModernButton';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Shared/UI/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

const Demo = ({ ...args }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ModernButton onClick={() => setIsOpen(true)}>Open Modal</ModernButton>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    title: 'Modal Title',
    children: (
      <div>
        <p className="text-slate-300 mb-4">
          This is a modal dialog. You can put any content here.
        </p>
        <div className="flex gap-3 justify-end">
          <ModernButton variant="ghost">Cancel</ModernButton>
          <ModernButton>Confirm</ModernButton>
        </div>
      </div>
    ),
  },
};

export const Small: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    size: 'sm',
    title: 'Small Modal',
    children: <p className="text-slate-300">Small modal content</p>,
  },
};

export const Large: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    size: 'lg',
    title: 'Large Modal',
    children: (
      <div className="space-y-4">
        <p className="text-slate-300">
          This is a large modal with more content.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Column 1</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Column 2</p>
          </div>
        </div>
      </div>
    ),
  },
};
