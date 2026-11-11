import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowProgress } from './WorkflowProgress';

const meta = { title: 'Design System/Feedback/WorkflowProgress', component: WorkflowProgress, args: { current: 'select-products' }, argTypes: { current: { control: 'select', options: ['select-products', 'brand-review', 'complete'] }, progress: { control: { type: 'range', min: 0, max: 100 } } }, parameters: { docs: { description: { component: 'Workflow stage progress with the production responsive height and reduced-motion behavior.' } } }, tags: ['autodocs'] } satisfies Meta<typeof WorkflowProgress>;
export default meta;
type Story = StoryObj;
export const ProductSelection: Story = { args: { current: 'select-products' } };
export const Branding: Story = { args: { current: 'brand-review' } };
export const Completion: Story = { args: { current: 'complete' } };
export const MidWorkflowProgress: Story = { args: { current: 'brand-review', progress: 60 } };
