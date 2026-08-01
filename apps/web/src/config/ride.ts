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

// Display labels live in messages under BikeTypes.
// 'all' = UI-only sentinel (any bike welcome), not a storage type.

// Storage slugs — must match backend ride_type enum exactly.
export const RIDE_TYPES = ['casual', 'coffee_ride', 'sightseeing', 'training'] as const;
export type RideType = (typeof RIDE_TYPES)[number];

// Display labels live in messages under RideTypes.

// Storage slugs — must match backend drop_policy enum exactly.
export const DROP_POLICIES = ['no_drop', 'regroup', 'drop'] as const;
export type DropPolicy = (typeof DROP_POLICIES)[number];

// Display labels live in messages under DropPolicies.
