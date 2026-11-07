import { z } from 'zod';
export const orderSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  customer: z.object({
    name: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
    table: z.string().optional(),
  }),
  type: z.enum(['delivery', 'pickup', 'dinein']),
  lines: z.array(
    z.object({
      name: z.string(),
      qty: z.number().int().min(1).max(20),
      unitPrice: z.number().int().nonnegative(),
      note: z.string().optional(),
    }),
  ),
  notes: z.string().optional(),
  subtotal: z.number().int(),
  fees: z.number().int(),
  delivery: z.number().int(),
  service: z.number().int(),
  total: z.number().int(),
  status: z.enum(['new', 'preparing', 'ready', 'completed', 'cancelled']),
});
export type Order = z.infer<typeof orderSchema>;
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d ()-]{7,22}$/, 'Use a phone number with 7–15 digits.')
  .refine((value) => {
    const n = value.replace(/\D/g, '').length;
    return n >= 7 && n <= 15;
  }, 'Use a phone number with 7–15 digits.');
export const checkoutSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(80),
  phone: z.union([z.literal(''), phoneSchema]),
  address: z.string().trim().max(240),
  table: z.string().trim().max(20),
});
export function nextId(prefix: string, existing: { id: string }[]) {
  const used = new Set(existing.map((item) => item.id));
  for (let n = 1; n <= 9999; n++) {
    const id = prefix + '-' + String(n).padStart(4, '0');
    if (!used.has(id)) return id;
  }
  return prefix + '-' + crypto.randomUUID();
}
