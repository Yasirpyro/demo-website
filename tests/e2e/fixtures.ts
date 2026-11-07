import { test as base, expect, type Page } from '@playwright/test';
export { expect } from '@playwright/test';
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page, context }, use) => {
      const issues: string[] = [];
      const guard = (target: Page) => {
        target.on('console', (m) => {
          if (['error', 'warning'].includes(m.type())) issues.push(m.type() + ': ' + m.text());
        });
        target.on('pageerror', (e) => issues.push(e.message));
      };
      guard(page);
      context.on('page', guard);
      await use();
      expect(issues).toEqual([]);
    },
    { auto: true },
  ],
});
