import fs from 'node:fs/promises';
import sharp from 'sharp';
import { restaurant } from '../src/config/restaurant.config.ts';
const escape = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
await fs.mkdir('public/icons', { recursive: true });
const logo = await fs.readFile('public/favicon.svg');
for (const size of [192, 512])
  await sharp({ create: { width: size, height: size, channels: 4, background: '#EFE1C6' } })
    .composite([
      {
        input: await sharp(logo)
          .resize(Math.round(size * 0.6))
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile('public/icons/icon-' + size + '.png');
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#EFE1C6"/><rect x="64" y="64" width="1072" height="502" rx="28" fill="#3A180D"/><text x="112" y="280" fill="#FBF4E6" font-size="96" font-family="sans-serif" font-weight="bold">' +
  escape(restaurant.name) +
  '</text><text x="116" y="355" fill="#F2A31B" font-size="32" font-family="sans-serif">' +
  escape(restaurant.brandDescriptor) +
  '</text><text x="116" y="455" fill="#FBF4E6" font-size="28" font-family="sans-serif">' +
  escape(restaurant.footerTagline) +
  '</text></svg>';
await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
