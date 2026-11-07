import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { restaurant } from './src/config/restaurant.config';
import { menu } from './src/config/menu.data';
import images from './src/config/images.generated.json';
export default defineConfig({
  base: '/',
  server: {
    watch: {
      ignored: [
        '**/.cache/**',
        '**/.tools/**',
        '**/.agents/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/.lighthouseci/**',
      ],
    },
  },
  plugins: [
    react(),
    {
      name: 'restaurant-document',
      transformIndexHtml(html) {
        const escape = (text: string) =>
          text
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;');
        const hero = menu.find((item) => item.id === restaurant.heroItemIds[0]);
        const attributes = hero
          ? {
              rel: 'preload',
              as: 'image',
              href: '/images/' + hero.image + '-960.webp',
              imagesrcset: [480, 960, 1600]
                .map((w) => '/images/' + hero.image + '-' + w + '.webp ' + w + 'w')
                .join(', '),
              imagesizes: '(min-width: 1024px) 48vw, 90vw',
              fetchpriority: 'high',
            }
          : {};
        const data = JSON.stringify(attributes).replaceAll('<', '\\u003c');
        return {
          html: html
            .replace(
              /<title>.*?<\/title>/,
              '<title>' +
                escape(restaurant.name) +
                ' — ' +
                escape(restaurant.brandDescriptor) +
                '</title>',
            )
            .replace(
              /<meta name="description" content="[^"]*"/,
              '<meta name="description" content="' + escape(restaurant.description) + '"',
            ),
          tags:
            hero && hero.image in images
              ? [
                  {
                    tag: 'script',
                    children:
                      '(()=>{if(location.pathname!=="/"||(/AppleWebKit/.test(navigator.userAgent)&&!["Chrome/","Chromium/","Edg/"].some(value=>navigator.userAgent.includes(value))))return;const link=document.createElement("link");const attrs=' +
                      data +
                      ';for(const [name,value] of Object.entries(attrs))link.setAttribute(name,value);link.dataset.heroPreload="";document.head.append(link);})();',
                    injectTo: 'head',
                  },
                ]
              : [],
        };
      },
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
