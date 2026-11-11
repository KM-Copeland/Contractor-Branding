import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { products } from '../../data/products';
import type { ProductBrandingConfiguration } from '../../types/workflow';
import { ProductConfigurationCard } from './ProductConfigurationCard';

const productById = Object.fromEntries(products.map(product => [product.id, product]));
const meta = {
  title: 'Branding/Components/ProductConfigurationCard',
  component: ProductConfigurationCard,
  args: { product: products[0], branding: { logoEnabled: false, textEnabled: false }, hasLogo: true, hasText: true, onBrandingChange: fn() },
  argTypes: {
    product: { control: 'select', options: products.map(product => product.id), mapping: productById },
    branding: { control: 'object' },
    hasLogo: { control: 'boolean' },
    hasText: { control: 'boolean' },
    onBrandingChange: { control: false },
  },
  parameters: { docs: { description: { component: 'Uses real catalog products and capabilities. The wrapper keeps only the current product’s two branding flags locally; the existing card controls availability and mutual exclusion.' } } },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductConfigurationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveCard(args: ComponentProps<typeof ProductConfigurationCard>) {
  const [branding, setBranding] = useState<ProductBrandingConfiguration>(args.branding);
  useEffect(() => setBranding(args.branding), [args.branding]);
  return <ProductConfigurationCard {...args} branding={branding} onBrandingChange={(key, value) => {
    setBranding(current => ({ ...current, [key]: value }));
    args.onBrandingChange(key, value);
  }} />;
}

export const Unconfigured: Story = { render: args => <InteractiveCard {...args} /> };
export const LogoConfigured: Story = { args: { branding: { logoEnabled: true, textEnabled: false } }, render: args => <InteractiveCard {...args} /> };
export const TextConfigured: Story = { args: { branding: { logoEnabled: false, textEnabled: true } }, render: args => <InteractiveCard {...args} /> };
export const LogoAndTextConfigured: Story = { args: { product: products.find(product => product.id === 'sensi-smart')!, branding: { logoEnabled: true, textEnabled: true } }, render: args => <InteractiveCard {...args} /> };
export const MutuallyExclusiveImprint: Story = { args: { product: products.find(product => product.id === 'classic-80')!, branding: { logoEnabled: true, textEnabled: false } }, render: args => <InteractiveCard {...args} /> };
export const LongProductName: Story = { args: { product: products.find(product => product.id === 'sensi-module')! }, render: args => <InteractiveCard {...args} /> };
