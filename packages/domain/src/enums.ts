export const RIDE_TYPES = ['casual', 'coffee_ride', 'sightseeing', 'training'] as const;
export type RideType = (typeof RIDE_TYPES)[number];

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

export const DROP_POLICIES = ['no_drop', 'regroup', 'drop'] as const;
export type DropPolicy = (typeof DROP_POLICIES)[number];

export const PACE_POLICIES = ['slowest_rider', 'leader', 'group_split'] as const;
export type PacePolicy = (typeof PACE_POLICIES)[number];

export const FORMATION_POLICIES = ['free', 'leader', 'rotation'] as const;
export type FormationPolicy = (typeof FORMATION_POLICIES)[number];

export const EXPERIENCE_POLICIES = ['first_timers', 'moderate', 'advanced'] as const;
export type ExperiencePolicy = (typeof EXPERIENCE_POLICIES)[number];

export const RIDE_STATUSES = ['draft', 'published', 'cancelled'] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

export const AVAILABILITIES = ['open', 'full'] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const PHASES = ['upcoming', 'past'] as const;
export type Phase = (typeof PHASES)[number];

export const RIDE_ROLES = ['organising', 'joined'] as const;
export type RideRole = (typeof RIDE_ROLES)[number];

export const PARTICIPANT_STATUSES = ['pending', 'confirmed', 'declined'] as const;
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export const APP_ENVS = ['development', 'staging', 'production'] as const;
export type AppEnv = (typeof APP_ENVS)[number];
