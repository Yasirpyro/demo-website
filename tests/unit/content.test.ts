import fs from 'node:fs';
import { it, expect } from 'vitest';
it('ships no unfinished marker copy in application source', () => {
  const files = fs
    .readdirSync('src', { recursive: true })
    .filter((p) => /\.(tsx|ts|css)$/.test(String(p)));
  for (const file of files) {
    const content = fs.readFileSync('src/' + file, 'utf8');
    expect(content).not.toMatch(/\b(lorem|TODO|placeholder)\b/i);
  }
});
