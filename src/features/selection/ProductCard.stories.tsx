import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { products } from '../../data/products';
import { ProductCard } from './ProductCard';

const meta = { title: 'Product Selection/Components/ProductCard', component: ProductCard, args: { product: products[0], checked: false }, argTypes: { product: { control: 'select', options: products.map(p => p.id), mapping: Object.fromEntries(products.map(p => [p.id, p])) }, checked: { control: 'boolean' }, toggle: { control: false } }, parameters: { docs: { description: { component: 'Catalog card with actual product art, selection checkbox, and capability badges.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ProductCard>;
export default meta;
type Story = StoryObj;
function Interactive({ productId = 'sensi-smart' }: { productId?: string }) { const [checked, setChecked] = useState(false); const product = products.find(p => p.id === productId)!; return <div style={{ width: 320 }}><ProductCard product={product} checked={checked} toggle={() => setChecked(value => !value)} /><p aria-live="polite">{checked ? `${product.summaryName} selected` : 'No card selected'}</p></div>; }
export const Unselected: Story = { render: () => <Interactive /> };
export const Selected: Story = { args: { checked: true, toggle: () => {} } };
export const TextOnlyProduct: Story = { args: { product: products.find(p => p.id === 'blue-12')!, checked: true, toggle: () => {} } };
export const LongProductName: Story = { args: { product: products.find(p => p.id === 'classic-80-programmable')!, checked: false, toggle: () => {} } };
export const InteractiveSelection: Story = { render: () => <Interactive productId="wallplate-touch2-lite" /> };
