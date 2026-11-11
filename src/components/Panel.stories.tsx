import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from './Controls';

const meta = { title: 'Design System/Layout/Panel', component: Panel, args: { children: <><h2>Imprint details</h2><p>Shared across selected products.</p></> }, parameters: { docs: { description: { component: 'Presentation container used by the completion screen.' } } }, tags: ['autodocs'] } satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj;
export const BasicContent: Story = {};
export const LongerContent: Story = { args: { children: <><h2>Configuration summary</h2><p>Your imprint is shared across all selected product families.</p><ul><li>Sensi Smart — text on</li><li>80 Series — text on</li><li>Sensi Touch 2, Sensi Lite — text on</li></ul><p>No order or production data has been submitted.</p></> } };
