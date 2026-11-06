import fs from 'node:fs/promises';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
await fs.mkdir('.cache/references', { recursive: true });
const root = 'design-refrences';
const report = {};
for (const file of await fs.readdir(root)) {
  if (!file.endsWith('.png')) continue;
  const { data, info } = await sharp(root + '/' + file)
    .resize(160)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const counts = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    const key = [data[i], data[i + 1], data[i + 2]]
      .map((v) =>
        Math.min(255, Math.round(v / 16) * 16)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  report[file] = [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([color, count]) => ({ color: '#' + color, count }));
}
const video = (await fs.readdir(root)).find((file) => file.endsWith('.mp4'));
if (video && ffmpeg) {
  execFileSync(
    ffmpeg,
    [
      '-y',
      '-i',
      root + '/' + video,
      '-vf',
      'fps=2,scale=640:-1',
      '-frames:v',
      '80',
      '.cache/references/frame-%03d.jpg',
    ],
    { stdio: 'pipe' },
  );
  report.video = {
    source: video,
    sampleIntervalMs: 500,
    extractedFrames: (await fs.readdir('.cache/references')).filter((f) => f.startsWith('frame-'))
      .length,
  };
}
await fs.writeFile('.cache/references/analysis.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
