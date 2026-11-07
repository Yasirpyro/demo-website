import { it, expect } from 'vitest';
import { orderMessage, orderLink, whatsappUrl } from '../../src/lib/whatsapp';
import { checkoutSchema, phoneSchema, type Order } from '../../src/lib/records';
const order: Order = {
  id: 'ORD-0001',
  createdAt: new Date().toISOString(),
  customer: { name: 'علی & Ali', address: 'Clifton #2' },
  type: 'delivery',
  lines: [{ name: 'Tikka', qty: 2, unitPrice: 850, note: 'کم مرچ 🌶 & #' }],
  notes: 'hello\nworld',
  subtotal: 1700,
  delivery: 200,
  service: 0,
  fees: 200,
  total: 1900,
  status: 'new',
};
it('formats Unicode and conditional fields without empty labels', () => {
  const text = orderMessage(order);
  expect(text).toContain('2 × Tikka');
  expect(text).toContain('کم مرچ 🌶 & #');
  expect(text).not.toContain('Phone:');
  expect(text).not.toContain('undefined');
  const url = whatsappUrl(text, '+92 300-1234567')!;
  expect(new URL(url).searchParams.get('text')).toBe(text);
  expect(url).toContain('/923001234567?');
});
it('shortens a large link but preserves the full saved message', () => {
  const big = {
    ...order,
    lines: Array.from({ length: 80 }, () => ({ ...order.lines[0]!, note: '🌶'.repeat(100) })),
  };
  const link = orderLink(big, '923001234567');
  expect(link.url!.length).toBeLessThan(1800);
  expect(link.text).toContain('more items, see dashboard');
  expect(link.fullText).toBe(orderMessage(big));
});
it('does not invent an unset recipient', () => expect(orderLink(order, '').url).toBeNull());
it('validates phone formats and required customer name', () => {
  expect(phoneSchema.safeParse('+92 300-1234567').success).toBe(true);
  expect(phoneSchema.safeParse('call me').success).toBe(false);
  expect(checkoutSchema.safeParse({ name: ' ', phone: '', address: '', table: '' }).success).toBe(
    false,
  );
});
