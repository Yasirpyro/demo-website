import { test, expect } from './fixtures';
const repetitions = Number(process.env.REHEARSALS ?? 1);
test('offline golden path with order, table, dashboard and reset', async ({ page, context }) => {
  test.setTimeout(90000 + repetitions * 90000);
  await context.addInitScript(() => {
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith('https://wa.me/')) {
        sessionStorage.setItem('tested-whatsapp-url', this.href);
        return;
      }
      click.call(this);
    };
  });
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  for (let run = 0; run < repetitions; run++) {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.locator('.category-panel').first().click();
    await page.getByRole('searchbox', { name: 'Search dishes' }).fill('tikka');
    await expect(page.locator('.menu-card')).toHaveCount(2);
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await page
      .getByRole('button', { name: /View dish\s*:\s*The signature tikka/, exact: true })
      .click();
    await page.getByRole('spinbutton', { name: /Quantity/ }).fill('2');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Add to cart/ })
      .click();
    await page.getByRole('button', { name: 'All dishes', exact: true }).click();
    await page.getByRole('button', { name: 'Add Karak chai to cart', exact: true }).click();
    await page.goto('/#offers');
    await page.getByRole('button', { name: 'Add combo to cart', exact: true }).click();
    await page.getByRole('button', { name: /Open cart, / }).click();
    const cart = page.getByRole('dialog');
    await cart.getByRole('button', { name: 'Increase The signature tikka', exact: true }).click();
    await cart.getByRole('button', { name: 'Remove Karak chai', exact: true }).click();
    await cart.getByRole('button', { name: 'Order on WhatsApp', exact: true }).click();
    await cart.getByLabel('Your name').fill('Rehearsal guest ' + (run + 1));
    await cart.getByRole('button', { name: 'Save order & open WhatsApp' }).click();
    await expect(cart.getByRole('heading', { name: /ORD-0001/ })).toBeVisible();
    await expect(cart.getByRole('link', { name: 'Open WhatsApp again' })).toHaveAttribute(
      'href',
      /^https:\/\/wa.me\/923112442147/,
    );
    await cart.getByRole('button', { name: 'Close cart', exact: true }).click();
    await page.goto('/reserve');
    await page.getByLabel('Your name').fill('Rehearsal guest ' + (run + 1));
    await page.getByLabel('Phone number').fill('03000000000');
    const today = await page.getByLabel('Date', { exact: true }).getAttribute('min');
    const tomorrow = new Date(today + 'T12:00:00Z');
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    await page.getByLabel('Date', { exact: true }).fill(tomorrow.toISOString().slice(0, 10));
    await page.getByLabel('Time slot').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Request a table' }).click();
    await expect(page.getByRole('heading', { name: 'Your table request is saved.' })).toBeVisible();
    const dashboard = await context.newPage();
    await dashboard.goto('/dashboard');
    await expect(dashboard.locator('.service-record')).toHaveCount(1);
    await dashboard.getByRole('button', { name: 'Mark Preparing', exact: true }).click();
    await dashboard.getByRole('tab', { name: /Reservations/ }).click();
    await expect(dashboard.locator('.service-record')).toHaveCount(1);
    await dashboard.getByRole('button', { name: 'Mark Confirmed', exact: true }).click();
    await dashboard.getByRole('button', { name: 'Simulate incoming order', exact: true }).click();
    await dashboard.getByRole('tab', { name: /Orders/ }).click();
    await expect(dashboard.locator('.service-record')).toHaveCount(2);
    await dashboard.reload();
    await expect(dashboard.locator('.service-record')).toHaveCount(2);
    await dashboard.getByRole('button', { name: 'Reset demo data', exact: true }).click();
    await dashboard.getByRole('button', { name: 'Confirm reset' }).click();
    await expect(dashboard.locator('.service-record')).toHaveCount(0);
    await dashboard.close();
    await page.goto('/menu');
    expect(
      await page.evaluate(() =>
        Array.from(document.images).every((image) => !image.complete || image.naturalWidth > 0),
      ),
    ).toBe(true);
  }
  await context.setOffline(false);
});
