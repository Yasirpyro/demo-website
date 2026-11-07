import { menu } from '../config/menu.data';
import { restaurant } from '../config/restaurant.config';
import type { CartLine } from '../store/cart.store';
export type OrderType = 'delivery' | 'pickup' | 'dinein';
export function cartTotals(lines: CartLine[], type: OrderType = 'pickup', fees = restaurant.fees) {
  const subtotal = lines.reduce(
    (sum, line) => sum + (menu.find((item) => item.id === line.itemId)?.price ?? 0) * line.qty,
    0,
  );
  const delivery =
    lines.length &&
    type === 'delivery' &&
    !(fees.freeDeliveryOver !== undefined && subtotal >= fees.freeDeliveryOver)
      ? fees.delivery
      : 0;
  const service = Math.round((subtotal * Math.round(fees.servicePercent * 100)) / 10000);
  return {
    subtotal,
    delivery,
    service,
    fees: delivery + service,
    total: subtotal + delivery + service,
  };
}
