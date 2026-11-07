import { menu } from '../config/menu.data';
import { demoGuests } from '../config/seed';
import { restaurant } from '../config/restaurant.config';
import { useOrdersStore } from '../store/orders.store';
import { useReservationsStore } from '../store/reservations.store';
import { useCartStore } from '../store/cart.store';
import { cartTotals } from './cart';
import { localDateParts } from './hours';
import { addDays, reservationSlots } from './reservation-rules';
export function simulateOrder() {
  const item = menu.find((item) => item.available)!;
  const totals = cartTotals([{ itemId: item.id, qty: 2 }]);
  return useOrdersStore
    .getState()
    .add({
      customer: { name: demoGuests.order },
      type: 'pickup',
      lines: [{ name: item.name, qty: 2, unitPrice: item.price }],
      ...totals,
    });
}
export function simulateReservation() {
  const now = new Date();
  const today = localDateParts(now, restaurant.timezone).date;
  for (let offset = 0; offset <= restaurant.reservations.advanceDays; offset++) {
    const date = addDays(today, offset);
    const slot = reservationSlots(date, useReservationsStore.getState().records, now).find(
      (slot) => !slot.full,
    );
    if (slot)
      return useReservationsStore
        .getState()
        .add({
          name: demoGuests.reservation,
          phone: demoGuests.phone,
          date,
          time: slot.time,
          guests: 2,
        });
  }
  return null;
}
export function resetDemo() {
  useOrdersStore.getState().reset();
  useReservationsStore.getState().reset();
  useCartStore.getState().clear();
}
