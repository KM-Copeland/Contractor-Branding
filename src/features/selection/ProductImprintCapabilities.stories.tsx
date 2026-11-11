import type { Meta, StoryObj } from '@storybook/react-vite';
import { products } from '../../data/products';
import { ProductImprintCapabilities } from './ProductImprintCapabilities';

const meta = { title: 'Product Selection/Components/ProductImprintCapabilities', component: ProductImprintCapabilities, args: { capabilities: products[0].imprintCapabilities }, argTypes: { capabilities: { control: 'object' } }, parameters: { docs: { description: { component: 'Read-only capability badges derived from real catalog products.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ProductImprintCapabilities>;
export default meta;
type Story = StoryObj;
export const LogoAndText: Story = { args: { capabilities: products.find(p => p.id === 'sensi-smart')!.imprintCapabilities } };
export const EitherLogoOrText: Story = { args: { capabilities: products.find(p => p.id === 'classic-80')!.imprintCapabilities } };
export const TextOnly: Story = { args: { capabilities: products.find(p => p.id === 'blue-12')!.imprintCapabilities } };
export const NoImprint: Story = {
  args: { capabilities: { supportsLogo: false, supportsText: false, supportsSimultaneousImprint: false } },
  render: () => <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}><ProductImprintCapabilities capabilities={{ supportsLogo: false, supportsText: false, supportsSimultaneousImprint: false }} /><p style={{ margin: 0 }}>This product has no imprint capabilities, so it displays no badges.</p></div>,
};
