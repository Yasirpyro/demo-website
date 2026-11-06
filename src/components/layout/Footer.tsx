import { ArrowUpRight, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { restaurant } from '../../config/restaurant.config';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Link to="/" className="footer-wordmark">
            {restaurant.shortName}
            <span>{restaurant.footerTagline}</span>
          </Link>
          <nav aria-label="Footer navigation">
            <Link to="/menu">
              The menu
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/reserve">
              Find your table
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/dashboard">
              Demo dashboard
              <ArrowUpRight size={15} />
            </Link>
          </nav>
          <div className="footer-socials">
            {restaurant.socials.instagram && (
              <a
                href={restaurant.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            )}
            {restaurant.socials.facebook && (
              <a
                href={restaurant.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            )}
            <span className="footer-location">{restaurant.address}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {restaurant.name}
          </span>
          <span>Fictional restaurant · Website preview</span>
          {restaurant.credit?.url ? (
            <a href={restaurant.credit.url} target="_blank" rel="noopener noreferrer">
              Built by {restaurant.credit.label}
              <ArrowUpRight size={12} />
            </a>
          ) : restaurant.credit ? (
            <span>Built by {restaurant.credit.label}</span>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
