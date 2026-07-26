export const MIN_LEAD_HOURS = 5;

export const TITLE_MIN_LENGTH = 5;
export const TITLE_MAX_LENGTH = 50;

export const LNG_MIN = -180;
export const LNG_MAX = 180;
export const LAT_MIN = -90;
export const LAT_MAX = 90;

// Storage slugs — must match backend bike_type enum exactly.
export const BIKE_TYPES = [
  'road',
  'gravel',
  'mtb',
  'trekking',
  'urban',
  'cyclocross',
  'tt',
  'electric',
] as const;
export type BikeType = (typeof BIKE_TYPES)[number];

// Display labels. 'all' = UI-only sentinel (any bike welcome), not a storage type.
export const BIKE_TYPE_LABELS: Record<BikeType | 'all', string> = {
  all: 'All',
  road: 'Road',
  gravel: 'Gravel',
  mtb: 'MTB',
  trekking: 'Trekking',
  urban: 'Urban',
  cyclocross: 'Cyclocross',
  tt: 'TT / Triathlon',
  electric: 'Electric',
};

export const RIDE_TYPES = ['trip', 'training'] as const;
export type RideType = (typeof RIDE_TYPES)[number];
