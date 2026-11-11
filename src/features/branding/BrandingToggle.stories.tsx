import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BrandingToggle } from './BrandingToggle';

const meta = {
  title: 'Design System/Components/Inputs/BrandingToggle',
  component: BrandingToggle,
  args: { label: 'Logo', selected: false, disabled: false, onClick: fn() },
  argTypes: {
    label: { control: 'radio', options: ['Logo', 'Text'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onClick: { control: false },
  },
  render: function Render(args) {
    const [selected, setSelected] = useState(args.selected);
    useEffect(() => setSelected(args.selected), [args.selected]);
    return <BrandingToggle {...args} selected={selected} onClick={() => { setSelected(value => !value); args.onClick(); }} />;
  },
  parameters: { docs: { description: { component: 'Controlled Logo/Text toggle used by product configuration. The story owns only a small local selected state so the control responds to clicks.' } } },
  tags: ['autodocs'],
} satisfies Meta<typeof BrandingToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = { args: { selected: false } };
export const On: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
