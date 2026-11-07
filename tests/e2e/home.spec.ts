import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
const routes = ['/', '/menu', '/reserve', '/dashboard', '/not-a-page'];
for (const route of routes) {
  test('direct route ' + route + ' is accessible', async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toEqual([]);
  });
}
test('manual hero switching and featured controls work', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Show Our house karahi', exact: true });
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.hero-dish-caption p')).toHaveText('Our house karahi');
  const first = await page.locator('.featured-dish h3').first().textContent();
  await page.getByRole('button', { name: 'Next signature dishes' }).click();
  await expect(page.locator('.featured-dish h3').first()).not.toHaveText(first ?? '');
  await page.getByRole('button', { name: 'Previous signature dishes' }).click();
  await expect(page.locator('.featured-dish h3').first()).toHaveText(first ?? '');
});
test('all specified widths and landscape have no horizontal overflow', async ({ page }) => {
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
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  }
});
test('mobile menu traps focus, closes with Escape and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open navigation' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((e) => e.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'The menu' })
    .click();
  await expect(page).toHaveURL(/\/menu$/);
  await expect(dialog).toBeHidden();
});
test('reduced motion removes image and entrance animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const styles = await page.locator('.hero-arch').evaluate((e) => ({
    animation: getComputedStyle(e).animationName,
    transition: getComputedStyle(e).transitionDuration,
  }));
  expect(styles.animation).toBe('none');
  expect(styles.transition).toBe('0s');
});
test('storage denial remains usable with a visible notice', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Disabled');
      },
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Everything works for this session');
  await expect(page.locator('h1')).toBeVisible();
});
test('runtime assets stay local', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4173') && !r.url().startsWith('data:'))
      external.push(r.url());
  });
  await page.goto('/');
  await page.locator('#visit').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero-arch img')).toBeVisible();
  expect(external).toEqual([]);
});
test('take delivery screenshots', async ({ page }, info) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero-arch img')).toBeVisible();
    await page.screenshot({
      path: '.cache/screenshots/' + info.project.name + '-home-' + width + '.png',
      fullPage: true,
      animations: 'disabled',
      scale: 'css',
    });
  }
});
