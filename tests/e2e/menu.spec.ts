import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
test('Grillizia appears in the wordmark and document title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Grillizia home' })).toBeVisible();
  await expect(page).toHaveTitle(/Grillizia/);
  await expect(page.locator('body')).not.toContainText(/saffron|ember/i);
});
test('home category panels open a filtered menu', async ({ page }) => {
  await page.goto('/');
  await page.locator('.category-panel').first().click();
  await expect(page).toHaveURL(/category=grill/);
  await expect(page.locator('.menu-card')).toHaveCount(4);
});
test('search, category and dietary filters combine and survive reload', async ({ page }) => {
  await page.goto('/menu?category=grill');
  await page.getByRole('searchbox', { name: 'Search dishes' }).fill('TIKKA');
  await expect(page.locator('.menu-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Veg', exact: true }).click();
  await expect(page.locator('.menu-card')).toHaveCount(1);
  await expect(page.locator('.menu-card h3')).toHaveText('Paneer tikka');
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('TIKKA');
  await expect(page.getByRole('button', { name: 'Veg', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.menu-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('nothing-like-this');
  await expect(page.locator('.menu-empty')).toBeVisible();
  await page.locator('.menu-empty').getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.menu-card')).toHaveCount(20);
});
test('dish details save quantity and Unicode notes, then restore focus', async ({ page }) => {
  await page.goto('/menu?category=grill');
  const trigger = page.getByRole('button', {
    name: /View dish\s*:\s*The signature tikka/,
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toHaveText('The signature tikka');
  await dialog.getByRole('spinbutton', { name: /Quantity/ }).fill('2');
  const note = 'کم مرچ 🌶 <b>no onion</b>';
  await dialog.getByRole('textbox', { name: /Make it yours/ }).fill(note);
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);
  await dialog.getByRole('button', { name: /Add to cart/ }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('.saved-selection')).toContainText('2 × The signature tikka');
  await expect(page.locator('.saved-selection')).toContainText(note);
  await expect(page.locator('.saved-selection b')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.saved-selection')).toContainText(note);
  await page.getByRole('button', { name: 'Clear saved selection' }).click();
  await expect(page.locator('.saved-selection')).toHaveCount(0);
});
test('sold-out dishes stay viewable but cannot be added', async ({ page }) => {
  await page.goto('/menu?category=rice');
  await expect(
    page.getByRole('button', { name: 'Add Weekend beef nihari to cart', exact: true }),
  ).toBeDisabled();
  const trigger = page.getByRole('button', {
    name: /View dish\s*:\s*Weekend beef nihari/,
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Sold out', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
test('detail quantity is bounded and focus stays in the sheet', async ({ page }) => {
  await page.goto('/menu');
  await page
    .getByRole('button', { name: /View dish\s*:\s*The signature tikka/, exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  const qty = dialog.getByRole('spinbutton', { name: /Quantity/ });
  await qty.fill('99');
  await expect(qty).toHaveValue('20');
  await expect(dialog.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  await qty.fill('0');
  await expect(qty).toHaveValue('1');
  await expect(dialog.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((e) => e.contains(document.activeElement))).toBe(true);
  await dialog.getByRole('button', { name: 'Close dish details' }).click();
  await expect(dialog).toBeHidden();
});
test('menu works with denied storage', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Denied');
      },
    }),
  );
  await page.goto('/menu');
  await expect(page.getByText('Your browser cannot save data.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Add The signature tikka to cart', exact: true }).click();
  await expect(page.locator('.saved-selection')).toContainText('1 × The signature tikka');
});
test('unknown categories fall back safely and menu fits each breakpoint', async ({ page }) => {
  await page.goto('/menu?category=unknown');
  await expect(page.locator('.menu-card')).toHaveCount(20);
  await expect(page.getByRole('button', { name: 'All dishes', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 800],
    [1536, 960],
    [844, 390],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: '.cache/screenshots/' + test.info().project.name + '-menu-390.png',
    fullPage: true,
    animations: 'disabled',
    scale: 'css',
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: '.cache/screenshots/' + test.info().project.name + '-menu-1280.png',
    animations: 'disabled',
    scale: 'css',
  });
});
