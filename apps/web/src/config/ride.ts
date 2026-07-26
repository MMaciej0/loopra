// Mirrors backend event validation (apps/api/src/modules/events/schema.ts).
// Keep in sync — change here to change globally on the web side.

export const MIN_LEAD_HOURS = 5;

export const TITLE_MIN_LENGTH = 5;
export const TITLE_MAX_LENGTH = 50;

export const LNG_MIN = -180;
export const LNG_MAX = 180;
export const LAT_MIN = -90;
export const LAT_MAX = 90;

export const RIDE_TYPES = ['trip', 'training'] as const;
export type RideType = (typeof RIDE_TYPES)[number];
