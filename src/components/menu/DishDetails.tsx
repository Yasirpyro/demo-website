import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { Minus, Plus, X } from 'lucide-react';
import type { MenuItem } from '../../types';
import { FoodImage } from '../ui/FoodImage';
import { formatMoney } from '../../lib/format';
import { tagLabels } from '../../lib/menu-filters';
const selectionSchema = z.object({
  qty: z.number().int().min(1, 'Choose at least one.').max(20, 'Choose no more than 20.'),
  note: z.string().max(240, 'Keep your note within 240 characters.'),
});
export function DishDetails({
  item,
  onClose,
  onAdd,
  returnFocus,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, qty: number, note?: string) => void;
  returnFocus: () => void;
}) {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof selectionSchema>>({
    resolver: zodResolver(selectionSchema),
    defaultValues: { qty: 1, note: '' },
  });
  const qty = useWatch({ control, name: 'qty', defaultValue: 1 });
  const note = useWatch({ control, name: 'note', defaultValue: '' });
  const id = useId();
  const changeQty = (value: number) =>
    setValue('qty', Number.isFinite(value) ? Math.max(1, Math.min(20, Math.trunc(value))) : 1, {
      shouldDirty: true,
      shouldValidate: true,
    });
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dish-overlay" />
        <Dialog.Content
          className="dish-details"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus();
          }}
        >
          <Dialog.Close className="icon-button dish-close" aria-label="Close dish details">
            <X size={21} />
          </Dialog.Close>
          <FoodImage
            image={item.image}
            alt={item.name}
            position={item.imagePosition}
            sizes="(min-width:768px) 560px, 100vw"
          />
          <div className="dish-details-body">
            <div className="menu-tags">
              {item.tags.map((tag) => (
                <span className={'menu-tag tag-' + tag} key={tag}>
                  {tagLabels[tag]}
                </span>
              ))}
            </div>
            <Dialog.Title>{item.name}</Dialog.Title>
            <Dialog.Description>{item.description}</Dialog.Description>
            <p className="dish-price">{formatMoney(item.price)}</p>
            <form
              onSubmit={handleSubmit((data) => {
                if (item.available) {
                  onAdd(item, data.qty, data.note);
                  onClose();
                }
              })}
            >
              <div className="quantity-row">
                <label htmlFor={id + '-qty'}>
                  Quantity <span>(1–20)</span>
                </label>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => changeQty(qty - 1)}
                    disabled={qty === 1 || !item.available}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={17} />
                  </button>
                  <input
                    id={id + '-qty'}
                    {...register('qty', { valueAsNumber: true })}
                    aria-invalid={Boolean(errors.qty)}
                    aria-describedby={errors.qty ? id + '-qty-error' : undefined}
                    type="number"
                    min="1"
                    max="20"
                    step="1"
                    value={qty}
                    disabled={!item.available}
                    onChange={(event) => changeQty(event.currentTarget.valueAsNumber)}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => changeQty(qty + 1)}
                    disabled={qty === 20 || !item.available}
                    aria-label="Increase quantity"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>
              {errors.qty && (
                <p className="form-error" id={id + '-qty-error'} role="alert">
                  {errors.qty.message}
                </p>
              )}
              <label className="note-label" htmlFor={id + '-note'}>
                Make it yours <span>Optional note</span>
              </label>
              <textarea
                id={id + '-note'}
                rows={3}
                {...register('note')}
                aria-invalid={Boolean(errors.note)}
                aria-describedby={id + '-note-help' + (errors.note ? ' ' + id + '-note-error' : '')}
                maxLength={240}
                dir="auto"
              />
              <p className="note-help" id={id + '-note-help'}>
                Spice preferences or a little extra care. {note.length}/240
              </p>
              {errors.note && (
                <p className="form-error" id={id + '-note-error'} role="alert">
                  {errors.note.message}
                </p>
              )}
              <button
                className="button dish-submit"
                type="submit"
                disabled={!item.available || isSubmitting}
              >
                {item.available ? 'Add to cart · ' + formatMoney(item.price * qty) : 'Sold out'}
              </button>
              <p className="dish-preview-note">
                Saved on this browser. Online checkout is not available yet.
              </p>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
