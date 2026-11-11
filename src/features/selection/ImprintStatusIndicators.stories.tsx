import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ProductBrandingConfiguration } from '../../types/workflow';
import { ImprintStatusIndicators } from './SelectedProductRow';

const meta = { title: 'Product Selection/Components/ImprintStatusIndicators', component: ImprintStatusIndicators, args: { branding: { logoEnabled: false, textEnabled: false } }, argTypes: { branding: { control: 'object' }, muted: { control: 'boolean' } }, parameters: { docs: { description: { component: 'Read-only accessible summary of the product’s logo and text settings.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ImprintStatusIndicators>;
export default meta;
type Story = StoryObj;
const config = (logoEnabled: boolean, textEnabled: boolean): ProductBrandingConfiguration => ({ logoEnabled, textEnabled });
export const BothOff: Story = {};
export const LogoOn: Story = { args: { branding: config(true, false) } };
export const TextOn: Story = { args: { branding: config(false, true) } };
export const BothOn: Story = { args: { branding: config(true, true) } };
export const MutedSelectionMode: Story = { args: { branding: config(false, true), muted: true } };
