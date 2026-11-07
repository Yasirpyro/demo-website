import type { RestaurantConfig, ThemeTokens } from '../types';

// warm-bakery is the default. Apply boldDark to theme for a second ready preset.
export const boldDark: ThemeTokens = {
  '--color-bg': '#191713',
  '--color-bg-soft': '#28231E',
  '--color-surface': '#28231E',
  '--color-ink': '#FBF4E6',
  '--color-ink-soft': '#D9C7A6',
  '--color-primary': '#F2A31B',
  '--color-primary-hover': '#E5AC4F',
  '--color-on-primary': '#2A1208',
  '--color-border': '#655549',
  '--font-heading': '"Oswald Variable", sans-serif',
};

export const restaurant: RestaurantConfig = {
  mode: 'demo',
  name: 'Grillizia',
  shortName: 'grillizia',
  brandDescriptor: 'Grill & Café',
  heroFootnote: 'Fresh off the grill. Straight to the heart.',
  footerTagline: 'Good food. Better together.',
  tagline: ['Good food.', 'Great company.', 'A little fire.'],
  description:
    'Slow-marinated. Flame-kissed. Always made with heart. Pull up a chair for the flavours that bring us together.',
  eyebrow: 'PAKISTANI ROOTS. A FRESH PERSPECTIVE.',
  logo: '/favicon.svg',
  phone: '',
  whatsappNumber: '',
  address: 'Clifton, Karachi, Pakistan',
  neighborhood: 'YOUR NEW FAVOURITE CORNER IN KARACHI',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Clifton%2C+Karachi%2C+Pakistan',
  mapImage: '/images/neighborhood.svg',
  timezone: 'Asia/Karachi',
  currency: { code: 'PKR', locale: 'en-PK', fractionDigits: 0 },
  socials: {},
  hours: {
    mon: { open: '12:00', close: '23:00' },
    tue: { open: '12:00', close: '23:00' },
    wed: { open: '12:00', close: '23:00' },
    thu: { open: '12:00', close: '23:00' },
    fri: { open: '14:00', close: '00:00' },
    sat: { open: '12:00', close: '00:00' },
    sun: { open: '12:00', close: '23:00' },
  },
  closedDates: [],
  fees: { delivery: 200, servicePercent: 0, freeDeliveryOver: 3000 },
  reservations: { maxGuests: 12, slotMinutes: 30, advanceDays: 30, capacityPerSlot: 3 },
  features: { remoteSync: false, sound: false },
  theme: {},
  menuIntro: {
    title: 'Follow your appetite.',
    description:
      'From the first smoky bite to the last sip of chai. Find something worth coming back for.',
  },
  heroItemIds: ['chicken-tikka', 'karahi', 'biryani', 'seekh-kebab'],
  featuredItemIds: ['chicken-tikka', 'karahi', 'biryani', 'seekh-kebab'],
  story: {
    eyebrow: 'THE WAY WE COOK',
    imageItemId: 'seekh-kebab',
    stamp: ['A little smoke.', 'A lot of soul.'],
    title: 'Rooted in tradition.\nFinished over fire.',
    body: 'The crackle of the grill. The smell of fresh naan. A recipe passed around the family table. We bring the little things together to make something worth gathering for.',
    note: 'Freshly prepared. Generously shared.',
  },
  visit: {
    title: 'There’s a seat\nwith your name on it.',
    body: 'A long lunch, a family dinner, or just one more cup of chai. Come as you are. Stay a little longer.',
  },
  credit: { label: 'HYRX AI Studio', url: '' },
};
