import * as maptilersdk from '@maptiler/sdk';
import type { Coords } from '@/app/[locale]/(dashboard)/_components/app-sidebar/create-ride/schema';

export interface RideLocation {
  city: string;
  country: string;
  region: string;
  municipality: string;
  postal_code: string;
  full_address: string;
}

// The SDK's geocoding types are missing `place_designation`, so we read the
// hierarchy through a loose shape. `text` is localized to the requested language.
type Ctx = {
  id?: string;
  text?: string;
  place_designation?: string;
};

const EMPTY: RideLocation = {
  city: '',
  country: '',
  region: '',
  municipality: '',
  postal_code: '',
  full_address: '',
};

// Human-settlement designations, most-specific-preferred first. `hamlet` is
// deliberately excluded — OSM hamlets are things like "Tartak" (a sawmill),
// not real towns.
const SETTLEMENT = ['city', 'town', 'village'];

// Reverse geocode picked coords → the location fields our ride form needs,
// localized to `language` (ISO 639-1, e.g. "pl" / "en"). Passing the language
// to the API makes `text`/`place_name` come back already translated, so we just
// read those fields directly.
//
// Response is a GeoJSON FeatureCollection; each feature carries a `context[]`
// hierarchy keyed by an id prefix (`country.*`, `region.*`, `municipality.*`,
// `postal_code.*`). The human settlement (city/town/village) is identified by
// `place_designation` rather than a type prefix, because in many countries the
// `municipality.*` level is an administrative commune (e.g. "gmina Charsznica"),
// not the place name.
export async function reverseGeocode(coords: Coords, language = 'en'): Promise<RideLocation> {
  try {
    const res = await maptilersdk.geocoding.reverse([coords.x, coords.y], { limit: 1, language });
    const feature = res.features[0];
    if (!feature) return EMPTY;

    // feature itself may be a settlement (rural click) → include it; its
    // place_designation lives under .properties, context entries have it flat
    const self: Ctx = {
      id: feature.id,
      text: feature.text,
      place_designation: (feature.properties as { place_designation?: string })?.place_designation,
    };
    const hierarchy: Ctx[] = [self, ...((feature.context ?? []) as unknown as Ctx[])];

    const name = (h?: Ctx) => h?.text || '';
    const byPrefix = (prefix: string) => hierarchy.find((h) => h.id?.startsWith(`${prefix}.`));
    const settlement = () => {
      for (const d of SETTLEMENT) {
        const m = hierarchy.find((h) => h.place_designation === d);
        if (m) return m;
      }
      // fallback for features without a city/town/village designation
      return byPrefix('locality') ?? byPrefix('municipal_district') ?? byPrefix('place');
    };

    return {
      full_address: feature.place_name || '',
      country: name(byPrefix('country')),
      region: name(byPrefix('region')),
      municipality: name(byPrefix('municipality')),
      city: name(settlement()),
      postal_code: name(byPrefix('postal_code')),
    };
  } catch {
    return EMPTY;
  }
}
