import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LandingScreen } from './LandingScreen';

const meta = { title: 'Screens/Landing/LandingScreen', component: LandingScreen, parameters: { layout: 'fullscreen', docs: { description: { component: 'The actual app entry screen. Start updates visible story state without adding routing behavior.' } } }, tags: ['autodocs'] } satisfies Meta<typeof LandingScreen>;
export default meta;
type Story = StoryObj;
export const Landing: Story = { render: () => { const [started, setStarted] = useState(false); return <><LandingScreen onStart={() => setStarted(true)} />{started && <p role="status">Product selection started.</p>}</>; } };
