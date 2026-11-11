import type { Preview } from '@storybook/react-vite';
import '../src/styles/tokens.css';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    viewport: {
      options: {
        mobile320: { name: 'Mobile 320', styles: { width: '320px', height: '568px' }, type: 'mobile' },
        mobile390: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        mobile414: { name: 'Mobile 414', styles: { width: '414px', height: '896px' }, type: 'mobile' },
        tablet768: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        desktop1280: { name: 'Desktop 1280', styles: { width: '1280px', height: '900px' }, type: 'desktop' },
        desktop1440: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
