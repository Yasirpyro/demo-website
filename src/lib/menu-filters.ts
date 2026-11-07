import type { MenuItem } from '../types';
export type MenuTag = '' | 'veg' | 'spicy';
export function filterMenu(
  items: MenuItem[],
  filters: { query: string; category: string; tag: MenuTag },
) {
  const query = filters.query.normalize('NFKC').trim().toLocaleLowerCase();
  return items.filter(
    (item) =>
      (!filters.category || item.categoryId === filters.category) &&
      (!filters.tag || item.tags.includes(filters.tag)) &&
      (!query ||
        [item.name, item.description, ...item.tags]
          .join(' ')
          .normalize('NFKC')
          .toLocaleLowerCase()
          .includes(query)),
  );
}

export const tagLabels = { veg: 'Veg', spicy: 'Spicy', popular: 'Popular', new: 'New' };
