import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ResponsiveActionFooter } from './ResponsiveActionFooter';

const meta = { title: 'Design System/Layout/ResponsiveActionFooter', component: ResponsiveActionFooter, args: { backLabel: 'Back to products', onBack: fn(), onContinue: fn(), continueDisabled: false, testId: 'storybook-action-footer' }, argTypes: { backLabel: { control: 'text' }, continueDisabled: { control: 'boolean' }, onBack: { control: false }, onContinue: { control: false }, testId: { control: false } }, parameters: { layout: 'fullscreen', docs: { description: { component: 'Fixed workflow action area. Use a full-height canvas and the responsive viewport presets to inspect its real safe-area behavior.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ResponsiveActionFooter>;
export default meta;
type Story = StoryObj;
export const Enabled: Story = {};
export const Disabled: Story = { args: { continueDisabled: true } };
export const AlternateBackLabel: Story = { args: { backLabel: 'Back to imprint details' } };
