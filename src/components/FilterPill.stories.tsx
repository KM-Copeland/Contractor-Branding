import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FilterPill } from './Controls';

const meta = { title: 'Design System/Actions/FilterPill', component: FilterPill, args: { active: false, children: 'Thermostats', onClick: fn() }, argTypes: { onClick: { control: false } }, parameters: { docs: { description: { component: 'Compact category button with a native pressed state.' } } }, tags: ['autodocs'] } satisfies Meta<typeof FilterPill>;
export default meta;
type Story = StoryObj;
export const Inactive: Story = {};
export const Active: Story = { args: { active: true } };
export const LongLabel: Story = { args: { children: 'Wallplates and compatible accessories' } };
export const InteractiveGroup: Story = { render: () => { const [active, setActive] = useState('All'); return <div role="group" aria-label="Product category" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{['All', 'Thermostats', 'Wallplates', 'Other'].map(label => <FilterPill key={label} active={active === label} onClick={() => setActive(label)}>{label}</FilterPill>)}</div>; } };
