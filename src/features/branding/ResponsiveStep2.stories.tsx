import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponsiveStep2 } from './ResponsiveStep2';
import { ResponsiveStep2Example } from '../../stories/WorkflowCompositions';

const meta = { title: 'Screens/Branding/ResponsiveStep2', component: ResponsiveStep2, parameters: { layout: 'fullscreen', docs: { description: { component: 'Production responsive Step 2 composition. Stories expose Imprint Details, Configure List, and Configure Preview through the screen’s supported state props.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ResponsiveStep2>;
export default meta;
type Story = StoryObj;
export const ImprintDetails: Story = { render: () => <ResponsiveStep2Example initialView="imprint" /> };
export const ConfigureList: Story = { render: () => <ResponsiveStep2Example initialView="configure" initialMode="list" /> };
export const ConfigurePreview: Story = { render: () => <ResponsiveStep2Example initialView="configure" initialMode="preview" /> };
