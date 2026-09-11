export const MIN_LEAD_HOURS = 5;

export const TITLE_MIN_LENGTH = 5;
export const TITLE_MAX_LENGTH = 50;

export const LOCATION_NAME_MAX_LENGTH = 40;

// Every ride is capped. The creator counts toward the cap, so 2 is the smallest
// ride that admits anyone else.
export const MAX_PARTICIPANTS_MIN = 2;
export const MAX_PARTICIPANTS_MAX = 500;

export const DISTANCE_MIN_KM = 1;
export const DISTANCE_MAX_KM = 9999;

export const LNG_MIN = -180;
export const LNG_MAX = 180;
export const LAT_MIN = -90;
export const LAT_MAX = 90;

// Storage slugs — must match backend bike_type enum exactly.
// 'any' means every bike is welcome. It is a stored value, not the absence of one.
export const BIKE_TYPES = [
  'any',
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

// Storage slugs — must match backend ride_type enum exactly.
export const RIDE_TYPES = ['casual', 'coffee_ride', 'sightseeing', 'training'] as const;
export type RideType = (typeof RIDE_TYPES)[number];

// Display labels live in messages under RideTypes.

// Storage slugs — must match backend drop_policy enum exactly.
export const DROP_POLICIES = ['no_drop', 'regroup', 'drop'] as const;
export type DropPolicy = (typeof DROP_POLICIES)[number];

// Display labels live in messages under DropPolicies.

// Storage slugs — must match backend pace_policy enum exactly.
export const PACE_POLICIES = ['slowest_rider', 'leader', 'group_split'] as const;
export type PacePolicy = (typeof PACE_POLICIES)[number];

// Display labels live in messages under PacePolicies.
// 'leader' is the only policy that requires average_pace_kmh.
export const PACE_MIN_KMH = 5;
export const PACE_MAX_KMH = 60;

// Storage slugs — must match backend formation_policy enum exactly.
export const FORMATION_POLICIES = ['free', 'leader', 'rotation'] as const;
export type FormationPolicy = (typeof FORMATION_POLICIES)[number];

// Display labels live in messages under FormationPolicies.

// Storage slugs — must match backend experience_policy enum exactly.
export const EXPERIENCE_POLICIES = ['first_timers', 'moderate', 'advanced'] as const;
export type ExperiencePolicy = (typeof EXPERIENCE_POLICIES)[number];

// Display labels live in messages under ExperiencePolicies.
