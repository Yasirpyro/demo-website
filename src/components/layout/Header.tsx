import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { restaurant } from '../../config/restaurant.config';
import { OpeningBadge } from './OpeningBadge';
export function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: '/menu', label: 'The menu' },
    { to: '/#story', label: 'Our story' },
    { to: '/#visit', label: 'Visit us' },
  ];
  return (
    <>
      <div className="info-bar container">
        <span>{restaurant.neighborhood}</span>
        <OpeningBadge />
      </div>
      <header className="site-header container">
        <Link to="/" className="wordmark" aria-label={restaurant.name + ' home'}>
          <img src={restaurant.logo} width="34" height="34" alt="" />
          <span>
            {restaurant.shortName}
            <span className="wordmark-subtitle">{restaurant.brandDescriptor.toUpperCase()}</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link className="button header-cta" to="/reserve">
          Find your table{' '}
          <span className="arrow-circle">
            <ArrowUpRight size={17} />
          </span>
        </Link>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="mobile-menu icon-button" aria-label="Open navigation">
            <Menu size={23} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="nav-overlay" />
            <Dialog.Content className="mobile-nav">
              <div className="mobile-nav-heading">
                <Dialog.Title>{restaurant.name}</Dialog.Title>
                <Dialog.Close className="icon-button" aria-label="Close navigation">
                  <X />
                </Dialog.Close>
              </div>
              <Dialog.Description>Good food is just around the corner.</Dialog.Description>
              <nav aria-label="Mobile navigation">
                {[...links, { to: '/reserve', label: 'Find your table' }].map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                    {l.label}
                    <ArrowUpRight size={25} />
                  </Link>
                ))}
              </nav>
              <p className="eyebrow">{restaurant.eyebrow}</p>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
