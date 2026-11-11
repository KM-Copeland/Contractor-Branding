import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductPreviewCarousel } from './ProductPreviewCarousel';
import { CarouselExample } from '../../stories/WorkflowCompositions';
import { storyProductIds } from '../../stories/WorkflowScenario';

const meta = { title: 'Branding/Components/ProductPreviewCarousel', component: ProductPreviewCarousel, parameters: { layout: 'fullscreen', docs: { description: { component: 'Responsive product carousel with its real swipe, keyboard, pagination, configuration, stationary summary, and application sizing constraints. Use mobile/tablet presets to test gesture and responsive layout.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ProductPreviewCarousel>;
export default meta;
type Story = StoryObj;
export const FirstProduct: Story = { render: () => <CarouselExample productIds={storyProductIds.mixed} /> };
export const MiddleProductAndMultipleFamilies: Story = { render: () => <CarouselExample productIds={storyProductIds.six} activeProductId="70-series" /> };
export const LastProduct: Story = { render: () => <CarouselExample productIds={['sensi-smart', '80-series', 'sensi-module']} activeProductId="sensi-module" /> };
export const TextOnlyCapability: Story = { render: () => <CarouselExample productIds={['blue-12', 'sensi-smart']} /> };
export const LogoOnlyImprint: Story = { render: () => <CarouselExample productIds={['sensi-smart', '80-series']} imprintMode="logo" /> };
export const LogoAndText: Story = { render: () => <CarouselExample productIds={['sensi-smart']} imprintMode="both" /> };
export const UnconfiguredProduct: Story = { render: () => <CarouselExample productIds={storyProductIds.six} configured={false} imprintMode="none" /> };
export const ReducedMotion: Story = { parameters: { docs: { description: { story: 'Use the browser reduced-motion emulation to verify the production prefers-reduced-motion path.' } } }, render: () => <CarouselExample productIds={storyProductIds.six} /> };
