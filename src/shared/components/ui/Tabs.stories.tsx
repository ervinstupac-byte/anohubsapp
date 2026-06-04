import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { GlassCard } from './GlassCard';

const meta: Meta<typeof Tabs> = {
  title: 'Shared/UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <GlassCard>
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p className="text-slate-300 mt-4">Content for Tab 1</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p className="text-slate-300 mt-4">Content for Tab 2</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p className="text-slate-300 mt-4">Content for Tab 3</p>
        </TabsContent>
      </Tabs>
    </GlassCard>
  ),
};
