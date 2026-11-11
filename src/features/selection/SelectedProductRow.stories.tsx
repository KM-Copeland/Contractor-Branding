import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { products } from '../../data/products';
import type { ProductBrandingConfiguration } from '../../types/workflow';
import { SelectedProductRow } from './SelectedProductRow';

const meta = { title: 'Product Selection/Components/SelectedProductRow', component: SelectedProductRow, args: { product: products[0], mode: 'selection', branding: { logoEnabled: false, textEnabled: false }, onRemove: () => {} }, argTypes: { product: { control: 'select', options: products.map(p => p.id), mapping: Object.fromEntries(products.map(p => [p.id, p])) }, mode: { control: 'radio', options: ['selection', 'branding'] }, active: { control: 'boolean' }, removeStyle: { control: 'radio', options: ['icon', 'text'] } }, parameters: { docs: { description: { component: 'Shared selected-product identity row used by the selection sidebar, branding rail, and summary list.' } } }, tags: ['autodocs'] } satisfies Meta<typeof SelectedProductRow>;
export default meta;
type Story = StoryObj;
const mixed: ProductBrandingConfiguration = { logoEnabled: true, textEnabled: false };
function Removable({ mode = 'selection', productId = 'sensi-smart' }: { mode?: 'selection' | 'branding'; productId?: string }) { const [removed, setRemoved] = useState(false); const [active, setActive] = useState(false); const product = products.find(p => p.id === productId)!; return <ul style={{ width: 360, listStyle: 'none', padding: 0 }}>{removed ? <li>Product removed from this example.</li> : <SelectedProductRow product={product} mode={mode} branding={mixed} active={active} onSelect={() => setActive(value => !value)} onRemove={() => setRemoved(true)} removeStyle="text" />}</ul>; }
export const SelectionMode: Story = {};
export const BrandingMode: Story = { args: { mode: 'branding', branding: mixed } };
export const ActivePreviewProduct: Story = { args: { mode: 'branding', active: true, branding: mixed } };
export const TextRemoveControl: Story = { args: { removeStyle: 'text' } };
export const LongProductName: Story = { args: { product: products.find(p => p.id === 'sensi-module')!, mode: 'branding' } };
export const RemovableInteraction: Story = { render: () => <Removable mode="branding" productId="wallplate-touch2-lite" /> };
