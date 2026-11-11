import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Controls';

const meta = {
  title: 'Design System/Components/Actions/Button',
  component: Button,
  args: { children: 'Continue', onClick: fn() },
  argTypes: {
    children: { control: 'text', description: 'Button label' },
    disabled: { control: 'boolean' },
    onClick: { control: false },
  },
  parameters: { docs: { description: { component: 'Shared primary action button. The component has no visual variant prop; examples use its supported native disabled state.' } } },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongLabel: Story = { args: { children: 'Continue to review and submit your imprint' } };
