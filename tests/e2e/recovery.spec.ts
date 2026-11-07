import { test, expect } from './fixtures';
test('corrupt order and reservation data recover without damaging unrelated keys', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('rdemo:v1:orders', '{bad');
    localStorage.setItem(
      'rdemo:v1:reservations',
      JSON.stringify({ version: 99, state: { records: [] } }),
    );
    localStorage.setItem('unrelated', 'keep');
  });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Service, at a glance.' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Orders (0)', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe('keep');
});
test('blocked WhatsApp and both clipboard failures keep a selectable full order', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith('https://wa.me/')) return;
      click.call(this);
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(Error('Denied')) },
      configurable: true,
    });
    document.execCommand = () => false;
  });
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Add The signature tikka to cart', exact: true }).click();
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  const cart = page.getByRole('dialog');
  await cart.getByRole('button', { name: 'Order on WhatsApp', exact: true }).click();
  await cart.getByLabel('Your name').fill('Fallback guest');
  await cart.getByRole('button', { name: 'Save order & open WhatsApp' }).click();
  await cart.getByRole('button', { name: 'Copy order text' }).click();
  await expect(cart.getByRole('status')).toContainText('copy it manually');
  await expect(cart.getByLabel('Full order text')).toHaveValue(/Fallback guest/);
  await expect(cart.getByRole('link', { name: 'Open WhatsApp again' })).toBeVisible();
});
test('cart removals undo and survive reload', async ({ page }) => {
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Add The signature tikka to cart', exact: true }).click();
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  const cart = page.getByRole('dialog');
  await cart.getByRole('button', { name: 'Decrease The signature tikka', exact: true }).click();
  await expect(cart.getByText('A little room for something good.')).toBeVisible();
  await cart.getByRole('button', { name: 'Undo removal' }).click();
  await cart.getByLabel('Order notes').fill('Dinner at eight');
  await page.reload();
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  await expect(page.getByRole('dialog').getByLabel('Order notes')).toHaveValue('Dinner at eight');
});
