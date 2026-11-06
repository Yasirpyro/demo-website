import { restaurant } from '../config/restaurant.config';

export function formatMoney(value: number, currency = restaurant.currency): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.fractionDigits,
    maximumFractionDigits: currency.fractionDigits,
  }).format(value / 10 ** currency.fractionDigits);
}
