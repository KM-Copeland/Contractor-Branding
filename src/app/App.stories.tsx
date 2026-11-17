import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from './App';

const meta = { title: 'Application/Full Workflow', component: App, parameters: { layout: 'fullscreen', docs: { description: { component: 'Integration story using the real app, router hash, workflow reducer, and screens. Navigation stays inside Storybook’s preview iframe.' } } }, tags: ['autodocs'] } satisfies Meta<typeof App>;
export default meta;
type Story = StoryObj;
export const InteractiveWorkflow: Story = {};
export const SignedInNavigationPresentation: Story = { args: { accountPresentation: 'signed-in' }, parameters: { viewport: { defaultViewport: 'mobile390' }, docs: { description: { story: 'The host can request the signed-in drawer label explicitly. This is presentation only and does not represent an authentication session.' } } } };
