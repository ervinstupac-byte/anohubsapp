import type { Meta, StoryObj } from '@storybook/react';
import { ToggleSwitch } from './ToggleSwitch';
import { useState } from 'react';

const meta: Meta<typeof ToggleSwitch> = {
  title: 'Shared/UI/ToggleSwitch',
  component: ToggleSwitch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ToggleSwitch>;

const Demo = ({ ...args }) => {
  const [checked, setChecked] = useState(false);
  return (
    <ToggleSwitch
      {...args}
      checked={checked}
      onChange={setChecked}
    />
  );
};

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    label: 'Enable notifications',
  },
};

export const Checked: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    label: 'Enabled',
  },
};

export const Disabled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    label: 'Disabled',
    disabled: true,
  },
};
