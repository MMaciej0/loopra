import * as maptilersdk from '@maptiler/sdk';
import { formatLocationLabel } from '@loopra/domain';
import type { SelectedLocation } from '@loopra/domain';
import type { GeocodingFeature } from '@maptiler/sdk';
import type { Coords } from '@/features/rides/create/schema';

export interface RideLocation {
  city: string;
  district: string;
  country: string;
  region: string;
  municipality: string;
  postal_code: string;
  full_address: string;
}

export interface LocationSuggestion extends RideLocation {
  id: string;
  label: string;
  coords: Coords;
  is_street: boolean;
  containing_district: string;
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
  district: '',
  country: '',
  region: '',
  municipality: '',
  postal_code: '',
  full_address: '',
};

function configureMaptiler() {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_MAPTILER_KEY is not set');
  }

  maptilersdk.config.apiKey = apiKey;
}

// Human-settlement designations, most-specific-preferred first. `hamlet` is
// deliberately excluded — OSM hamlets are things like "Tartak" (a sawmill),
// not real towns.
const SETTLEMENT = ['city', 'town', 'village'];

// Each feature carries a `context[]` hierarchy keyed by an id prefix
// (`country.*`, `region.*`, `municipality.*`, `postal_code.*`). The human
// settlement (city/town/village) is identified by `place_designation` rather
// than a type prefix, because in many countries the `municipality.*` level is
// an administrative commune (e.g. "gmina Charsznica"), not the place name.
// The `country.*` entry is excluded from that scan: MapTiler designates India's
// country entry a `town`, which otherwise resolves Bandra's city to "India".
// The district is positional: the picked feature's own name when it differs
// from the settlement's. Neither id prefix nor place_designation identifies one.
function featureToLocation(feature: GeocodingFeature): RideLocation {
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
    const settlements = hierarchy.filter((h) => !h.id?.startsWith('country.'));

    for (const d of SETTLEMENT) {
      const m = settlements.find((h) => h.place_designation === d);
      if (m) return m;
    }
    // fallback for features without a city/town/village designation
    return byPrefix('locality') ?? byPrefix('municipal_district') ?? byPrefix('place');
  };

  const city = name(settlement());
  const picked = name(self);

  return {
    full_address: feature.place_name || '',
    country: name(byPrefix('country')),
    region: name(byPrefix('region')),
    municipality: name(byPrefix('municipality')),
    city,
    district: picked && city && picked !== city ? picked : '',
    postal_code: name(byPrefix('postal_code')),
  };
}

// Streets are the `address` feature type, but that type also covers rooftop
// address points; `kind` is what says the feature is the street itself.
function isStreet(feature: GeocodingFeature): boolean {
  return (feature.properties as { kind?: string })?.kind === 'street';
}

// Same-named streets in one city share a label down to the region, so the
// district containing them is the only thing that tells the rows apart. The
// locality fallback is load-bearing: not every street carries a neighbourhood.
function containingDistrict(feature: GeocodingFeature): string {
  const context = (feature.context ?? []) as unknown as Ctx[];
  const at = (prefix: string) => context.find((h) => h.id?.startsWith(`${prefix}.`))?.text || '';

  return at('neighbourhood') || at('locality');
}

export { formatLocationLabel };

// Reverse geocode picked coords → the location fields our ride form needs,
// localized to `language` (ISO 639-1, e.g. "pl" / "en"). Passing the language
// to the API makes `text`/`place_name` come back already translated, so we just
// read those fields directly.
export async function reverseGeocode(coords: Coords, language = 'en'): Promise<RideLocation> {
  configureMaptiler();

  try {
    const res = await maptilersdk.geocoding.reverse([coords.x, coords.y], { limit: 1, language });
    const feature = res.features[0];
    return feature ? featureToLocation(feature) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function forwardGeocode(
  query: string,
  language = 'en',
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  configureMaptiler();

  const res = await maptilersdk.geocoding.forward(trimmed, {
    types: [
      'address',
      'postal_code',
      'municipality',
      'municipal_district',
      'place',
      'locality',
      'region',
    ],
    language,
    limit: 5,
  });

  return res.features.map((feature) => {
    const location = featureToLocation(feature);

    return {
      id: feature.id,
      label: location.city
        ? formatLocationLabel(location)
        : feature.place_name || feature.text || '',
      coords: { x: feature.center[0], y: feature.center[1] },
      is_street: isStreet(feature),
      containing_district: containingDistrict(feature),
      ...location,
    };
  });
}

export function toLocationSuggestion(location: SelectedLocation, id: string): LocationSuggestion {
  const parts = {
    city: location.city,
    district: location.district ?? '',
    country: location.country,
    postal_code: location.postal_code ?? '',
  };

  return {
    id,
    label: formatLocationLabel(parts),
    coords: location.location,
    is_street: false,
    containing_district: '',
    ...parts,
    region: location.region ?? '',
    municipality: location.municipality ?? '',
    full_address: '',
  };
}
