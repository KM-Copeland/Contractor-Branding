import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopStep2 } from './DesktopStep2';
import { DesktopStep2Example } from '../../stories/WorkflowCompositions';

const meta = { title: 'Screens/Branding/DesktopStep2', component: DesktopStep2, parameters: { layout: 'fullscreen', docs: { description: { component: 'Production desktop Step 2 composition with imprint form, live preview workspace, selected-product rail, and fixed action row.' } } }, tags: ['autodocs'] } satisfies Meta<typeof DesktopStep2>;
export default meta;
type Story = StoryObj;
export const PopulatedWorkflow: Story = { render: () => <DesktopStep2Example /> };
