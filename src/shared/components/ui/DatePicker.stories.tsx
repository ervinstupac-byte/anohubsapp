import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';
import { useState } from 'react';

const meta: Meta<typeof DatePicker> = {
  title: 'Shared/UI/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const Demo = ({ ...args }) => {
  const [date, setDate] = useState<Date>();
  return (
    <div className="max-w-sm">
      <DatePicker {...args} value={date} onChange={setDate} />
    </div>
  );
};

export const Default: Story = {
  render: args => <Demo {...args} />,
  args: {
    placeholder: 'Select a date',
  },
};

export const WithDefaultValue: Story = {
  render: args => {
    const [date, setDate] = useState<Date>(new Date());
    return (
      <div className="max-w-sm">
        <DatePicker {...args} value={date} onChange={setDate} />
      </div>
    );
  },
};
