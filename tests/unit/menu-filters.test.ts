import { describe, it, expect } from 'vitest';
import { filterMenu } from '../../src/lib/menu-filters';
import { menu } from '../../src/config/menu.data';
const defaults = { query: '', category: '', tag: '' as const };
describe('menu search and filters', () => {
  it('keeps the full menu when filters are clear', () =>
    expect(filterMenu(menu, defaults)).toHaveLength(20));
  it('combines category, tag and normalized case-insensitive search', () =>
    expect(
      filterMenu(menu, { query: '  TIKKA  ', category: 'grill', tag: 'veg' }).map((i) => i.id),
    ).toEqual(['paneer-tikka']));
  it('searches descriptions', () =>
    expect(filterMenu(menu, { ...defaults, query: 'mint chutney' }).map((i) => i.id)).toEqual([
      'seekh-kebab',
    ]));
  it('searches tags as well as dish names', () => {
    const result = filterMenu(menu, { ...defaults, query: 'popular' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((i) => i.tags.includes('popular'))).toBe(true);
  });
  it('returns an empty result for incompatible filters', () =>
    expect(filterMenu(menu, { query: 'biryani', category: 'grill', tag: 'veg' })).toEqual([]));
  it('preserves Unicode search text', () => {
    const item = { ...menu[0]!, name: 'چکن تکہ' };
    expect(filterMenu([item], { ...defaults, query: 'تکہ' })).toHaveLength(1);
  });
});
