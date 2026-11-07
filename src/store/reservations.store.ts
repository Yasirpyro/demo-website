import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import { validatedStorage } from './orders.store';
import { reservationSchema, validateBooking, type Reservation } from '../lib/reservation-rules';
import { nextId } from '../lib/records';
interface State {
  records: Reservation[];
  add: (input: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Reservation | null;
  setStatus: (id: string, status: Reservation['status']) => void;
  reset: () => void;
}
export const useReservationsStore = create<State>()(
  persist(
    (set, get) => ({
      records: [],
      add(input) {
        if (validateBooking(input, get().records)) return null;
        const record: Reservation = {
          ...input,
          id: nextId('RES', get().records),
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set({ records: [record, ...get().records] });
        return record;
      },
      setStatus: (id, status) =>
        set({ records: get().records.map((r) => (r.id === id ? { ...r, status } : r)) }),
      reset: () => set({ records: [] }),
    }),
    {
      name: 'rdemo:v1:reservations',
      version: 1,
      storage: createJSONStorage(() =>
        validatedStorage(
          z.object({
            version: z.literal(1),
            state: z.object({ records: z.array(reservationSchema) }),
          }),
        ),
      ),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
