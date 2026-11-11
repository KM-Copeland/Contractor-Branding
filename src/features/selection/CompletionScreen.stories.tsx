import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompletionScreen } from './CompletionScreen';
import { CompletionExample } from '../../stories/WorkflowCompositions';
import { storyProductIds } from '../../stories/WorkflowScenario';

const meta = { title: 'Screens/Completion/CompletionScreen', component: CompletionScreen, parameters: { layout: 'fullscreen', docs: { description: { component: 'Final summary powered by the real workflow readiness rules; Clear All, individual removal, and Edit Products remain live.' } } }, tags: ['autodocs'] } satisfies Meta<typeof CompletionScreen>;
export default meta;
type Story = StoryObj;
export const OneConfiguredProduct: Story = { render: () => <CompletionExample /> };
export const MultipleConfiguredProducts: Story = { render: () => <CompletionExample productIds={storyProductIds.mixed} /> };
