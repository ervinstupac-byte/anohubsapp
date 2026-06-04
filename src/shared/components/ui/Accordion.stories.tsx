import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Shared/UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item1">
      <AccordionItem value="item1">
        <AccordionTrigger>What is this?</AccordionTrigger>
        <AccordionContent>This is an accordion component.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>How does it work?</AccordionTrigger>
        <AccordionContent>Click the headers to expand/collapse.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Can I customize it?</AccordionTrigger>
        <AccordionContent>Yes, you can customize all aspects.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['item1']}>
      <AccordionItem value="item1">
        <AccordionTrigger>Item 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Item 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Item 3</AccordionTrigger>
        <AccordionContent>Content 3</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
