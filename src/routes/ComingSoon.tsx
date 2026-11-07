import { ArrowUpRight, Flame } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { restaurant } from '../config/restaurant.config';
const stages: Record<string, { label: string; title: string; text: string }> = {
  '/reserve': {
    label: 'M5 · RESERVATIONS',
    title: 'Good things take a little time.',
    text: 'Table reservations are planned for the next phase. This preview does not accept bookings.',
  },
  '/dashboard': {
    label: 'DEMO DASHBOARD',
    title: 'Behind the counter.',
    text: 'Order management, reservations and live updates between tabs arrive in M7. No orders or bookings are being collected in this preview.',
  },
};
export default function ComingSoon() {
  const stage = stages[useLocation().pathname] ?? stages['/reserve'];
  return (
    <section className="recovery">
      <Flame size={48} strokeWidth={1.25} aria-hidden="true" />
      <p className="eyebrow">{stage?.label}</p>
      <h1>{stage?.title}</h1>
      <p>{stage?.text}</p>
      <Link className="button" to="/">
        Back to {restaurant.name}
        <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
