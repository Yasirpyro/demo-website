import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
await fs.mkdir('assets-src', { recursive: true });
await fs.mkdir('public/images', { recursive: true });
const files = (await fs.readdir('assets-src')).filter((name) =>
  /\.(jpg|jpeg|png|webp)$/i.test(name),
);
const manifest = {};
for (const file of files) {
  const name = path.parse(file).name;
  const source = path.join('assets-src', file);
  for (const width of [480, 960, 1600])
    await sharp(source)
      .rotate()
      .resize(width)
      .webp({ quality: 82 })
      .toFile('public/images/' + name + '-' + width + '.webp');
  const blur = await sharp(source).rotate().resize(20).blur(1).webp({ quality: 30 }).toBuffer();
  const metadata = await sharp(source).metadata();
  manifest[name] = {
    blur: 'data:image/webp;base64,' + blur.toString('base64'),
    width: metadata.width,
    height: metadata.height,
  };
}
await fs.mkdir('src/config', { recursive: true });
await fs.writeFile('src/config/images.generated.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Optimized ' + files.length + ' local source images.');
