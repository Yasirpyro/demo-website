import { useEffect, useState } from 'react';
import { restaurant } from '../../config/restaurant.config';
import { getOpeningStatus } from '../../lib/hours';
export function OpeningBadge() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const status = getOpeningStatus(
    now,
    restaurant.timezone,
    restaurant.hours,
    restaurant.closedDates,
  );
  return (
    <span className={'opening-badge ' + (status.open ? 'is-open' : 'is-closed')}>
      <span className="status-dot" aria-hidden="true" />
      <span>
        {status.open ? 'Open now' : 'Closed'}
        <span className="hours-detail"> · {status.detail}</span>
      </span>
    </span>
  );
}
