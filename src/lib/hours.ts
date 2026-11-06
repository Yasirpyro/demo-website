import type { OpeningHours, Weekday } from '../types';

export const weekdays: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const minutes = (time: string) => {
  const [h = '0', m = '0'] = time.split(':');
  return Number(h) * 60 + Number(m);
};

export function localDateParts(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const calendar = new Date(`${date}T12:00:00Z`);
  return {
    date,
    weekday: calendar.getUTCDay(),
    minute: Number(get('hour')) * 60 + Number(get('minute')),
    calendar,
  };
}

export function formatTime(time: string) {
  const minute = minutes(time);
  return `${Math.floor(minute / 60) % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${minute < 720 ? 'AM' : 'PM'}`;
}

export function getOpeningStatus(
  now: Date,
  timezone: string,
  hours: OpeningHours,
  closedDates: string[],
) {
  const local = localDateParts(now, timezone);
  const today = hours[weekdays[local.weekday] ?? 'sun'];
  const previousKey = weekdays[(local.weekday + 6) % 7] ?? 'sun';
  const previous = hours[previousKey];
  const yesterday = new Date(local.calendar);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (!closedDates.includes(local.date)) {
    if (
      previous &&
      !closedDates.includes(yesterday.toISOString().slice(0, 10)) &&
      minutes(previous.close) <= minutes(previous.open) &&
      local.minute < minutes(previous.close)
    ) {
      return { open: true, detail: `closes ${formatTime(previous.close)}` };
    }
    if (
      today &&
      local.minute >= minutes(today.open) &&
      (minutes(today.close) <= minutes(today.open) || local.minute < minutes(today.close))
    ) {
      return { open: true, detail: `closes ${formatTime(today.close)}` };
    }
  }
  for (let offset = 0; offset < 370; offset++) {
    const nextDate = new Date(local.calendar);
    nextDate.setUTCDate(nextDate.getUTCDate() + offset);
    const next = hours[weekdays[nextDate.getUTCDay()] ?? 'sun'];
    if (
      !next ||
      closedDates.includes(nextDate.toISOString().slice(0, 10)) ||
      (offset === 0 && minutes(next.open) <= local.minute)
    )
      continue;
    const day =
      offset === 0
        ? 'today'
        : offset === 1
          ? 'tomorrow'
          : new Intl.DateTimeFormat('en', { weekday: 'long', timeZone: 'UTC' }).format(nextDate);
    return { open: false, detail: `opens ${day} at ${formatTime(next.open)}` };
  }
  return { open: false, detail: 'hours to be announced' };
}
