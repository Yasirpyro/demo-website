export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type OpeningHours = Record<Weekday, { open: string; close: string } | null>;
export type ThemeTokens = Partial<
  Record<`--color-${string}` | `--font-${string}` | `--radius-${string}`, string>
>;
export interface RestaurantConfig {
  mode: 'demo' | 'production';
  name: string;
  shortName: string;
  tagline: string[];
  description: string;
  eyebrow: string;
  logo: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  neighborhood: string;
  mapsUrl: string;
  mapImage: string;
  timezone: string;
  currency: { code: string; locale: string; fractionDigits: number };
  socials: { instagram?: string; facebook?: string; tiktok?: string; youtube?: string };
  hours: OpeningHours;
  closedDates: string[];
  fees: { delivery: number; servicePercent: number; freeDeliveryOver?: number };
  reservations: {
    maxGuests: number;
    slotMinutes: number;
    advanceDays: number;
    capacityPerSlot: number;
  };
  features: { remoteSync: boolean; sound: boolean };
  theme: ThemeTokens;
  heroItemIds: string[];
  featuredItemIds: string[];
  story: { eyebrow: string; title: string; body: string; note: string };
  visit: { title: string; body: string };
  credit?: { label: string; url: string };
}
export interface Category {
  id: string;
  name: string;
  image: string;
  blurb: string;
}
export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imagePosition?: string;
  tags: ('veg' | 'spicy' | 'popular' | 'new')[];
  available: boolean;
}
export interface Offer {
  id: string;
  title: string;
  blurb: string;
  itemIds: { id: string; qty: number }[];
  price: number;
  validity?: string;
  image: string;
}
export interface Review {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
  sample: true;
}
