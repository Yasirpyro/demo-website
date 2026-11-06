import fs from 'node:fs';
const css = fs.readFileSync('src/styles/tokens.css', 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]),
);
function luminance(hex) {
  const values = hex
    .slice(1)
    .match(/../g)
    .map((c) => parseInt(c, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}
const pairs = [
  ['ink', 'bg', 4.5],
  ['ink', 'bg-soft', 4.5],
  ['ink-soft', 'bg', 4.5],
  ['on-band', 'band', 4.5],
  ['on-primary', 'primary', 4.5],
  ['on-accent', 'accent', 4.5],
  ['ink', 'surface', 4.5],
  ['success', 'bg-soft', 4.5],
  ['warning', 'bg-soft', 4.5],
  ['danger', 'bg-soft', 4.5],
  ['focus', 'bg', 3],
];
let failed = false;
for (const [a, b, min] of pairs) {
  const x = luminance(tokens[a]),
    y = luminance(tokens[b]);
  const ratio = (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  console.log(a + ' on ' + b + ': ' + ratio.toFixed(2) + ' ' + (ratio >= min ? 'PASS' : 'FAIL'));
  if (ratio < min) failed = true;
}
// A light outer focus ring supplies contrast on the dark band.
const bandRatio = (luminance(tokens['on-band']) + 0.05) / (luminance(tokens.band) + 0.05);
if (bandRatio < 3) failed = true;
if (failed) process.exitCode = 1;
