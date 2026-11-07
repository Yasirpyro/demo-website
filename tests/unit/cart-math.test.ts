import { describe, it, expect } from 'vitest';
import { cartTotals } from '../../src/lib/cart';
import { menu } from '../../src/config/menu.data';
import { createCartStore } from '../../src/store/cart.store';
import { createStorageAdapter } from '../../src/lib/storage-adapter';
describe('cart controls', () => {
  it('calculates integer fees and free delivery thresholds', () => {
    const lines = [{ itemId: menu[0]!.id, qty: 2 }];
    const subtotal = menu[0]!.price * 2;
    expect(cartTotals(lines, 'delivery', { delivery: 200, servicePercent: 2.5 })).toEqual({
      subtotal,
      delivery: 200,
      service: Math.round(subtotal * 0.025),
      fees: 200 + Math.round(subtotal * 0.025),
      total: subtotal + 200 + Math.round(subtotal * 0.025),
    });
    expect(
      cartTotals(lines, 'delivery', {
        delivery: 200,
        servicePercent: 0,
        freeDeliveryOver: subtotal,
      }).delivery,
    ).toBe(0);
  });
  it('removes at zero, caps quantities and restores removed lines', () => {
    const cart = createCartStore(
      createStorageAdapter(() => {
        throw Error('denied');
      }),
    );
    cart.getState().add(menu[0]!.id, 1);
    cart.getState().update(0, 99, 'No salt');
    expect(cart.getState().lines[0]?.qty).toBe(20);
    const line = cart.getState().lines[0]!;
    cart.getState().update(0, 0);
    expect(cart.getState().lines).toEqual([]);
    cart.getState().restore(line);
    expect(cart.getState().lines[0]?.note).toBe('No salt');
  });
  it('keeps an empty cart free of fees', () => expect(cartTotals([], 'delivery').total).toBe(0));
});
