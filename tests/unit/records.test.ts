import { it, expect } from 'vitest';
import { orderSchema, nextId } from '../../src/lib/records';
import { reservationSchema } from '../../src/lib/reservation-rules';
it('allocates unique sequential order IDs', () => {
  expect(nextId('ORD', [{ id: 'ORD-0001' }, { id: 'ORD-0002' }])).toBe('ORD-0003');
});
it('rejects corrupt orders and reservations', () => {
  expect(orderSchema.safeParse({ id: 'ORD-1', total: 'bad' }).success).toBe(false);
  expect(reservationSchema.safeParse({ guests: 13, status: 'other' }).success).toBe(false);
});
