import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: Object.fromEntries(
        [
          'bg',
          'bg-soft',
          'surface',
          'ink',
          'ink-soft',
          'band',
          'on-band',
          'primary',
          'on-primary',
          'accent',
          'on-accent',
          'border',
        ].map((name) => [name, `var(--color-${name})`]),
      ),
      fontFamily: { sans: ['var(--font-body)'], display: ['var(--font-display)'] },
    },
  },
  plugins: [],
} satisfies Config;
