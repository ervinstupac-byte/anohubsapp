import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './DropdownMenu';
import { ModernButton } from './ModernButton';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Shared/UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        Open Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => console.log('Option 1')}>
          Option 1
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Option 2')}>
          Option 2
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log('Settings')}>
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
