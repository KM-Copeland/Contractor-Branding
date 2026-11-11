import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { products } from '../../data/products';
import type { ProductFamily } from '../../types/workflow';
import { emptyBranding, storyProductIds } from '../../stories/WorkflowScenario';
import { SelectedProductsSidebar } from './SelectedProductsSidebar';

const meta = { title: 'Product Selection/Components/SelectedProductsSidebar', component: SelectedProductsSidebar, args: { mode: 'selection', products: [], branding: emptyBranding(), onRemoveProduct: () => {} }, argTypes: { mode: { control: 'radio', options: ['selection', 'branding'] }, products: { control: false }, branding: { control: false } }, parameters: { docs: { description: { component: 'Shared scrolling selected-products rail with stable heading and footer regions.' } } }, tags: ['autodocs'] } satisfies Meta<typeof SelectedProductsSidebar>;
export default meta;
type Story = StoryObj;
function StatefulSidebar({ mode = 'selection', ids = storyProductIds.mixed }: { mode?: 'selection' | 'branding'; ids?: string[] }) { const [items, setItems] = useState<ProductFamily[]>(products.filter(p => ids.includes(p.id))); const [active, setActive] = useState(items[0]?.id); return <div style={{ height: 'min(80vh, 700px)', width: 360, border: '1px solid #dee4ed' }}><SelectedProductsSidebar mode={mode} products={items} branding={emptyBranding()} activeProductId={active} onSelectProduct={setActive} onRemoveProduct={id => setItems(current => current.filter(p => p.id !== id))} emptyState={<p style={{ padding: 20 }}>No products selected. Choose a family to begin.</p>} footer={<button type="button" disabled={!items.length}>Continue</button>} /></div>; }
export const EmptySelection: Story = { render: () => <StatefulSidebar ids={[]} /> };
export const OneSelected: Story = { args: { products: [products[0]], mode: 'selection' } };
export const MultiCategorySelection: Story = { render: () => <StatefulSidebar /> };
export const BrandingModeActiveProduct: Story = { render: () => <StatefulSidebar mode="branding" /> };
export const ScrollAndRemove: Story = { render: () => <StatefulSidebar ids={products.map(p => p.id)} mode="branding" /> };
