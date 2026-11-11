import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BackButton } from './Controls';

const meta = {
  title: 'Design System/Components/Actions/BackButton',
  component: BackButton,
  args: { label: 'Back to products', onClick: fn() },
  argTypes: { label: { control: 'text' }, onClick: { control: false } },
  parameters: { docs: { description: { component: 'Compact square navigation button. Its accessible name comes from the label prop.' } } },
  tags: ['autodocs'],
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
