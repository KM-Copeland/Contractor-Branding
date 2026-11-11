import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Design System/Foundations/Colors & Typography',
  parameters: { docs: { description: { component: 'A small visual check of the shared runtime tokens and declared font family. Values come from tokens.css.' } } },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SharedTokens: Story = {
  render: () => <main style={{ maxWidth: 720, padding: 24, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)' }}>
    <h1 style={{ fontSize: 'var(--text-title)', lineHeight: 'var(--line-title)' }}>Design system foundations</h1>
    <p style={{ marginTop: 8, fontSize: 'var(--text-base)', lineHeight: 'var(--line-base)' }}>Aileron · Regular, Semibold, Bold</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 24 }}>
      {[
        ['Primary action', 'var(--color-action-primary)'],
        ['Progress fill', 'var(--color-progress-fill)'],
        ['Selected surface', 'var(--color-selected)'],
        ['Subtle border', 'var(--color-border-subtle)'],
      ].map(([label, color]) => <div key={label} style={{ minHeight: 88, display: 'flex', alignItems: 'end', padding: 12, border: '1px solid var(--color-border-subtle)', background: color, color: 'white' }}>{label}</div>)}
    </div>
  </main>,
};
