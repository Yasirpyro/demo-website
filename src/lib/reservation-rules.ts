import { z } from 'zod';
import { restaurant } from '../config/restaurant.config';
import { localDateParts, weekdays, formatTime } from './hours';
import { phoneSchema } from './records';
import type { RestaurantConfig } from '../types';
export const reservationSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  phone: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1).max(12),
  request: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']),
});
export type Reservation = z.infer<typeof reservationSchema>;
export const bookingSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(80),
  phone: phoneSchema,
  date: z.string().min(1, 'Choose a date.'),
  time: z.string().min(1, 'Choose a time.'),
  guests: z.number().int().min(1).max(12, 'For large groups please call us.'),
  request: z.string().trim().max(500),
});
export function addDays(date: string, days: number) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export function zonedInstant(date: string, time: string, zone: string) {
  const target = Date.parse(date + 'T' + time + ':00Z');
  let value = target;
  for (let n = 0; n < 4; n++) {
    const p = localDateParts(new Date(value), zone);
    const displayed = Date.parse(p.date + 'T00:00:00Z') + p.minute * 60000;
    const delta = target - displayed;
    if (!delta) break;
    value += delta;
  }
  const result = new Date(value);
  const p = localDateParts(result, zone);
  return p.date === date && p.minute === minute(time) ? result : null;
}
export function reservationSlots(
  date: string,
  records: Reservation[] = [],
  now = new Date(),
  config: RestaurantConfig = restaurant,
) {
  const today = localDateParts(now, config.timezone).date;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date + 'T12:00:00Z')) ||
    date < today ||
    date > addDays(today, config.reservations.advanceDays) ||
    config.closedDates.includes(date)
  )
    return [];
  const times = new Set<number>();
  for (const day of [addDays(date, -1), date]) {
    if (config.closedDates.includes(day)) continue;
    const schedule = config.hours[weekdays[new Date(day + 'T12:00:00Z').getUTCDay()]!];
    if (!schedule) continue;
    const start = minute(schedule.open);
    let end = minute(schedule.close);
    if (end <= start) end += 1440;
    for (let m = start; m < end; m += Math.max(1, config.reservations.slotMinutes)) {
      if ((day === date && m < 1440) || (day !== date && m >= 1440)) times.add(m % 1440);
    }
  }
  return [...times]
    .sort((a, b) => a - b)
    .flatMap((m) => {
      const time =
        String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      const instant = zonedInstant(date, time, config.timezone);
      if (!instant || instant <= now) return [];
      const used = records.filter(
        (r) => r.date === date && r.time === time && !['cancelled', 'no_show'].includes(r.status),
      ).length;
      return [{ time, full: used >= config.reservations.capacityPerSlot }];
    });
}
export function validateBooking(
  value: { date: string; time: string; guests: number },
  records: Reservation[],
  now = new Date(),
  config = restaurant,
) {
  if (
    !Number.isInteger(value.guests) ||
    value.guests < 1 ||
    value.guests > config.reservations.maxGuests
  )
    return { field: 'guests' as const, message: 'For large groups please call us.' };
  const slot = reservationSlots(value.date, records, now, config).find(
    (s) => s.time === value.time,
  );
  if (!slot)
    return {
      field: 'time' as const,
      message: 'Choose an available future time during opening hours.',
    };
  if (slot.full)
    return {
      field: 'time' as const,
      message: 'This slot is fully booked. Please choose another time.',
    };
  return null;
}
export function reservationMessage(r: Reservation) {
  const date = new Intl.DateTimeFormat(restaurant.currency.locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(r.date + 'T12:00:00Z'));
  return [
    '📅 *Table Reservation — ' + r.id + '*',
    'Name: ' + r.name,
    'Phone: ' + r.phone,
    'Date: ' + date,
    'Time: ' + formatTime(r.time),
    'Guests: ' + r.guests,
    ...(r.request ? ['Request: ' + r.request] : []),
  ].join('\n');
}
export function calendarFile(r: Reservation) {
  const start = zonedInstant(r.date, r.time, restaurant.timezone)!;
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Restaurant Demo//Reservation//EN',
    'BEGIN:VEVENT',
    'UID:' + r.id + '-' + Date.parse(r.createdAt) + '@restaurant-demo',
    'DTSTAMP:' + stamp(new Date(r.createdAt)),
    'DTSTART:' + stamp(start),
    'DTEND:' + stamp(new Date(start.getTime() + 90 * 60000)),
    'SUMMARY:' + escape('Table at ' + restaurant.name),
    'LOCATION:' + escape(restaurant.address),
    'DESCRIPTION:' + escape(reservationMessage(r)),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
