import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppShell } from './AppShell';
import { AppShellExample } from '../stories/WorkflowCompositions';

const meta = { title: 'Application/AppShell', component: AppShell, parameters: { layout: 'fullscreen', docs: { description: { component: 'Shared fixed header and progress placement. At 1280px the header shows Order History, FAQ, Support, and the account control; below 1280px the account action moves into the accessible modal drawer.' } } }, tags: ['autodocs'] } satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj;
export const ProductSelectionProgress: Story = { render: () => <AppShellExample progress="select-products" /> };
export const BrandingProgress: Story = { render: () => <AppShellExample progress="brand-review" /> };
export const CompletionProgress: Story = { render: () => <AppShellExample progress="complete" /> };
export const LandingWithoutProgress: Story = { render: () => <AppShellExample progress={null} /> };
export const DesktopWithSupport: Story = { render: () => <AppShellExample progress="select-products" />, parameters: { viewport: { defaultViewport: 'desktop1280' } } };
export const ResponsiveMenuClosed: Story = { render: () => <AppShellExample progress="select-products" />, parameters: { viewport: { defaultViewport: 'mobile390' } } };
export const ResponsiveMenuOpen: Story = {
  render: () => <AppShellExample progress="select-products" />,
  parameters: { viewport: { defaultViewport: 'mobile390' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await expect(canvas.getByRole('dialog', { name: 'Menu' })).toBeVisible();
  },
};
export const MobileSignedIn: Story = {
  render: () => <AppShellExample progress="select-products" accountPresentation="signed-in" />,
  parameters: { viewport: { defaultViewport: 'mobile390' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await expect(canvas.getByRole('button', { name: 'Logout' })).toBeVisible();
  },
};
export const MobileSignedOut: Story = {
  render: () => <AppShellExample progress="select-products" accountPresentation="signed-out" />,
  parameters: { viewport: { defaultViewport: 'mobile390' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await expect(canvas.getByRole('button', { name: 'Sign In' })).toBeVisible();
  },
};
export const TabletNavigation: Story = { render: () => <AppShellExample progress="select-products" />, parameters: { viewport: { defaultViewport: 'tablet768' } } };
export const BreakpointCloseBehavior: Story = {
  render: () => <AppShellExample progress="select-products" />,
  parameters: {
    viewport: {
      defaultViewport: 'navigation1279',
      options: { navigation1279: { name: 'Responsive edge 1279', styles: { width: '1279px', height: '800px' }, type: 'tablet' } },
    },
    docs: { description: { story: 'Open the menu at this responsive edge and resize the preview to 1280px. The shell closes the drawer and moves focus to the desktop navigation.' } },
  },
};
