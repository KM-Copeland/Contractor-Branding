import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SearchInput } from './Controls';

const meta = { title: 'Design System/Inputs/SearchInput', component: SearchInput, args: { value: '', onChange: fn() }, argTypes: { value: { control: 'text' }, onChange: { control: false } }, parameters: { docs: { description: { component: 'Controlled product-family search. Typing and clearing update the story state.' } } }, tags: ['autodocs'] } satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj;
function Controlled({ initial = '' }: { initial?: string }) { const [value, setValue] = useState(initial); return <div style={{ width: 'min(100%, 680px)' }}><SearchInput value={value} onChange={setValue} /><p aria-live="polite">{value ? `Searching for “${value}”` : 'No search query'}</p></div>; }
export const Empty: Story = { render: () => <Controlled /> };
export const Populated: Story = { render: () => <Controlled initial="Sensi" /> };
export const LongQuery: Story = { render: () => <Controlled initial="Sensi Touch Smart compatible wallplate" /> };
