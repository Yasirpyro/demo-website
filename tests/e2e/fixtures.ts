import { test as base, expect } from '@playwright/test';
export { expect } from '@playwright/test';
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const issues: string[] = [];
      page.on('console', (m) => {
        if (['error', 'warning'].includes(m.type())) issues.push(m.type() + ': ' + m.text());
      });
      page.on('pageerror', (e) => issues.push(e.message));
      await use();
      expect(issues).toEqual([]);
    },
    { auto: true },
  ],
});
