import { restaurant } from '../config/restaurant.config';
import { formatMoney } from './format';
import type { Order } from './records';
export function orderMessage(order: Order, notes = true, limit = order.lines.length) {
  const lines = [
    '🍽️ *New Order — ' + order.id + '*',
    'Name: ' + order.customer.name,
    'Type: ' + { delivery: 'Delivery', pickup: 'Pickup', dinein: 'Dine-in' }[order.type],
  ];
  if (order.type === 'delivery' && order.customer.address)
    lines.push('Address: ' + order.customer.address);
  if (order.type === 'dinein' && order.customer.table) lines.push('Table: ' + order.customer.table);
  if (order.customer.phone) lines.push('Phone: ' + order.customer.phone);
  lines.push('', '*Items*');
  order.lines.slice(0, limit).forEach((line) => {
    lines.push(line.qty + ' × ' + line.name + ' — ' + formatMoney(line.qty * line.unitPrice));
    if (notes && line.note) lines.push('  ↳ ' + line.note);
  });
  if (limit < order.lines.length)
    lines.push(' (+' + (order.lines.length - limit) + ' more items, see dashboard)');
  lines.push('', 'Subtotal: ' + formatMoney(order.subtotal));
  if (order.delivery) lines.push('Delivery fee: ' + formatMoney(order.delivery));
  if (order.service) lines.push('Service charge: ' + formatMoney(order.service));
  lines.push('*Total: ' + formatMoney(order.total));
  if (order.notes) lines.push('', 'Notes: ' + order.notes);
  return lines.join('\n');
}
export function whatsappUrl(text: string, number = restaurant.whatsappNumber) {
  const digits = number.replace(/\D/g, '');
  return digits ? 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text) : null;
}
export function orderLink(order: Order, number = restaurant.whatsappNumber) {
  const fullText = orderMessage(order);
  let text = fullText;
  let url = whatsappUrl(text, number);
  if (!url) return { fullText, text, url: null };
  if (url.length >= 1800) {
    text = orderMessage(order, false);
    url = whatsappUrl(text, number);
  }
  for (let count = order.lines.length - 1; url && url.length >= 1800 && count >= 0; count--) {
    text = orderMessage(order, false, count);
    url = whatsappUrl(text, number);
  }
  if (url && url.length >= 1800) {
    const reduced = {
      ...order,
      notes: undefined,
      customer: {
        ...order.customer,
        name: Array.from(order.customer.name).slice(0, 40).join(''),
        address: order.customer.address
          ? Array.from(order.customer.address).slice(0, 60).join('')
          : undefined,
      },
    };
    text = orderMessage(reduced, false, 0);
    url = whatsappUrl(text, number);
  }
  return { fullText, text, url: url && url.length < 1800 ? url : null };
}
export async function copyText(text: string) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Try legacy clipboard. */
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    /* Selectable text remains available. */
  }
  area.remove();
  return copied;
}
export function openWhatsApp(url: string | null) {
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.append(link);
  link.click();
  link.remove();
}
