import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Toast from '@radix-ui/react-toast';
import { Flame, Leaf, Search, ShoppingBag, X, UtensilsCrossed } from 'lucide-react';
import { categories, menu, cartItems } from '../config/menu.data';
import { restaurant } from '../config/restaurant.config';
import { filterMenu, type MenuTag } from '../lib/menu-filters';
import { formatMoney } from '../lib/format';
import { MenuCard } from '../components/menu/MenuCard';
import { DishDetails } from '../components/menu/DishDetails';
import { useCartStore } from '../store/cart.store';
import type { MenuItem } from '../types';
export default function Menu() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; text: string } | null>(null);
  const feedbackId = useRef(0);
  const lines = useCartStore((state) => state.lines);
  const add = useCartStore((state) => state.add);
  const clear = useCartStore((state) => state.clear);
  const category = categories.some((c) => c.id === params.get('category'))
    ? (params.get('category') ?? '')
    : '';
  const tag: MenuTag =
    params.get('tag') === 'veg' ? 'veg' : params.get('tag') === 'spicy' ? 'spicy' : '';
  useEffect(() => {
    clearTimeout(timer.current);
    setQuery(params.get('q') ?? '');
  }, [params]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const results = filterMenu(menu, { query: params.get('q') ?? '', category, tag });
  const update = (key: string, value: string, replace = false) => {
    clearTimeout(timer.current);
    const next = new URLSearchParams(params);
    if (query.trim()) next.set('q', query);
    else next.delete('q');
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace, preventScrollReset: true });
  };
  const changeSearch = (value: string) => {
    setQuery(value);
    clearTimeout(timer.current);
    const next = new URLSearchParams(params);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    timer.current = setTimeout(
      () => setParams(next, { replace: true, preventScrollReset: true }),
      120,
    );
  };
  const clearFilters = () => {
    clearTimeout(timer.current);
    setQuery('');
    const next = new URLSearchParams(params);
    for (const key of ['q', 'category', 'tag']) next.delete(key);
    setParams(next, { preventScrollReset: true });
  };
  const onAdd = (item: MenuItem, qty: number, note?: string) => {
    const added = add(item.id, qty, note);
    setFeedback({
      id: ++feedbackId.current,
      text: added
        ? 'Added ' + added + ' × ' + item.name + ' to your cart.'
        : 'This cart line has reached the limit of 20.',
    });
  };
  const count = lines.reduce((total, line) => total + line.qty, 0);
  const subtotal = lines.reduce(
    (total, line) =>
      total + line.qty * (cartItems.find((item) => item.id === line.itemId)?.price ?? 0),
    0,
  );
  return (
    <Toast.Provider duration={3000}>
      <section className="menu-page">
        <div className="container menu-intro">
          <p className="eyebrow">THE {restaurant.name.toUpperCase()} MENU</p>
          <h1 ref={heading} tabIndex={-1}>
            {restaurant.menuIntro.title}
          </h1>
          <p>{restaurant.menuIntro.description}</p>
          <div className="menu-preview-note">
            <ShoppingBag size={17} aria-hidden="true" />
            <span>Prepared to order · Build your cart, then share it on WhatsApp.</span>
          </div>
        </div>
        <div className="menu-filter-bar">
          <div className="container">
            <label className="menu-search">
              <Search size={20} aria-hidden="true" />
              <span className="menu-search-label">Search dishes</span>
              <input
                type="search"
                dir="auto"
                value={query}
                onChange={(event) => changeSearch(event.currentTarget.value)}
                aria-controls="menu-results"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => changeSearch('')}>
                  <X size={17} />
                </button>
              )}
            </label>
            <div className="category-chips" role="group" aria-label="Menu categories">
              <button aria-pressed={!category} onClick={() => update('category', '')}>
                All dishes
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  aria-pressed={category === c.id}
                  onClick={() => update('category', c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="container menu-results-section">
          <div className="menu-results-toolbar">
            <p role="status">
              {results.length} {results.length === 1 ? 'dish' : 'dishes'}
              {category ? ' in ' + categories.find((c) => c.id === category)?.name : ''}
            </p>
            <div className="tag-filters" role="group" aria-label="Dietary filters">
              <button
                aria-pressed={tag === 'veg'}
                onClick={() => update('tag', tag === 'veg' ? '' : 'veg')}
              >
                <Leaf size={15} />
                Veg
              </button>
              <button
                aria-pressed={tag === 'spicy'}
                onClick={() => update('tag', tag === 'spicy' ? '' : 'spicy')}
              >
                <Flame size={15} />
                Spicy
              </button>
              {(category || tag || query) && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          </div>
          <div id="menu-results" className="menu-grid">
            {results.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onView={(dish, element) => {
                  trigger.current = element;
                  setSelected(dish);
                }}
                onAdd={onAdd}
              />
            ))}
          </div>
          {results.length === 0 && (
            <div className="menu-empty">
              <UtensilsCrossed size={38} strokeWidth={1.25} aria-hidden="true" />
              <h2>Nothing on this plate. Yet.</h2>
              <p>Try another dish name, or give all our flavours a chance.</p>
              <button className="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
          {lines.length > 0 && (
            <section className="saved-selection" aria-labelledby="saved-selection-heading">
              <div>
                <p className="eyebrow">SAVED ON THIS BROWSER</p>
                <h2 id="saved-selection-heading">Your selection.</h2>
                <p>
                  {count} {count === 1 ? 'item' : 'items'} · {formatMoney(subtotal)}
                </p>
              </div>
              <ul>
                {lines.map((line, i) => (
                  <li key={line.itemId + ':' + (line.note ?? '') + ':' + i}>
                    <span>
                      {line.qty} × {cartItems.find((item) => item.id === line.itemId)?.name}
                      {line.note && <small dir="auto">{line.note}</small>}
                    </span>
                    <span>
                      {formatMoney(
                        line.qty * (cartItems.find((item) => item.id === line.itemId)?.price ?? 0),
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p>Use the cart button to edit your selection and order on WhatsApp.</p>
              <button className="clear-selection" onClick={clear}>
                Clear saved selection
              </button>
            </section>
          )}
        </div>
      </section>
      {selected && (
        <DishDetails
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={onAdd}
          returnFocus={() => {
            if (trigger.current?.isConnected) trigger.current.focus();
            else heading.current?.focus();
          }}
        />
      )}
      {feedback && (
        <Toast.Root key={feedback.id} defaultOpen className="menu-toast">
          <Toast.Title>{feedback.text}</Toast.Title>
          <Toast.Close className="icon-button" aria-label="Dismiss notification">
            <X size={16} />
          </Toast.Close>
        </Toast.Root>
      )}
      <Toast.Viewport className="menu-toast-viewport" />
    </Toast.Provider>
  );
}
