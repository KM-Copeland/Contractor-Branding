import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { WorkflowState } from '../../types/workflow';
import layoutStyles from './BrandReview.module.css';
import { ImprintTextFields } from './ImprintTextFields';

type FieldStoryArgs = { line1: string; line2: string; boldLine1: boolean; boldLine2: boolean };

function InteractiveFields({ line1, line2, boldLine1, boldLine2 }: FieldStoryArgs) {
  const [imprint, setImprint] = useState<WorkflowState['imprint']>({ logo: null, lines: [line1.slice(0, 30), line2.slice(0, 30)], boldLines: [boldLine1, boldLine2] });
  useEffect(() => setImprint(current => ({ ...current, lines: [line1.slice(0, 30), line2.slice(0, 30)], boldLines: [boldLine1, boldLine2] })), [line1, line2, boldLine1, boldLine2]);

  return <ImprintTextFields
    className={`${layoutStyles.fieldGroup} ${layoutStyles.textGroup}`}
    imprint={imprint}
    setLine={(index, value) => setImprint(current => {
      const lines = [...current.lines] as [string, string];
      lines[index] = value.slice(0, 30);
      return { ...current, lines };
    })}
    toggleBold={index => setImprint(current => {
      const boldLines = [...current.boldLines] as [boolean, boolean];
      boldLines[index] = !boldLines[index];
      return { ...current, boldLines };
    })}
  />;
}

const meta = {
  title: 'Design System/Components/Inputs/ImprintTextFields',
  argTypes: {
    line1: { control: 'text', description: 'Initial content for Line 1 (maximum 30 characters)' },
    line2: { control: 'text', description: 'Initial content for Line 2 (maximum 30 characters)' },
    boldLine1: { control: 'boolean', description: 'Initial Bold state for Line 1' },
    boldLine2: { control: 'boolean', description: 'Initial Bold state for Line 2' },
  },
  args: { line1: '', line2: '', boldLine1: false, boldLine2: false },
  render: (args: FieldStoryArgs) => <InteractiveFields {...args} />,
  parameters: { docs: { description: { component: 'Interactive story wrapper around the production fields. It uses the existing form layout classes and enforces the production 30-character limit.' } } },
  tags: ['autodocs'],
} satisfies Meta<FieldStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const LineOnePopulated: Story = { args: { line1: 'Licensed and insured' } };
export const BothLinesPopulated: Story = { args: { line1: 'Northside Heating', line2: 'Service you can trust' } };
export const FirstLineBold: Story = { args: { line1: 'Northside Heating', boldLine1: true } };
export const SecondLineBold: Story = { args: { line1: 'Northside Heating', line2: 'Service you can trust', boldLine2: true } };
export const NearCharacterLimit: Story = { args: { line1: 'Trusted home comfort service', line2: 'Call for seasonal tune-ups' } };
export const MaximumCharacterLimit: Story = { args: { line1: '123456789012345678901234567890', line2: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234' } };
export const LongContent: Story = { args: { line1: 'Trusted home comfort service', line2: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234' } };
