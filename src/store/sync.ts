import { z } from 'zod';
import { useOrdersStore } from './orders.store';
import { useReservationsStore } from './reservations.store';
import { useCartStore } from './cart.store';
import { orderSchema } from '../lib/records';
import { reservationSchema } from '../lib/reservation-rules';
import { cartItems } from '../config/menu.data';
const cartSchema = z.object({
  lines: z.array(
    z.object({
      itemId: z.string().refine((id) => cartItems.some((item) => item.id === id)),
      qty: z.number().int().min(1).max(20),
      note: z.string().max(240).optional(),
    }),
  ),
  notes: z.string().max(500).default(''),
});
export function startSync() {
  let applying = false;
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel('rdemo:v1:sync');
  } catch {
    /* Storage events remain available. */
  }
  const receive = (key: string, state: unknown) => {
    applying = true;
    try {
      if (key === 'rdemo:v1:orders') {
        const result = z.object({ records: z.array(orderSchema) }).safeParse(state);
        if (result.success) useOrdersStore.setState(result.data);
      }
      if (key === 'rdemo:v1:reservations') {
        const result = z.object({ records: z.array(reservationSchema) }).safeParse(state);
        if (result.success) useReservationsStore.setState(result.data);
      }
      if (key === 'rdemo:v1:cart') {
        const result = cartSchema.safeParse(state);
        if (result.success) useCartStore.setState(result.data);
      }
    } finally {
      applying = false;
    }
  };
  const send = (key: string, state: unknown) => {
    if (!applying)
      try {
        channel?.postMessage({ key, state });
      } catch {
        /* Storage-event fallback. */
      }
  };
  const unsubscribers = [
    useOrdersStore.subscribe((state) => send('rdemo:v1:orders', { records: state.records })),
    useReservationsStore.subscribe((state) =>
      send('rdemo:v1:reservations', { records: state.records }),
    ),
    useCartStore.subscribe((state) =>
      send('rdemo:v1:cart', { lines: state.lines, notes: state.notes }),
    ),
  ];
  if (channel)
    channel.onmessage = (event) => {
      const value = z.object({ key: z.string(), state: z.unknown() }).safeParse(event.data);
      if (value.success) receive(value.data.key, value.data.state);
    };
  const onStorage = (event: StorageEvent) => {
    if (!event.key?.startsWith('rdemo:v1:') || !event.newValue) return;
    try {
      const envelope = z
        .object({ version: z.literal(1), state: z.unknown() })
        .safeParse(JSON.parse(event.newValue));
      if (envelope.success) receive(event.key, envelope.data.state);
    } catch {
      /* Ignore malformed cross-tab data. */
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    channel?.close();
    window.removeEventListener('storage', onStorage);
  };
}
