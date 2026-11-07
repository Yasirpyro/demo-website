import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Flame,
  MapPin,
  Phone,
  Clock3,
} from 'lucide-react';
import { restaurant } from '../config/restaurant.config';
import { menu } from '../config/menu.data';
import { FoodImage } from '../components/ui/FoodImage';
import { CategoryPanels } from '../components/menu/CategoryPanels';
import { OpeningBadge } from '../components/layout/OpeningBadge';
import { formatMoney } from '../lib/format';
import { formatTime } from '../lib/hours';
const heroDishes = restaurant.heroItemIds.flatMap((id) => {
  const item = menu.find((i) => i.id === id);
  return item ? [item] : [];
});
const featured = restaurant.featuredItemIds.flatMap((id) => {
  const item = menu.find((i) => i.id === id);
  return item ? [item] : [];
});
const dayNames = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};
export default function Home() {
  const [selected, setSelected] = useState(0);
  const dish = heroDishes[selected];
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const rotateFeatured = (direction: number) => {
    setFeaturedIndex((index) => (index + direction + featured.length) % featured.length);
  };
  const visibleFeatured = [...featured.slice(featuredIndex), ...featured.slice(0, featuredIndex)];
  return (
    <>
      <section className="hero container" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <span className="tiny-line" />
            {restaurant.eyebrow}
          </p>
          <h1 id="hero-heading">
            {restaurant.tagline.map((line, i) => (
              <span key={line} className={i === restaurant.tagline.length - 1 ? 'accent-line' : ''}>
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-description">{restaurant.description}</p>
          <div className="hero-actions">
            <Link className="button" to="/menu">
              Explore the menu
              <span className="arrow-circle">
                <ArrowUpRight size={19} />
              </span>
            </Link>
            <a className="story-link" href="#story">
              <span className="outline-circle">
                <ArrowDown size={16} />
              </span>
              Our kind of cooking
            </a>
          </div>
          <div className="hero-footnote">
            <Flame className="little-star" size={17} aria-hidden="true" /> Fresh off the grill.
            Straight to the heart.
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-arch" key={dish?.id}>
            {dish && (
              <FoodImage
                image={dish.image}
                alt={dish.name}
                priority
                sizes="(min-width: 1024px) 48vw, 90vw"
                position={dish.imagePosition}
              />
            )}
            <div className="hero-image-shade" />
            <div className="hero-dish-caption" aria-live="polite">
              <span>MEET YOUR NEXT FAVOURITE</span>
              <p>{dish?.name}</p>
              <span>{dish && formatMoney(dish.price)}</span>
            </div>
          </div>
          <div className="fire-seal" aria-label="Made with heart, finished over fire">
            <span>MADE WITH HEART</span>
            <Flame size={38} strokeWidth={1.15} />
            <span>FINISHED OVER FIRE</span>
          </div>
          <div className="hero-selectors" role="group" aria-label="Featured dishes">
            {heroDishes.map((item, i) => (
              <button
                key={item.id}
                className={'dish-selector ' + (i === selected ? 'is-selected' : '')}
                onClick={() => setSelected(i)}
                aria-label={'Show ' + item.name}
                aria-pressed={i === selected}
              >
                <FoodImage image={item.image} alt="" sizes="80px" />
                <span className="selector-number">0{i + 1}</span>
              </button>
            ))}
          </div>
          <span className="hero-index" aria-hidden="true">
            0{selected + 1}
            <span> / 0{heroDishes.length}</span>
          </span>
        </div>
      </section>
      <section className="signatures" aria-labelledby="signatures-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE ONES YOU’LL COME BACK FOR</p>
              <h2 id="signatures-title">A few house favourites.</h2>
            </div>
            <Link className="text-link" to="/menu">
              View the menu
              <span className="outline-circle">
                <ArrowUpRight size={19} />
              </span>
            </Link>
          </div>
          <div className="featured-strip" aria-live="polite">
            {visibleFeatured.map((item, i) => (
              <Link
                key={item.id}
                className="featured-dish"
                to={'/menu?category=' + item.categoryId}
              >
                <div className="featured-image-wrap">
                  <FoodImage
                    image={item.image}
                    alt={item.name}
                    sizes="(min-width: 1024px) 26vw, 75vw"
                  />
                  <span className="dish-tag">
                    {i === 0
                      ? 'HOUSE SIGNATURE'
                      : item.tags.includes('spicy')
                        ? 'A LITTLE HEAT'
                        : 'MADE WITH HEART'}
                  </span>
                  <span className="featured-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className="featured-dish-info">
                  <h3>{item.name}</h3>
                  <span>{formatMoney(item.price)}</span>
                </div>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
          <div className="featured-controls">
            <span>Good things are made to be shared.</span>
            <div>
              <button
                className="icon-button"
                onClick={() => rotateFeatured(-1)}
                aria-label="Previous signature dishes"
              >
                <ArrowLeft size={19} />
              </button>
              <button
                className="icon-button"
                onClick={() => rotateFeatured(1)}
                aria-label="Next signature dishes"
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <CategoryPanels />
      <section className="story-section container" id="story" aria-labelledby="story-title">
        <div className="story-visual">
          <FoodImage
            image={menu.find((i) => i.id === restaurant.story.imageItemId)?.image ?? ''}
            alt={menu.find((i) => i.id === restaurant.story.imageItemId)?.name ?? ''}
            sizes="(min-width: 1024px) 42vw, 90vw"
          />
          <div className="story-stamp">
            <Flame size={23} strokeWidth={1.3} />
            <span>
              {restaurant.story.stamp.map((line) => (
                <span className="stamp-line" key={line}>
                  {line}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="story-copy">
          <p className="eyebrow">{restaurant.story.eyebrow}</p>
          <h2 id="story-title">{restaurant.story.title}</h2>
          <p>{restaurant.story.body}</p>
          <div className="story-note">
            <span className="tiny-line" />
            {restaurant.story.note}
          </div>
        </div>
      </section>
      <section className="visit-section" id="visit" aria-labelledby="visit-title">
        <div className="container">
          <div className="visit-intro">
            <p className="eyebrow">COME HUNGRY. LEAVE HAPPY.</p>
            <h2 id="visit-title">{restaurant.visit.title}</h2>
            <p>{restaurant.visit.body}</p>
          </div>
          <div className="visit-grid">
            <div className="visit-details">
              <div className="visit-detail-title">
                <Clock3 size={20} />
                <h3>A good time to drop by</h3>
              </div>
              <OpeningBadge />
              <dl className="hours-table">
                {Object.entries(restaurant.hours).map(([day, hours]) => (
                  <div key={day}>
                    <dt>{dayNames[day as keyof typeof dayNames]}</dt>
                    <dd>
                      {hours ? formatTime(hours.open) + ' – ' + formatTime(hours.close) : 'Closed'}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="timezone-note">All times in {restaurant.timezone.replace('_', ' ')}.</p>
              {restaurant.phone && (
                <a className="contact-link" href={'tel:' + restaurant.phone.replace(/[^+\d]/g, '')}>
                  <Phone size={17} />
                  {restaurant.phone}
                </a>
              )}
              {restaurant.whatsappNumber && (
                <a
                  className="contact-link"
                  href={'https://wa.me/' + restaurant.whatsappNumber.replace(/\D/g, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                  <ArrowUpRight size={17} />
                </a>
              )}
            </div>
            <div className="visit-map">
              <img
                src={restaurant.mapImage}
                width="800"
                height="600"
                loading="lazy"
                alt={'Illustrated neighborhood map of ' + restaurant.address}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="map-card">
                <div>
                  <span className="eyebrow">FIND OUR CORNER</span>
                  <p>
                    <MapPin size={17} />
                    {restaurant.address}
                  </p>
                  <small>Illustrative demo location</small>
                </div>
                <a
                  className="icon-button"
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Google Maps"
                >
                  <ArrowUpRight size={24} />
                </a>
              </div>
              <span className="map-label">A LITTLE AWAY FROM THE EVERYDAY.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
