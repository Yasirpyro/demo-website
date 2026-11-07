import { it, expect } from 'vitest';
import { offers, offerSavings, menu, cartItems, reviews } from '../../src/config/menu.data';
import { createCartStore } from '../../src/store/cart.store';
import { createStorageAdapter } from '../../src/lib/storage-adapter';
import { cartTotals } from '../../src/lib/cart';
it('offers reference valid dishes and keep the advertised bundle price', () => {
  for (const offer of offers) {
    expect(offer.itemIds.every((line) => menu.some((item) => item.id === line.id))).toBe(true);
    expect(offerSavings(offer)).toBeGreaterThan(0);
    const store = createCartStore(
      createStorageAdapter(() => {
        throw Error();
      }),
    );
    store.getState().add('offer:' + offer.id, 2);
    expect(cartTotals(store.getState().lines).subtotal).toBe(offer.price * 2);
    expect(cartItems.find((item) => item.id === 'offer:' + offer.id)?.available).toBe(true);
  }
});
it('clearly labels all reviews as samples', () =>
  expect(reviews.every((review) => review.sample && review.name.startsWith('Sample guest'))).toBe(
    true,
  ));
