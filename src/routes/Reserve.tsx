import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Check, CalendarDays } from 'lucide-react';
import { restaurant } from '../config/restaurant.config';
import { menu } from '../config/menu.data';
import { FoodImage } from '../components/ui/FoodImage';
import {
  bookingSchema,
  reservationSlots,
  validateBooking,
  addDays,
  reservationMessage,
  calendarFile,
  type Reservation,
} from '../lib/reservation-rules';
import { localDateParts, formatTime } from '../lib/hours';
import { whatsappUrl, copyText } from '../lib/whatsapp';
import { useReservationsStore } from '../store/reservations.store';
export default function Reserve() {
  const [now, setNow] = useState(new Date());
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const records = useReservationsStore((s) => s.records);
  const today = localDateParts(now, restaurant.timezone).date;
  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', phone: '', date: today, time: '', guests: 2, request: '' },
  });
  const date = watch('date');
  const guests = watch('guests');
  const slots = reservationSlots(date, records, now);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (confirmation) heading.current?.focus();
  }, [confirmation]);
  const submit = handleSubmit((value) => {
    if (locked.current) return;
    const error = validateBooking(value, useReservationsStore.getState().records);
    if (error) {
      setError(error.field, { message: error.message });
      return;
    }
    locked.current = true;
    const record = useReservationsStore.getState().add(value);
    if (record) setConfirmation(record);
    else {
      locked.current = false;
      setError('time', { message: 'This slot has just filled. Please choose another.' });
    }
  });
  const hero = menu.find((item) => item.id === restaurant.story.imageItemId)!;
  return (
    <section className="container reservation-page">
      <div className="reservation-story">
        <p className="eyebrow">A PLACE AT OUR TABLE</p>
        <h1>{restaurant.visit.title}</h1>
        <p>{restaurant.visit.body}</p>
        <FoodImage image={hero.image} alt={hero.name} className="reservation-photo" />
        <p className="local-hint">
          All booking times are in {restaurant.timezone}. Reservations are requests until confirmed
          by the restaurant.
        </p>
      </div>
      <div className="reservation-panel">
        {confirmation ? (
          <section className="success-panel">
            <Check size={36} />
            <h2 ref={heading} tabIndex={-1}>
              Your table request is saved.
            </h2>
            <p>
              {confirmation.id} · {confirmation.name}
            </p>
            <p>
              {confirmation.date} at {formatTime(confirmation.time)} · {confirmation.guests} guests
            </p>
            <p>Pending restaurant confirmation.</p>
            <div className="commerce-actions">
              {whatsappUrl(reservationMessage(confirmation)) ? (
                <a
                  className="button"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={whatsappUrl(reservationMessage(confirmation))!}
                >
                  Send confirmation on WhatsApp
                </a>
              ) : (
                <p>No restaurant WhatsApp number is configured. Copy the request to share it.</p>
              )}
              <button
                className="button button-secondary"
                onClick={() => {
                  void copyText(reservationMessage(confirmation)).then((ok) =>
                    setCopyStatus(
                      ok
                        ? 'Reservation text copied.'
                        : 'Select the request below and copy it manually.',
                    ),
                  );
                }}
              >
                Copy reservation text
              </button>
              <a
                className="button button-secondary"
                download={confirmation.id + '.ics'}
                href={
                  'data:text/calendar;charset=utf-8,' +
                  encodeURIComponent(calendarFile(confirmation))
                }
              >
                <CalendarDays size={18} />
                Add to calendar
              </a>
            </div>
            <p role="status">{copyStatus}</p>
            <label>
              Reservation text
              <textarea
                className="confirmation-text"
                value={reservationMessage(confirmation)}
                readOnly
              />
            </label>
            <button
              className="button"
              onClick={() => {
                locked.current = false;
                setConfirmation(null);
                reset();
                setCopyStatus('');
              }}
            >
              Make another reservation
            </button>
          </section>
        ) : (
          <form
            className="commerce-form"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(event);
            }}
            noValidate
          >
            <h2>Save your seat.</h2>
            <p>A family dinner, a catch-up, a little celebration.</p>
            {(['name', 'phone', 'date'] as const).map((field) => (
              <label key={field}>
                {field === 'name' ? 'Your name' : field === 'phone' ? 'Phone number' : 'Date'}
                <input
                  {...register(field)}
                  type={field === 'date' ? 'date' : field === 'phone' ? 'tel' : 'text'}
                  min={field === 'date' ? today : undefined}
                  max={
                    field === 'date'
                      ? addDays(today, restaurant.reservations.advanceDays)
                      : undefined
                  }
                  autoComplete={field === 'name' ? 'name' : field === 'phone' ? 'tel' : undefined}
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? field + '-booking-error' : undefined}
                />
                {errors[field] && (
                  <span className="field-error" id={field + '-booking-error'}>
                    {errors[field]?.message}
                  </span>
                )}
              </label>
            ))}
            <label>
              Time slot
              <select
                {...register('time')}
                aria-invalid={!!errors.time}
                aria-describedby="time-booking-help"
              >
                <option value="">Choose a time</option>
                {slots.map((slot) => (
                  <option key={slot.time} value={slot.time} disabled={slot.full}>
                    {formatTime(slot.time)}
                    {slot.full ? ' · Fully booked' : ''}
                  </option>
                ))}
              </select>
              <span id="time-booking-help" className={errors.time ? 'field-error' : 'local-hint'}>
                {errors.time?.message ??
                  (slots.length
                    ? 'Choose an available table time.'
                    : 'No times available for this date. Try another day.')}
              </span>
            </label>
            <label>
              Guests
              <input
                type="number"
                min="1"
                max={restaurant.reservations.maxGuests}
                {...register('guests', { valueAsNumber: true })}
                aria-invalid={!!errors.guests}
              />
            </label>
            <div className="quantity-control">
              <button
                type="button"
                className="icon-button"
                aria-label="Fewer guests"
                disabled={guests <= 1}
                onClick={() => setValue('guests', Math.max(1, guests - 1))}
              >
                −
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="More guests"
                disabled={guests >= restaurant.reservations.maxGuests}
                onClick={() =>
                  setValue('guests', Math.min(restaurant.reservations.maxGuests, guests + 1))
                }
              >
                +
              </button>
            </div>
            {errors.guests && (
              <p role="alert" className="field-error">
                {errors.guests.message}
              </p>
            )}
            <p className="local-hint">
              For large groups please call us.
              {restaurant.phone && (
                <>
                  {' '}
                  <a href={'tel:' + restaurant.phone.replace(/[^+\d]/g, '')}>{restaurant.phone}</a>
                </>
              )}
            </p>
            <label>
              Special request (optional)
              <textarea dir="auto" maxLength={500} {...register('request')} />
            </label>
            <button className="button" type="submit">
              Request a table
            </button>
            <p className="local-hint">Saved on this browser. No payment or account needed.</p>
          </form>
        )}
      </div>
    </section>
  );
}
