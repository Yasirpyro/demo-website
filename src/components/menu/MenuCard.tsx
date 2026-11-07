import { Plus, ArrowUpRight } from 'lucide-react';
import type { MenuItem } from '../../types';
import { FoodImage } from '../ui/FoodImage';
import { formatMoney } from '../../lib/format';
import { tagLabels } from '../../lib/menu-filters';
export function MenuCard({
  item,
  onView,
  onAdd,
}: {
  item: MenuItem;
  onView: (item: MenuItem, trigger: HTMLButtonElement) => void;
  onAdd: (item: MenuItem, qty: number, note?: string) => void;
}) {
  return (
    <article className={'menu-card ' + (!item.available ? 'is-sold-out' : '')}>
      <div className="menu-card-image">
        <FoodImage
          image={item.image}
          alt={item.name}
          position={item.imagePosition}
          sizes="(min-width:1280px) 23vw, (min-width:768px) 30vw, 45vw"
        />
        {!item.available && <span className="sold-out-badge">Sold out</span>}
      </div>
      <div className="menu-card-body">
        <div className="menu-tags">
          {item.tags.map((tag) => (
            <span key={tag} className={'menu-tag tag-' + tag}>
              {tagLabels[tag]}
            </span>
          ))}
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card-price">{formatMoney(item.price)}</div>
        <div className="menu-card-actions">
          <button className="view-dish" onClick={(event) => onView(item, event.currentTarget)}>
            View dish<span className="sr-only">: {item.name}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button
            className="add-dish"
            disabled={!item.available}
            onClick={() => onAdd(item, 1)}
            aria-label={'Add ' + item.name + ' to cart'}
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
