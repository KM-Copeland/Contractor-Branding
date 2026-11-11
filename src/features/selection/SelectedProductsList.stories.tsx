import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { products } from '../../data/products';
import type { ProductFamily } from '../../types/workflow';
import { emptyBranding, storyProductIds } from '../../stories/WorkflowScenario';
import { SelectedProductsList } from './SelectedProductsList';

const meta = { title: 'Product Selection/Components/SelectedProductsList', component: SelectedProductsList, args: { products: products.slice(0, 1), mode: 'selection', branding: emptyBranding(), onRemoveProduct: () => {} }, argTypes: { mode: { control: 'radio', options: ['selection', 'branding'] }, products: { control: false }, branding: { control: false } }, parameters: { docs: { description: { component: 'Categorizes selected products and delegates each item to the shared SelectedProductRow.' } } }, tags: ['autodocs'] } satisfies Meta<typeof SelectedProductsList>;
export default meta;
type Story = StoryObj;
function MutableList({ initial = storyProductIds.mixed }: { initial?: string[] }) { const [selected, setSelected] = useState<ProductFamily[]>(products.filter(p => initial.includes(p.id))); return <div style={{ width: 380 }}><SelectedProductsList products={selected} mode="branding" branding={emptyBranding()} activeProductId={selected[0]?.id} onSelectProduct={() => {}} onRemoveProduct={id => setSelected(value => value.filter(p => p.id !== id))} /></div>; }
export const SingleProduct: Story = {};
export const MultipleCategories: Story = { args: { products: products.filter(p => storyProductIds.mixed.includes(p.id)), mode: 'branding', activeProductId: 'sensi-smart' } };
export const MixedBranding: Story = { args: { products: products.slice(0, 3), mode: 'branding', branding: emptyBranding({ 'sensi-smart': { logoEnabled: true, textEnabled: true }, '80-series': { logoEnabled: false, textEnabled: true } }), activeProductId: '80-series' } };
export const RemoveInteraction: Story = { render: () => <MutableList /> };
