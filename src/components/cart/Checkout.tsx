import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { checkoutSchema, type Order } from '../../lib/records';
import { orderLink, copyText, openWhatsApp } from '../../lib/whatsapp';
import { useOrdersStore } from '../../store/orders.store';
import { useCartStore } from '../../store/cart.store';
import { menu } from '../../config/menu.data';
import { cartTotals, type OrderType } from '../../lib/cart';
import { restaurant } from '../../config/restaurant.config';
export function OrderConfirmation({ order }: { order: Order }) {
  const [copied, setCopied] = useState('');
  const link = orderLink(order);
  return (
    <section className="success-panel" aria-label="Order confirmation">
      <p className="eyebrow">SAVED ON THIS BROWSER</p>
      <h3>{order.id} is ready to share.</h3>
      <p>
        Your order is saved locally. Send it in WhatsApp to request confirmation from the
        restaurant.
      </p>
      {!link.url && (
        <p>
          No restaurant WhatsApp number is configured. Copy the text below to share it yourself.
        </p>
      )}
      <div className="commerce-actions">
        {link.url ? (
          <a className="button" href={link.url} target="_blank" rel="noopener noreferrer">
            Open WhatsApp again
          </a>
        ) : (
          <button className="button" disabled>
            Open WhatsApp again
          </button>
        )}
        <button
          className="button button-secondary"
          onClick={() => {
            void copyText(link.fullText).then((ok) =>
              setCopied(ok ? 'Order text copied.' : 'Select the text below and copy it manually.'),
            );
          }}
        >
          Copy order text
        </button>
      </div>
      <p role="status">{copied}</p>
      <label>
        Full order text
        <textarea className="confirmation-text" readOnly value={link.fullText} />
      </label>
    </section>
  );
}
export function Checkout({
  type,
  onComplete,
}: {
  type: OrderType;
  onComplete: (order: Order) => void;
}) {
  const locked = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', phone: '', address: '', table: '' },
  });
  const submit = handleSubmit((values) => {
    if (locked.current) return;
    if (type === 'delivery' && !values.address) {
      setError('address', { message: 'Please enter your delivery address.' });
      return;
    }
    const cart = useCartStore.getState();
    if (!cart.lines.length) return;
    locked.current = true;
    const totals = cartTotals(cart.lines, type);
    const order = useOrdersStore.getState().add({
      customer: {
        name: values.name,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(type === 'delivery' ? { address: values.address } : {}),
        ...(type === 'dinein' && values.table ? { table: values.table } : {}),
      },
      type,
      lines: cart.lines.map((line) => ({
        name: menu.find((item) => item.id === line.itemId)!.name,
        qty: line.qty,
        unitPrice: menu.find((item) => item.id === line.itemId)!.price,
        note: line.note,
      })),
      notes: cart.notes,
      ...totals,
    });
    onComplete(order);
    cart.clear();
    openWhatsApp(orderLink(order).url);
  });
  if (!formOpen)
    return (
      <button className="button" onClick={() => setFormOpen(true)}>
        Order on WhatsApp
      </button>
    );
  return (
    <form
      className="commerce-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(event);
      }}
      noValidate
    >
      <h3>A few details, then dinner.</h3>
      {(
        [
          'name',
          'phone',
          ...(type === 'delivery' ? ['address'] : []),
          ...(type === 'dinein' ? ['table'] : []),
        ] as const
      ).map((field) => {
        const key = field as keyof z.infer<typeof checkoutSchema>;
        return (
          <label key={key}>
            {
              {
                name: 'Your name',
                phone: 'Phone (optional)',
                address: 'Delivery address',
                table: 'Table number (optional)',
              }[key]
            }
            <input
              {...register(key)}
              dir="auto"
              autoComplete={
                key === 'name'
                  ? 'name'
                  : key === 'phone'
                    ? 'tel'
                    : key === 'address'
                      ? 'street-address'
                      : 'off'
              }
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? key + '-error' : undefined}
            />
            {errors[key] && (
              <span id={key + '-error'} className="field-error">
                {errors[key]?.message}
              </span>
            )}
          </label>
        );
      })}
      <p className="local-hint">
        {restaurant.whatsappNumber
          ? 'WhatsApp opens with your order. Send the message there to finish.'
          : 'Demo mode: save your order and copy its text. No message is sent automatically.'}
      </p>
      <button type="submit" className="button">
        Save order & open WhatsApp
      </button>
    </form>
  );
}
