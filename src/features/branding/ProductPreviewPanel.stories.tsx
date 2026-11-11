import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreviewPanelExample } from '../../stories/WorkflowCompositions';
import { storyProductIds } from '../../stories/WorkflowScenario';
import { ProductPreviewPanel } from './ProductPreviewPanel';

const meta = { title: 'Branding/Components/ProductPreviewPanel', component: ProductPreviewPanel, parameters: { docs: { description: { component: 'Desktop preview panel with production artwork mapping, product-specific switches, and carousel navigation. The parent workspace uses existing Step 2 layout classes.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ProductPreviewPanel>;
export default meta;
type Story = StoryObj;
export const FirstProduct: Story = { render: () => <PreviewPanelExample productIds={storyProductIds.mixed} /> };
export const MiddleProduct: Story = { render: () => <PreviewPanelExample productIds={storyProductIds.six} activeProductId="70-series" /> };
export const LastProduct: Story = { render: () => <PreviewPanelExample productIds={storyProductIds.six} activeProductId="sensi-module" /> };
export const TextOnlyProduct: Story = { render: () => <PreviewPanelExample productIds={['blue-12', 'sensi-smart']} /> };
export const LogoOnlyImprint: Story = { render: () => <PreviewPanelExample productIds={['sensi-smart', '80-series']} imprintMode="logo" /> };
export const LogoAndText: Story = { render: () => <PreviewPanelExample productIds={['sensi-smart']} imprintMode="both" /> };
export const UnconfiguredProduct: Story = { render: () => <PreviewPanelExample productIds={storyProductIds.mixed} configured={false} /> };
export const LongProductName: Story = { render: () => <PreviewPanelExample productIds={['sensi-module', 'sensi-smart']} activeProductId="sensi-module" /> };
