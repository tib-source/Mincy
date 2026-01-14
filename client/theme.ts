import { createTheme, DEFAULT_THEME } from '@mantine/core';

export const theme = createTheme({
  defaultRadius: 'md',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  fontFamilyMonospace: `Menlo, Monaco, ${DEFAULT_THEME.fontFamilyMonospace}`,

  primaryColor: 'ember',
  primaryShade: 6,

  colors: {
    // Subtle amber / orange (NOT neon)
      ember: [
        '#fff6eb',
        '#ffe8cc',
        '#ffd3a1',
        '#ffbd75',
        '#ffa64a',
        '#f08c00',
        '#d97706',
        '#b35c00',
        '#804200',
        '#4a2600',
      ],

      // PURE neutral grayscale (no green, no blue)
      dark: [
        '#f2f2f2',
        '#d9d9d9',
        '#bfbfbf',
        '#8c8c8c',
        '#595959',
        '#2e2e2e',
        '#1f1f1f',
        '#141414',
        '#0d0d0d',
        '#080808',
      ],
  },

  black: '#050606',
  white: '#f7f8f7',




});
