import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrandReview } from './BrandReview';
import { BrandReviewExample } from '../../stories/WorkflowCompositions';
import { storyProductIds } from '../../stories/WorkflowScenario';

const meta = { title: 'Screens/Branding/BrandReview', component: BrandReview, parameters: { layout: 'fullscreen', docs: { description: { component: 'Workflow-connected Step 2 orchestrator. Stories initialize through WorkflowProvider actions and reuse production state, rules, validators, and responsive selection.' } } }, tags: ['autodocs'] } satisfies Meta<typeof BrandReview>;
export default meta;
type Story = StoryObj;
export const InitialImprint: Story = { render: () => <BrandReviewExample /> };
export const ConfiguredMultipleProducts: Story = { render: () => <BrandReviewExample productIds={storyProductIds.six} configured /> };
