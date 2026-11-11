import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from './AppShell';
import { AppShellExample } from '../stories/WorkflowCompositions';

const meta = { title: 'Application/AppShell', component: AppShell, parameters: { layout: 'fullscreen', docs: { description: { component: 'Shared fixed navigation, progress track, content region, and notice handling.' } } }, tags: ['autodocs'] } satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj;
export const ProductSelectionProgress: Story = { render: () => <AppShellExample progress="select-products" /> };
export const BrandingProgress: Story = { render: () => <AppShellExample progress="brand-review" /> };
export const CompletionProgress: Story = { render: () => <AppShellExample progress="complete" /> };
export const LandingWithoutProgress: Story = { render: () => <AppShellExample progress={null} /> };
