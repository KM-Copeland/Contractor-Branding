import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { NoticeDialog } from './Controls';

const meta = { title: 'Design System/Feedback/NoticeDialog', component: NoticeDialog, args: { notice: { title: 'Order History', body: 'This section is outside the product-selection prototype.' }, close: fn() }, argTypes: { notice: { control: 'object' }, close: { control: false } }, parameters: { docs: { description: { component: 'Uses the application’s native modal dialog and close/cancel behavior.' } } }, tags: ['autodocs'] } satisfies Meta<typeof NoticeDialog>;
export default meta;
type Story = StoryObj;
export const Open: Story = { args: { notice: { title: 'FAQ', body: 'Find answers about eligible products, imprint setup, and the preview workflow.' } } };
export const DismissAndReopen: Story = { render: () => { const [notice, setNotice] = useState<{ title: string; body: string } | null>(null); return <><button type="button" onClick={() => setNotice({ title: 'Order History', body: 'This section is outside the product-selection prototype.' })}>Open notice</button><NoticeDialog notice={notice} close={() => setNotice(null)} /></>; } };
export const LongDescription: Story = { args: { notice: { title: 'About this prototype', body: 'This interactive experience helps contractors choose compatible thermostats and wallplates, add optional logo or text, configure each selected product, and review the resulting imprint preview. Choices remain local to this browser prototype.' } } };
