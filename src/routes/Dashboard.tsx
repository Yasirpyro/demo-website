import { useEffect, useRef, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, RotateCcw } from 'lucide-react';
import { useOrdersStore } from '../store/orders.store';
import { useReservationsStore } from '../store/reservations.store';
import { restaurant } from '../config/restaurant.config';
import { formatMoney } from '../lib/format';
import { localDateParts, formatTime } from '../lib/hours';
import { simulateOrder, simulateReservation, resetDemo } from '../lib/demo';
import type { Order } from '../lib/records';
import type { Reservation } from '../lib/reservation-rules';
import '../styles/dashboard.css';
const orderNext: Record<Order['status'], Order['status'][]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};
const reservationNext: Record<Reservation['status'], Reservation['status'][]> = {
  pending: ['confirmed', 'cancelled', 'no_show'],
  confirmed: ['seated', 'completed', 'cancelled', 'no_show'],
  seated: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
};
const label = (s: string) => s.replace('_', ' ').replace(/^./, (c) => c.toUpperCase());
export default function Dashboard() {
  const orders = useOrdersStore((s) => s.records);
  const reservations = useReservationsStore((s) => s.records);
  const [tab, setTab] = useState('orders');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [resetOpen, setResetOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [sound, setSound] = useState(restaurant.features.sound);
  const audio = useRef<AudioContext | null>(null);
  const known = useRef(new Set([...orders, ...reservations].map((item) => item.id)));
  const [fresh, setFresh] = useState<string[]>([]);
  const today = localDateParts(new Date(), restaurant.timezone).date;
  useEffect(() => {
    const incoming = [...orders, ...reservations].filter((item) => !known.current.has(item.id));
    known.current = new Set([...orders, ...reservations].map((item) => item.id));
    if (!incoming.length) return;
    setFresh(incoming.map((item) => item.id));
    setNotice(incoming.length + ' new arrival' + (incoming.length === 1 ? '' : 's') + '.');
    if (sound && audio.current?.state === 'running') {
      try {
        const oscillator = audio.current.createOscillator();
        const gain = audio.current.createGain();
        oscillator.connect(gain);
        gain.connect(audio.current.destination);
        gain.gain.value = 0.05;
        oscillator.frequency.value = 660;
        oscillator.start();
        oscillator.stop(audio.current.currentTime + 0.12);
      } catch {
        /* Visual notice remains available. */
      }
    }
  }, [orders, reservations, sound]);
  useEffect(() => {
    if (!fresh.length) return;
    const timer = setTimeout(() => setFresh([]), 4000);
    return () => clearTimeout(timer);
  }, [fresh]);
  useEffect(
    () => () => {
      void audio.current?.close().catch(() => {});
    },
    [],
  );
  const filteredOrders = orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      o.customer.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const filteredReservations = reservations.filter(
    (r) =>
      (status === 'all' || r.status === status) &&
      r.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const todaysOrders = orders.filter(
    (o) => localDateParts(new Date(o.createdAt), restaurant.timezone).date === today,
  );
  return (
    <section className="dashboard-page container">
      <div className="dashboard-heading">
        <div>
          <span className="demo-badge">Demo dashboard</span>
          <h1>Service, at a glance.</h1>
          <p>
            {restaurant.name} · {today} · {restaurant.timezone}
          </p>
        </div>
        <label className="sound-toggle">
          <input
            type="checkbox"
            checked={sound}
            onChange={(event) => {
              const enabled = event.target.checked;
              setSound(enabled);
              if (enabled) {
                try {
                  audio.current ??= new AudioContext();
                  void audio.current
                    .resume()
                    .catch(() => setNotice('Sound unavailable. Visual notices remain on.'));
                } catch {
                  setNotice('Sound unavailable. Visual notices remain on.');
                }
              }
            }}
          />
          Sound
        </label>
      </div>
      <p className="dashboard-sync-note">
        Live updates work between tabs in this browser profile. This is a local demo mirror;
        WhatsApp delivery is not tracked. No login is required.
      </p>
      <dl className="dashboard-summary">
        <div>
          <dt>Orders today</dt>
          <dd>{todaysOrders.length}</dd>
        </div>
        <div>
          <dt>Completed revenue today</dt>
          <dd>
            {formatMoney(
              todaysOrders
                .filter((o) => o.status === 'completed')
                .reduce((sum, o) => sum + o.total, 0),
            )}
          </dd>
        </div>
        <div>
          <dt>Tables today</dt>
          <dd>
            {
              reservations.filter(
                (r) => r.date === today && !['cancelled', 'no_show'].includes(r.status),
              ).length
            }
          </dd>
        </div>
      </dl>
      <div className="dashboard-tools">
        <button
          className="button"
          onClick={() => {
            simulateOrder();
          }}
        >
          <Plus size={17} />
          Simulate incoming order
        </button>
        <button
          className="button button-secondary"
          onClick={() => {
            if (!simulateReservation()) setNotice('No reservation slots are available.');
          }}
        >
          <Plus size={17} />
          Simulate incoming reservation
        </button>
        <button className="button button-secondary" onClick={() => setResetOpen(true)}>
          <RotateCcw size={17} />
          Reset demo data
        </button>
      </div>
      <p role="status" className="dashboard-notice">
        {notice}
      </p>
      <Tabs.Root
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          setStatus('all');
        }}
      >
        <Tabs.List className="dashboard-tabs" aria-label="Service records">
          <Tabs.Trigger value="orders">Orders ({orders.length})</Tabs.Trigger>
          <Tabs.Trigger value="reservations">Reservations ({reservations.length})</Tabs.Trigger>
        </Tabs.List>
        <div className="dashboard-filters">
          <label>
            Search by name
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {(tab === 'orders' ? Object.keys(orderNext) : Object.keys(reservationNext)).map(
                (s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <Tabs.Content value="orders">
          <div className="service-ledger">
            {filteredOrders.map((order) => (
              <article
                className={'service-record ' + (fresh.includes(order.id) ? 'is-new' : '')}
                key={order.id}
              >
                <div className="record-title">
                  <div>
                    <span className="record-id">{order.id}</span>
                    <h2 dir="auto">{order.customer.name}</h2>
                    <time dateTime={order.createdAt}>
                      {new Intl.DateTimeFormat(restaurant.currency.locale, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: restaurant.timezone,
                      }).format(new Date(order.createdAt))}
                    </time>
                  </div>
                  <span className={'status-badge status-' + order.status}>
                    {label(order.status)}
                  </span>
                </div>
                <div className="record-body">
                  <div>
                    <p>
                      {label(order.type)}
                      {order.customer.table ? ' · Table ' + order.customer.table : ''}
                    </p>
                    {order.customer.address && <p dir="auto">{order.customer.address}</p>}
                    {order.customer.phone && <p>{order.customer.phone}</p>}
                    <ul>
                      {order.lines.map((line, index) => (
                        <li key={index}>
                          {line.qty} × {line.name} — {formatMoney(line.qty * line.unitPrice)}
                          {line.note && <small dir="auto">{line.note}</small>}
                        </li>
                      ))}
                    </ul>
                    {order.notes && <p dir="auto">Notes: {order.notes}</p>}
                  </div>
                  <div className="record-total">
                    <span>Total</span>
                    <strong>{formatMoney(order.total)}</strong>
                    <small>Includes fees: {formatMoney(order.fees)}</small>
                  </div>
                </div>
                <div className="record-actions">
                  {orderNext[order.status].map((next) => (
                    <button
                      className="button button-secondary"
                      key={next}
                      onClick={() => useOrdersStore.getState().setStatus(order.id, next)}
                    >
                      Mark {label(next)}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {!filteredOrders.length && (
              <div className="ledger-empty">
                <h2>No orders on this view.</h2>
                <p>Create an order from the menu, simulate one above, or clear your filters.</p>
              </div>
            )}
          </div>
        </Tabs.Content>
        <Tabs.Content value="reservations">
          <div className="service-ledger">
            {filteredReservations.map((r) => (
              <article
                className={'service-record ' + (fresh.includes(r.id) ? 'is-new' : '')}
                key={r.id}
              >
                <div className="record-title">
                  <div>
                    <span className="record-id">{r.id}</span>
                    <h2 dir="auto">{r.name}</h2>
                    <p>{r.phone}</p>
                  </div>
                  <span className={'status-badge status-' + r.status}>{label(r.status)}</span>
                </div>
                <div className="record-body">
                  <p>
                    {r.date} · {formatTime(r.time)} · {r.guests} guests
                  </p>
                  {r.request && <p dir="auto">{r.request}</p>}
                </div>
                <div className="record-actions">
                  {reservationNext[r.status].map((next) => (
                    <button
                      className="button button-secondary"
                      key={next}
                      onClick={() => useReservationsStore.getState().setStatus(r.id, next)}
                    >
                      Mark {label(next)}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {!filteredReservations.length && (
              <div className="ledger-empty">
                <h2>No tables on this view.</h2>
                <p>
                  Request a table from the reservation page, simulate one above, or clear your
                  filters.
                </p>
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
      <Dialog.Root open={resetOpen} onOpenChange={setResetOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="commerce-overlay" />
          <Dialog.Content className="reset-dialog">
            <div className="sheet-heading">
              <Dialog.Title>Reset this demo?</Dialog.Title>
              <Dialog.Close className="icon-button" aria-label="Close reset dialog">
                <X />
              </Dialog.Close>
            </div>
            <Dialog.Description>
              Remove all orders, reservations and cart selections in this browser. The configured
              menu stays ready for the next demonstration.
            </Dialog.Description>
            <div className="commerce-actions">
              <Dialog.Close className="button button-secondary">Keep my data</Dialog.Close>
              <button
                className="button"
                onClick={() => {
                  resetDemo();
                  setFresh([]);
                  setQuery('');
                  setStatus('all');
                  setNotice('Demo reset. Ready for the next table.');
                  setResetOpen(false);
                }}
              >
                Confirm reset
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
