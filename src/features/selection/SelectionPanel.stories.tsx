import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectionPanel } from './SelectionPanel';
import { SelectionPanelExample } from '../../stories/WorkflowCompositions';

const meta = { title: 'Product Selection/Compositions/SelectionPanel', component: SelectionPanel, parameters: { layout: 'fullscreen', docs: { description: { component: 'The actual shared selection rail and fixed action footer, connected to workflow state in the examples.' } } }, tags: ['autodocs'] } satisfies Meta<typeof SelectionPanel>;
export default meta;
type Story = StoryObj;
export const EmptySelection: Story = { render: () => <SelectionPanelExample productIds={[]} /> };
export const SelectedProduct: Story = { render: () => <SelectionPanelExample /> };
