import type { LocationSuggestion } from '@/features/locations/geocoding';

export function toLocationBody(location: LocationSuggestion) {
  return {
    location: location.coords,
    city: location.city,
    district: location.district || null,
    municipality: location.municipality || null,
    region: location.region || null,
    country: location.country,
    postal_code: location.postal_code || null,
  };
}
