import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImprintForm } from './ImprintForm';
import { EmptyImprintFormExample, ImprintFormExample } from '../../stories/WorkflowCompositions';

const meta = { title: 'Branding/Components/ImprintForm', component: ImprintForm, parameters: { docs: { description: { component: 'Desktop imprint form using the production file validator, text fields, and workflow callbacks. The uploaded-logo example is a deterministic static preview fixture; live uploads use the production validator.' } } }, tags: ['autodocs'] } satisfies Meta<typeof ImprintForm>;
export default meta;
type Story = StoryObj;
export const EmptyAndInteractive: Story = { render: () => <EmptyImprintFormExample /> };
export const LogoAndText: Story = { render: () => <ImprintFormExample /> };
