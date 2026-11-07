import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
for (const fallback of [false, true])
  test(
    'dashboard synchronizes records and status ' +
      (fallback ? 'using storage fallback' : 'using BroadcastChannel'),
    async ({ page, context }) => {
      if (fallback)
        await context.addInitScript(() => {
          Object.defineProperty(window, 'BroadcastChannel', { value: undefined });
        });
      await page.goto('/dashboard');
      const second = await context.newPage();
      await second.goto('/dashboard');
      await page.getByRole('button', { name: 'Simulate incoming order', exact: true }).click();
      await expect(second.locator('.service-record')).toHaveCount(1);
      await second.getByRole('button', { name: 'Mark Preparing', exact: true }).click();
      await expect(page.locator('.status-badge')).toHaveText('Preparing');
      await page
        .getByRole('button', { name: 'Simulate incoming reservation', exact: true })
        .click();
      await second.getByRole('tab', { name: /Reservations/ }).click();
      await expect(second.locator('.service-record')).toHaveCount(1);
      await second.getByRole('button', { name: 'Mark Confirmed', exact: true }).click();
      await page.getByRole('tab', { name: /Reservations/ }).click();
      await expect(page.locator('.status-badge')).toHaveText('Confirmed');
      await page.reload();
      await page.getByRole('tab', { name: /Reservations/ }).click();
      await expect(page.locator('.status-badge')).toHaveText('Confirmed');
      await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
      await page.getByRole('button', { name: 'Keep my data' }).click();
      await expect(page.locator('.service-record')).toHaveCount(1);
      await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm reset' }).click();
      await expect(second.locator('.service-record')).toHaveCount(0);
      await second.close();
    },
  );
test('dashboard controls are accessible and responsive', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Simulate incoming order', exact: true }).click();
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
  ).toEqual([]);
  for (const width of [360, 390, 430, 768, 1024, 1280, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByLabel('Search by name').fill('nothing');
  await expect(page.getByText('No orders on this view.')).toBeVisible();
});
