import { it, expect } from 'vitest';
import {
  reservationSlots,
  validateBooking,
  zonedInstant,
  calendarFile,
  type Reservation,
} from '../../src/lib/reservation-rules';
import { restaurant } from '../../src/config/restaurant.config';
const now = new Date('2026-11-07T08:00:00Z');
it('excludes past local times and dates', () => {
  expect(reservationSlots('2026-11-06', [], now)).toEqual([]);
  expect(reservationSlots('2026-11-07', [], now)[0]?.time).toBe('13:30');
  expect(reservationSlots('2026-12-08', [], now)).toEqual([]);
});
it('handles overnight service on the actual calendar date', () => {
  const cfg = {
    ...restaurant,
    hours: { ...restaurant.hours, fri: { open: '22:00', close: '02:00' }, sat: null },
  };
  expect(
    reservationSlots('2026-11-07', [], new Date('2026-11-06T18:00:00Z'), cfg).map((s) => s.time),
  ).toEqual(['00:00', '00:30', '01:00', '01:30']);
  expect(reservationSlots('2026-11-07', [], now, { ...cfg, closedDates: ['2026-11-07'] })).toEqual(
    [],
  );
});
it('rejects full capacity and large groups', () => {
  const r: Reservation = {
    id: 'RES-1',
    createdAt: now.toISOString(),
    name: 'Guest',
    phone: '03001234567',
    date: '2026-11-07',
    time: '14:00',
    guests: 2,
    status: 'pending',
  };
  const records = [r, r, r];
  expect(validateBooking(r, records, now)?.message).toContain('fully booked');
  expect(validateBooking({ ...r, guests: 13 }, [], now)?.field).toBe('guests');
  expect(
    validateBooking(
      r,
      records.map((x) => ({ ...x, status: 'cancelled' })),
      now,
    ),
  ).toBeNull();
});
it('converts restaurant timezone and writes an escaped UTC calendar', () => {
  expect(zonedInstant('2026-11-07', '14:00', 'Asia/Karachi')?.toISOString()).toBe(
    '2026-11-07T09:00:00.000Z',
  );
  const file = calendarFile({
    id: 'RES-1',
    createdAt: now.toISOString(),
    name: 'Guest',
    phone: '03001234567',
    date: '2026-11-07',
    time: '14:00',
    guests: 2,
    request: 'hello\nEND:VEVENT',
    status: 'pending',
  });
  expect(file).toContain('DTSTART:20261107T090000Z');
  expect(file.match(/\r\nEND:VEVENT/g)).toHaveLength(1);
});
it('omits nonexistent daylight-saving times', () =>
  expect(zonedInstant('2026-03-08', '02:30', 'America/New_York')).toBeNull());
