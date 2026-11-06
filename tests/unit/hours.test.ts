import { describe, it, expect } from 'vitest';
import { getOpeningStatus, localDateParts, formatTime } from '../../src/lib/hours';
import type { OpeningHours } from '../../src/types';
const hours: OpeningHours = {
  mon: { open: '12:00', close: '23:00' },
  tue: null,
  wed: { open: '12:00', close: '23:00' },
  thu: { open: '12:00', close: '23:00' },
  fri: { open: '12:00', close: '02:00' },
  sat: { open: '12:00', close: '00:00' },
  sun: { open: '12:00', close: '23:00' },
};
const status = (time: string, closed: string[] = []) =>
  getOpeningStatus(new Date(time), 'Asia/Karachi', hours, closed);
describe('restaurant-local opening hours', () => {
  it('uses the restaurant timezone, not browser time', () => {
    expect(localDateParts(new Date('2026-11-06T20:30:00Z'), 'Asia/Karachi').date).toBe(
      '2026-11-07',
    );
    expect(status('2026-11-06T20:30:00Z').open).toBe(true);
  });
  it('closes exactly at the cutoff', () => {
    expect(status('2026-11-06T21:00:00Z').open).toBe(false);
  });
  it('opens exactly at opening time', () => {
    expect(status('2026-11-02T07:00:00Z').open).toBe(true);
  });
  it('offers the next open day after a closed weekday', () => {
    expect(status('2026-11-03T10:00:00Z').detail).toBe('opens tomorrow at 12:00 PM');
  });
  it('honors a special closure even after midnight', () => {
    expect(status('2026-11-06T20:30:00Z', ['2026-11-07']).open).toBe(false);
  });
  it('does not inherit hours from a specially closed previous day', () => {
    expect(status('2026-11-06T20:30:00Z', ['2026-11-06']).open).toBe(false);
  });
  it('handles midnight closing without reopening the next morning', () => {
    expect(status('2026-11-07T19:01:00Z').open).toBe(false);
  });
  it('handles a wholly closed schedule', () => {
    expect(
      getOpeningStatus(
        new Date(),
        'UTC',
        { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
        [],
      ).detail,
    ).toBe('hours to be announced');
  });
  it('formats noon and midnight', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });
});
