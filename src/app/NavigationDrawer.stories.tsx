import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationDrawerExample } from '../stories/NavigationExamples';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Navigation/NavigationDrawer',
  component: NavigationDrawerExample,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile390' },
    docs: { description: { component: 'Native modal right-side drawer shared by the responsive application shell. The production dialog provides focus containment, Escape and backdrop dismissal, background scroll locking, and focus restoration.' } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationDrawerExample>;
export default meta;
type Story = StoryObj;

export const DefaultOpen: Story = { args: { openInitially: true } };
export const SignedIn: Story = { args: { openInitially: true, accountPresentation: 'signed-in' } };
export const SignedOut: Story = { args: { openInitially: true, accountPresentation: 'signed-out' } };
export const CloseButtonAndEscape: Story = {
  args: { openInitially: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Close menu' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await userEvent.keyboard('{Escape}');
  },
};
export const PlaceholderAction: Story = {
  args: { openInitially: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'FAQ' }));
    await expect(canvas.getByRole('dialog', { name: 'FAQ' })).toBeVisible();
  },
};
export const SupportDestination: Story = {
  args: { openInitially: true },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Support' });
    await expect(link).toHaveAttribute('href', 'https://www.copeland.com/en-us/brands/white-rodgers/customer-support');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};
export const SmallViewportScrolling: Story = {
  args: { openInitially: true },
  parameters: { viewport: { defaultViewport: 'navigationShort', options: { navigationShort: { name: 'Short mobile 320 × 220', styles: { width: '320px', height: '220px' }, type: 'mobile' } } } },
};
export const ReducedMotion: Story = {
  args: { openInitially: true },
  parameters: { docs: { description: { story: 'The drawer and backdrop remove their entrance animation when the browser prefers reduced motion. Emulate that preference in the preview browser to verify.' } } },
};

