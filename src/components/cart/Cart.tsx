import { Checkout, OrderConfirmation } from './Checkout';
import type { Order } from '../../lib/records';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, type CartLine } from '../../store/cart.store';
import { menu } from '../../config/menu.data';
import { cartTotals, type OrderType } from '../../lib/cart';
import { formatMoney } from '../../lib/format';
import { FoodImage } from '../ui/FoodImage';
export function Cart() {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [type, setType] = useState<OrderType>('pickup');
  const [removed, setRemoved] = useState<CartLine | null>(null);
  const cart = useCartStore();
  const count = cart.lines.reduce((sum, line) => sum + line.qty, 0);
  const totals = cartTotals(cart.lines, type);
  const remove = (index: number) => {
    setRemoved(cart.lines[index] ?? null);
    cart.update(index, 0);
  };
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="icon-button cart-trigger"
        aria-label={'Open cart, ' + count + ' items'}
      >
        <ShoppingBag size={21} />
        <span>{count}</span>
      </Dialog.Trigger>
      {count > 0 && (
        <button className="sticky-cart button" onClick={() => setOpen(true)}>
          {count} items · {formatMoney(totals.total)} · View cart
        </button>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="commerce-overlay" />
        <Dialog.Content className="cart-sheet">
          <div className="sheet-heading">
            <Dialog.Title>Your table starts here.</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close cart">
              <X />
            </Dialog.Close>
          </div>
          <Dialog.Description>
            Choose your favourites. Everything is saved on this browser.
          </Dialog.Description>
          {order ? (
            <>
              <OrderConfirmation order={order} />
              <button className="button button-secondary" onClick={() => setOrder(null)}>
                Start another order
              </button>
            </>
          ) : cart.lines.length === 0 ? (
            <div className="commerce-empty">
              <ShoppingBag size={38} />
              <h3>A little room for something good.</h3>
              <Link className="button" to="/menu" onClick={() => setOpen(false)}>
                Explore the menu
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-lines">
                {cart.lines.map((line, index) => {
                  const item = menu.find((d) => d.id === line.itemId);
                  if (!item) return null;
                  return (
                    <li key={index}>
                      <FoodImage
                        image={item.image}
                        sizes="76px"
                        alt={item.name}
                        className="cart-photo"
                      />
                      <div className="cart-line-copy">
                        <h3>{item.name}</h3>
                        <strong>{formatMoney(item.price * line.qty)}</strong>
                        <div className="quantity-control">
                          <button
                            className="icon-button"
                            aria-label={'Decrease ' + item.name}
                            onClick={() =>
                              line.qty === 1 ? remove(index) : cart.update(index, line.qty - 1)
                            }
                          >
                            <Minus size={16} />
                          </button>
                          <output aria-label={'Quantity of ' + item.name}>{line.qty}</output>
                          <button
                            className="icon-button"
                            disabled={line.qty >= 20}
                            aria-label={'Increase ' + item.name}
                            onClick={() => cart.update(index, line.qty + 1)}
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={'Remove ' + item.name}
                            onClick={() => remove(index)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <label>
                          Dish note
                          <input
                            dir="auto"
                            maxLength={240}
                            value={line.note ?? ''}
                            onChange={(e) => cart.update(index, line.qty, e.target.value)}
                          />
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <label>
                Order type
                <select value={type} onChange={(e) => setType(e.target.value as OrderType)}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="dinein">Dine-in</option>
                </select>
              </label>
              <label>
                Order notes
                <textarea
                  dir="auto"
                  maxLength={500}
                  value={cart.notes}
                  onChange={(e) => cart.setNotes(e.target.value)}
                />
              </label>
              <dl className="cart-totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(totals.subtotal)}</dd>
                </div>
                <div>
                  <dt>Delivery fee</dt>
                  <dd>{formatMoney(totals.delivery)}</dd>
                </div>
                <div>
                  <dt>Service charge</dt>
                  <dd>{formatMoney(totals.service)}</dd>
                </div>
                <div className="grand-total">
                  <dt>Total</dt>
                  <dd>{formatMoney(totals.total)}</dd>
                </div>
              </dl>
              <Checkout type={type} onComplete={setOrder} />
            </>
          )}
          {removed && (
            <div role="status" className="undo-notice">
              Item removed.{' '}
              <button
                onClick={() => {
                  cart.restore(removed);
                  setRemoved(null);
                }}
              >
                Undo removal
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
