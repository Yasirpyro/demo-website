import { it, expect } from 'vitest';
import { createCartStore } from '../../src/store/cart.store';
import { createStorageAdapter } from '../../src/lib/storage-adapter';
const adapter = () =>
  createStorageAdapter(() => {
    throw new Error('Unavailable');
  });
it('adds and merges matching dish notes while keeping different notes separate', () => {
  const store = createCartStore(adapter());
  expect(store.getState().add('chicken-tikka', 2, 'less spice')).toBe(2);
  store.getState().add('chicken-tikka', 1, 'less spice');
  store.getState().add('chicken-tikka', 1, 'no onion');
  expect(store.getState().lines).toEqual([
    { itemId: 'chicken-tikka', qty: 3, note: 'less spice' },
    { itemId: 'chicken-tikka', qty: 1, note: 'no onion' },
  ]);
});
it('caps each line at twenty and reports the actual addition', () => {
  const store = createCartStore(adapter());
  expect(store.getState().add('chicken-tikka', 19)).toBe(19);
  expect(store.getState().add('chicken-tikka', 5)).toBe(1);
  expect(store.getState().add('chicken-tikka', 1)).toBe(0);
  expect(store.getState().lines[0]?.qty).toBe(20);
});
it('rejects unavailable dishes, missing IDs and non-finite quantities', () => {
  const store = createCartStore(adapter());
  expect(store.getState().add('beef-nihari', 1)).toBe(0);
  expect(store.getState().add('missing', 1)).toBe(0);
  expect(store.getState().add('chicken-tikka', NaN)).toBe(0);
  expect(store.getState().lines).toEqual([]);
});
it('persists valid selections and notes across store recreation', () => {
  const storage = adapter();
  const store = createCartStore(storage);
  store.getState().add('chicken-tikka', 2, 'کم مرچ 🌶');
  const reloaded = createCartStore(storage);
  expect(reloaded.getState().lines).toEqual(store.getState().lines);
});
it.each([
  'broken json',
  '{"version":0,"state":{"lines":[]}}',
  '{"version":1,"state":{"lines":[{"itemId":"chicken-tikka","qty":200}]}}',
  '{"version":1,"state":{"lines":[{"itemId":"missing","qty":2}]}}',
])('recovers safely from corrupt or old cart data: %s', (raw) => {
  const storage = adapter();
  storage.setItem('rdemo:v1:cart', raw);
  storage.setItem('other', 'keep');
  const store = createCartStore(storage);
  expect(store.getState().lines).toEqual([]);
  expect(storage.getItem('other')).toBe('keep');
  expect(storage.getItem('rdemo:v1:cart')).toBeNull();
});
it('clears saved selections persistently', () => {
  const storage = adapter();
  const store = createCartStore(storage);
  store.getState().add('chicken-tikka', 2);
  store.getState().clear();
  expect(createCartStore(storage).getState().lines).toEqual([]);
});

it('does not let unexpected stored fields replace store actions', () => {
  const storage = adapter();
  storage.setItem(
    'rdemo:v1:cart',
    JSON.stringify({
      version: 1,
      state: {
        lines: [{ itemId: 'chicken-tikka', qty: 1 }],
        add: 'not a function',
        clear: 'not a function',
      },
    }),
  );
  const store = createCartStore(storage);
  expect(store.getState().add('chicken-tikka', 1)).toBe(1);
  store.getState().clear();
  expect(store.getState().lines).toEqual([]);
});
