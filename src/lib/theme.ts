import { restaurant } from '../config/restaurant.config';
export function applyRestaurantTheme() {
  for (const [token, value] of Object.entries(restaurant.theme)) {
    if (value) document.documentElement.style.setProperty(token, value);
  }
  document.title = restaurant.name + ' ? Grill & Caf?';
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', restaurant.description);
  document.querySelector('link[rel="icon"]')?.setAttribute('href', restaurant.logo);
}
