import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { z } from 'zod';
import { storageAdapter } from '../lib/storage-adapter';
import { orderSchema, type Order, nextId } from '../lib/records';
export function validatedStorage(schema: z.ZodType): StateStorage {
  return {
    getItem(key) {
      const raw = storageAdapter.getItem(key);
      if (!raw) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        const result = schema.safeParse(parsed);
        if (result.success) return JSON.stringify(result.data);
      } catch {
        /* Reset only invalid data. */
      }
      storageAdapter.removeItem(key);
      return null;
    },
    setItem: (key, value) => storageAdapter.setItem(key, value),
    removeItem: (key) => storageAdapter.removeItem(key),
  };
}
interface OrdersState {
  records: Order[];
  add: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  setStatus: (id: string, status: Order['status']) => void;
  reset: () => void;
}
export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      records: [],
      add(input) {
        const order: Order = {
          ...input,
          id: nextId('ORD', get().records),
          createdAt: new Date().toISOString(),
          status: 'new',
        };
        set({ records: [order, ...get().records] });
        return order;
      },
      setStatus: (id, status) =>
        set({
          records: get().records.map((order) => (order.id === id ? { ...order, status } : order)),
        }),
      reset: () => set({ records: [] }),
    }),
    {
      name: 'rdemo:v1:orders',
      version: 1,
      storage: createJSONStorage(() =>
        validatedStorage(
          z.object({ version: z.literal(1), state: z.object({ records: z.array(orderSchema) }) }),
        ),
      ),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
