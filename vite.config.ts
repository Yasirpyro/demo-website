import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { restaurant } from './src/config/restaurant.config';
import { menu, reviews } from './src/config/menu.data';
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
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/*.png', 'og-image.png'],
      manifest: {
        name: restaurant.name,
        short_name: restaurant.shortName,
        description: restaurant.description,
        theme_color: '#8E1B22',
        background_color: '#EFE1C6',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff,woff2,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
    {
      name: 'restaurant-document',
      buildStart() {
        if (restaurant.mode === 'production' && reviews.some((review) => review.sample))
          this.warn('Sample reviews remain in production restaurant config.');
      },
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
          tags: [
            ...(hero && hero.image in images
              ? [
                  {
                    tag: 'script',
                    children:
                      '(()=>{if(location.pathname!=="/"||(/AppleWebKit/.test(navigator.userAgent)&&!["Chrome/","Chromium/","Edg/"].some(value=>navigator.userAgent.includes(value))))return;const link=document.createElement("link");const attrs=' +
                      data +
                      ';for(const [name,value] of Object.entries(attrs))link.setAttribute(name,value);link.dataset.heroPreload="";document.head.append(link);})();',
                    injectTo: 'head' as const,
                  },
                ]
              : []),
            {
              tag: 'meta',
              attrs: {
                property: 'og:title',
                content: restaurant.name + ' — ' + restaurant.brandDescriptor,
              },
            },
            { tag: 'meta', attrs: { property: 'og:description', content: restaurant.description } },
            { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
            { tag: 'meta', attrs: { property: 'og:image', content: '/og-image.png' } },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image:alt',
                content: restaurant.name + ' — ' + restaurant.footerTagline,
              },
            },
            { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/icons/icon-192.png' } },
            {
              tag: 'script',
              attrs: { type: 'application/ld+json' },
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Restaurant',
                name: restaurant.name,
                description: restaurant.description,
                address: restaurant.address,
                telephone: restaurant.phone,
                servesCuisine: restaurant.brandDescriptor,
                priceRange: '$',
                hasMenu: {
                  '@type': 'Menu',
                  name: restaurant.name + ' menu',
                  hasMenuSection: {
                    '@type': 'MenuSection',
                    name: 'Our menu',
                    hasMenuItem: menu.map((item) => ({
                      '@type': 'MenuItem',
                      name: item.name,
                      description: item.description,
                      offers: {
                        '@type': 'Offer',
                        price: item.price / 10 ** restaurant.currency.fractionDigits,
                        priceCurrency: restaurant.currency.code,
                        availability: item.available
                          ? 'https://schema.org/InStock'
                          : 'https://schema.org/OutOfStock',
                      },
                    })),
                  },
                },
              }).replaceAll('<', '\\u003c'),
            },
          ],
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
