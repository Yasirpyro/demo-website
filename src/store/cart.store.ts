import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { z } from 'zod';
import { cartItems as menu } from '../config/menu.data';
import { storageAdapter, type StorageAdapter } from '../lib/storage-adapter';
export interface CartLine {
  itemId: string;
  qty: number;
  note?: string;
}
interface CartState {
  notes: string;
  setNotes: (notes: string) => void;
  update: (index: number, qty: number, note?: string) => void;
  restore: (line: CartLine) => void;
  lines: CartLine[];
  add: (itemId: string, qty: number, note?: string) => number;
  clear: () => void;
}
const envelope = z.object({
  version: z.literal(1),
  state: z.object({
    notes: z.string().max(500).default(''),
    lines: z.array(
      z.object({
        itemId: z.string(),
        qty: z.number().int().min(1).max(20),
        note: z.string().max(240).optional(),
      }),
    ),
  }),
});
export function createCartStore(adapter: StorageAdapter) {
  const safeStorage: StateStorage = {
    getItem(key) {
      const raw = adapter.getItem(key);
      if (raw === null) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        const result = envelope.safeParse(parsed);
        if (
          result.success &&
          result.data.state.lines.every((line) => menu.some((item) => item.id === line.itemId))
        )
          return JSON.stringify(result.data);
      } catch {
        /* Only the invalid cart key is reset. */
      }
      adapter.removeItem(key);
      return null;
    },
    setItem: (key, value) => adapter.setItem(key, value),
    removeItem: (key) => adapter.removeItem(key),
  };
  return create<CartState>()(
    persist(
      (set, get) => ({
        lines: [],
        notes: '',
        setNotes: (notes) => set({ notes: notes.slice(0, 500) }),
        update(index, qty, note) {
          if (!Number.isFinite(qty)) return;
          set({
            lines: get().lines.flatMap((line, i) =>
              i !== index
                ? [line]
                : qty <= 0
                  ? []
                  : [
                      {
                        ...line,
                        qty: Math.min(20, Math.trunc(qty)),
                        ...(note === undefined ? {} : { note: note.slice(0, 240) }),
                      },
                    ],
            ),
          });
        },
        restore: (line) => {
          get().add(line.itemId, line.qty, line.note);
        },
        add(itemId, qty, note = '') {
          if (!menu.some((item) => item.id === itemId && item.available) || !Number.isFinite(qty))
            return 0;
          const requested = Math.max(1, Math.min(20, Math.trunc(qty)));
          const cleanNote = note.trim().slice(0, 240);
          const previous = get().lines.find(
            (line) => line.itemId === itemId && (line.note ?? '') === cleanNote,
          );
          const added = Math.min(requested, 20 - (previous?.qty ?? 0));
          if (added === 0) return 0;
          set({
            lines: previous
              ? get().lines.map((line) =>
                  line === previous ? { ...line, qty: line.qty + added } : line,
                )
              : [...get().lines, { itemId, qty: added, ...(cleanNote ? { note: cleanNote } : {}) }],
          });
          return added;
        },
        clear: () => set({ lines: [], notes: '' }),
      }),
      {
        name: 'rdemo:v1:cart',
        version: 1,
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({ lines: state.lines, notes: state.notes }),
      },
    ),
  );
}
export const useCartStore = createCartStore(storageAdapter);
