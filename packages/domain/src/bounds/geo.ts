export const LNG_MIN = -180;
export const LNG_MAX = 180;
export const LAT_MIN = -90;
export const LAT_MAX = 90;

export const LOCATION_NAME_MAX_LENGTH = 40;

export const DEFAULT_SELECTED_LOCATION = {
  location: { x: 20.037364158779383, y: 50.07271576504815 },
  city: 'Kraków',
  district: 'Nowa Huta',
  municipality: null,
  region: null,
  country: 'Poland',
  postal_code: null,
} as const;
