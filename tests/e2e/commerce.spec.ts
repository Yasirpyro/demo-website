import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith('https://wa.me/')) {
        sessionStorage.setItem('tested-whatsapp-url', this.href);
        return;
      }
      click.call(this);
    };
  });
});
test('cart edits, checkout validation, local order and copy recovery', async ({ page }) => {
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Add The signature tikka to cart', exact: true }).click();
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Increase The signature tikka', exact: true }).click();
  await expect(dialog.getByLabel('Quantity of The signature tikka')).toHaveText('2');
  await dialog.getByLabel('Dish note').fill('کم مرچ 🌶');
  await dialog.getByLabel('Order type', { exact: true }).selectOption('delivery');
  await dialog.getByRole('button', { name: 'Order on WhatsApp', exact: true }).click();
  await dialog.getByLabel('Your name').fill('Demo Guest');
  await dialog.getByRole('button', { name: 'Save order & open WhatsApp' }).click();
  await expect(dialog.getByText('Please enter your delivery address.')).toBeVisible();
  await dialog.getByLabel('Delivery address').fill('Clifton 12');
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual(
    [],
  );
  await dialog.getByRole('button', { name: 'Save order & open WhatsApp' }).dblclick();
  await expect(dialog.getByRole('heading', { name: /ORD-0001/ })).toBeVisible();
  await expect(dialog.getByLabel('Full order text')).toHaveValue(/کم مرچ 🌶/);
  await expect(dialog.getByRole('button', { name: 'Copy order text' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Open WhatsApp again' })).toHaveAttribute(
    'href',
    /wa.me\/923112442147/,
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('rdemo:v1:orders')!).state.records.length,
    ),
  ).toBe(1);
});
test('reservation saves and exports a calendar with no horizontal overflow', async ({ page }) => {
  await page.goto('/reserve');
  await page.getByLabel('Your name').fill('Sample Guest');
  await page.getByLabel('Phone number').fill('+92 300 1234567');
  const date = await page.getByLabel('Date', { exact: true }).getAttribute('min');
  const tomorrow = new Date(date + 'T12:00:00Z');
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  await page.getByLabel('Date', { exact: true }).fill(tomorrow.toISOString().slice(0, 10));
  await page.getByLabel('Time slot').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Request a table' }).click();
  await expect(page.getByRole('heading', { name: 'Your table request is saved.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add to calendar' })).toHaveAttribute(
    'download',
    'RES-0001.ics',
  );
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual(
    [],
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
