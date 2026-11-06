import { it, expect } from 'vitest';
import { categories, menu } from '../../src/config/menu.data';
import { restaurant } from '../../src/config/restaurant.config';
import { formatMoney } from '../../src/lib/format';
it('provides twenty unique dishes across five categories with integer prices', () => {
  expect(menu).toHaveLength(20);
  expect(categories).toHaveLength(5);
  expect(new Set(menu.map((i) => i.id)).size).toBe(20);
  for (const item of menu) {
    expect(Number.isSafeInteger(item.price)).toBe(true);
    expect(categories.some((c) => c.id === item.categoryId)).toBe(true);
  }
  for (const id of [...restaurant.heroItemIds, ...restaurant.featuredItemIds])
    expect(menu.some((i) => i.id === id)).toBe(true);
});
it('formats integer monetary amounts at the currency precision', () => {
  expect(formatMoney(890)).toContain('890');
  expect(formatMoney(1234, { code: 'USD', locale: 'en-US', fractionDigits: 2 })).toBe('$12.34');
});
