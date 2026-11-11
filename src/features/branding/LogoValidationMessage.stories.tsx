import type { Meta, StoryObj } from '@storybook/react-vite';
import type { LogoValidationResult } from './logoValidation';
import { LogoValidationMessage } from './LogoValidationMessage';

const results = {
  success: {
    status: 'success', format: 'png', dimensions: { width: 1200, height: 600 }, dpi: { x: 300, y: 300 }, effectiveDpi: null,
    failures: [], warnings: [], unverified: ['Effective DPI depends on the final printed size, which is not specified for these products.'],
    summary: 'Logo meets preliminary print requirements',
  },
  warning: {
    status: 'warning', format: 'png', dimensions: { width: 800, height: 400 }, dpi: null, effectiveDpi: null,
    failures: [], warnings: ['DPI metadata was not found. Source pixel dimensions are available, but print resolution cannot be confirmed.'],
    unverified: ['Effective DPI depends on the final printed size, which is not specified for these products.'],
    summary: 'Logo may require print review',
  },
  error: {
    status: 'error', format: 'png', dimensions: { width: 240, height: 120 }, dpi: { x: 72, y: 72 }, effectiveDpi: null,
    failures: ['Image is 240px wide; the minimum is 600px. Upload a larger source image.'], warnings: [], unverified: [],
    summary: 'Logo does not meet upload requirements',
  },
} satisfies Record<string, LogoValidationResult>;

const meta = {
  title: 'Design System/Components/Feedback/LogoValidationMessage',
  component: LogoValidationMessage,
  args: { result: results.warning },
  argTypes: { result: { control: 'object', description: 'Production validation result shape from logoValidation.ts' } },
  parameters: { docs: { description: { component: 'Displays deterministic logo validation feedback using the production status/alert roles and expandable file-check details.' } } },
  tags: ['autodocs'],
} satisfies Meta<typeof LogoValidationMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { result: results.success } };
export const Warning: Story = { args: { result: results.warning } };
export const Error: Story = { args: { result: results.error } };
export const ExpandedDetails: Story = {
  args: { result: results.warning },
  play: async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details');
    if (details) details.open = true;
  },
};
