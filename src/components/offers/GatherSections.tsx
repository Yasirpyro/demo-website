import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { offers, reviews, menu, offerSavings } from '../../config/menu.data';
import { restaurant } from '../../config/restaurant.config';
import { useCartStore } from '../../store/cart.store';
import { formatMoney } from '../../lib/format';
import { FoodImage } from '../ui/FoodImage';
export function GatherSections() {
  const [feedback, setFeedback] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const reviewRail = useRef<HTMLDivElement>(null);
  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';
  return (
    <>
      <section className="container gathering-section" id="offers" aria-labelledby="offers-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BETTER TOGETHER</p>
            <h2 id="offers-title">A little more to share.</h2>
          </div>
          <Link className="text-link" to="/menu">
            Explore all dishes <ArrowRight size={18} />
          </Link>
        </div>
        <div className="offers-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.id}>
              <FoodImage image={offer.image} alt={offer.title} className="offer-photo" />
              <div className="offer-copy">
                <span className="savings-badge">Save {formatMoney(offerSavings(offer))}</span>
                <h3>{offer.title}</h3>
                <p>{offer.blurb}</p>
                <ul>
                  {offer.itemIds.map((line) => (
                    <li key={line.id}>
                      {line.qty} × {menu.find((item) => item.id === line.id)?.name}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>{formatMoney(offer.price)}</strong>{' '}
                  <s>{formatMoney(offer.price + offerSavings(offer))}</s>
                </p>
                <small>{offer.validity}</small>
                <button
                  className="button"
                  disabled={
                    !offer.itemIds.every((line) =>
                      menu.some((item) => item.id === line.id && item.available),
                    )
                  }
                  onClick={() => {
                    const added = useCartStore.getState().add('offer:' + offer.id, 1);
                    setFeedback(
                      added
                        ? offer.title + ' added to your cart.'
                        : 'This combo has reached the limit of 20.',
                    );
                  }}
                >
                  Add combo to cart
                </button>
              </div>
            </article>
          ))}
        </div>
        <p role="status">{feedback}</p>
      </section>
      <section className="reviews-section" id="reviews" aria-labelledby="reviews-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AROUND OUR TABLE</p>
              <h2 id="reviews-title">Good food. Good stories.</h2>
              <p>
                {average} / 5 · {reviews.length} sample reviews
              </p>
            </div>
            <div className="review-controls">
              <button
                className="icon-button"
                aria-label="Previous reviews"
                onClick={() =>
                  reviewRail.current?.scrollBy({
                    left: -340,
                    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'instant'
                      : 'smooth',
                  })
                }
              >
                <ArrowLeft />
              </button>
              <button
                className="icon-button"
                aria-label="Next reviews"
                onClick={() =>
                  reviewRail.current?.scrollBy({
                    left: 340,
                    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'instant'
                      : 'smooth',
                  })
                }
              >
                <ArrowRight />
              </button>
            </div>
          </div>
          <p className="local-hint">Illustrative sample reviews for this demo.</p>
          <div className="reviews-rail" ref={reviewRail}>
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div
                  className="review-stars"
                  role="img"
                  aria-label={review.rating + ' out of 5 stars'}
                >
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Star key={i} size={17} aria-hidden="true" />
                  ))}
                </div>
                <p className={expanded.includes(review.id) ? '' : 'review-excerpt'}>
                  {review.text}
                </p>
                <button
                  className="text-link"
                  aria-expanded={expanded.includes(review.id)}
                  onClick={() =>
                    setExpanded((current) =>
                      current.includes(review.id)
                        ? current.filter((id) => id !== review.id)
                        : [...current, review.id],
                    )
                  }
                >
                  {expanded.includes(review.id) ? 'Read less' : 'Read full review'}
                </button>
                <div className="review-author">
                  <span aria-hidden="true">{review.name.slice(-1)}</span>
                  <div>
                    <strong>{review.name}</strong>
                    <time dateTime={review.date}>
                      {new Intl.DateTimeFormat(restaurant.currency.locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }).format(new Date(review.date + 'T12:00:00Z'))}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="reserve-teaser">
        <div className="container">
          <p className="eyebrow">MAKE AN EVENING OF IT</p>
          <h2>{restaurant.visit.title}</h2>
          <p>Choose a time. Bring your favourite people.</p>
          <Link to="/reserve" className="button button-light">
            Find your table <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
