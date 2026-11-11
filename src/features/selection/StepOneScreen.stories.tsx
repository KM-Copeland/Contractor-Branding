import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepOneScreen } from './StepOneScreen';
import { StepOneWorkflowExample } from '../../stories/WorkflowCompositions';
import { storyProductIds } from '../../stories/WorkflowScenario';

const meta = { title: 'Screens/Product Selection/StepOneScreen', component: StepOneScreen, parameters: { layout: 'fullscreen', docs: { description: { component: 'Complete catalog screen with the real search, category filters, product cards, sidebar, and workflow selection actions.' } } }, tags: ['autodocs'] } satisfies Meta<typeof StepOneScreen>;
export default meta;
type Story = StoryObj;
export const EmptyDefault: Story = { render: () => <StepOneWorkflowExample productIds={[]} /> };
export const SingleSelection: Story = { render: () => <StepOneWorkflowExample /> };
export const MultipleCategories: Story = { render: () => <StepOneWorkflowExample productIds={storyProductIds.mixed} /> };
