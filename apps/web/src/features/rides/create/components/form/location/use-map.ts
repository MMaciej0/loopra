import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import type { Point } from '@loopra/domain';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import { reverseGeocode, type RideLocation } from '@/features/locations/geocoding';

const DEFAULT_CENTER: [number, number] = [19.9275, 50.0616]; // [lng, lat] — Kraków
const DEFAULT_ZOOM = 14;

export interface PickedLocation extends RideLocation {
  coords: Point;
}

interface UseMapProps {
  initialCoords?: Point;
  onPick: (loc: PickedLocation) => void;
  language?: string; // ISO 639-1, localizes reverse-geocoded place names
  searchPlaceholder?: string;
}

export function useMap({ onPick, initialCoords, language = 'en', searchPlaceholder }: UseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  // keep latest language for the click handler without re-creating the map
  const languageRef = useRef(language);
  const onPickRef = useRef(onPick);
  const initialCoordsRef = useRef(initialCoords);
  const searchPlaceholderRef = useRef(searchPlaceholder);

  useEffect(() => {
    languageRef.current = language;
    onPickRef.current = onPick;
  });

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: initialCoordsRef.current
        ? [initialCoordsRef.current.x, initialCoordsRef.current.y]
        : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      navigationControl: false,
      geolocateControl: false,
      // Compact attribution: collapses "© MapTiler © OpenStreetMap contributors"
      // into an expandable ⓘ. Required attribution stays visible/reachable — legal.
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const geocoder = new GeocodingControl({
      types: ['municipality', 'address', 'country'],
      proximity: [{ type: 'map-center' }],
      placeholder: searchPlaceholderRef.current,
      language: languageRef.current,
      marker: false,
      showResultMarkers: false,
    });

    map.addControl(geocoder, 'top-left');
    map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const pointer = new maptilersdk.Marker({ color: accent });

    const startCoords = initialCoordsRef.current;
    if (startCoords) {
      pointer.setLngLat([startCoords.x, startCoords.y]).addTo(map);
    }

    // Compact attribution renders expanded on load and only minimizes after the
    // first map interaction — collapse it to the ⓘ toggle immediately.
    map.on('load', () => {
      mapContainerRef.current
        ?.querySelector('.maplibregl-ctrl-attrib')
        ?.classList.remove('maplibregl-compact-show');
    });

    map.on('click', async (e) => {
      const coords: Point = { x: e.lngLat.lng, y: e.lngLat.lat };
      pointer.setLngLat(e.lngLat).addTo(map); // instant marker, no wait
      map.easeTo({ center: e.lngLat }); // recenter on the picked point
      const location = await reverseGeocode(coords, languageRef.current);
      onPickRef.current({ coords, ...location });
    });

    return () => {
      mapRef.current = null;

      if (map.loaded()) {
        map.remove();
        map.removeControl(geocoder);
      } else {
        map.once('load', () => {
          map.remove();
          map.removeControl(geocoder);
        });
      }
    };
  }, []);

  return {
    mapContainerRef,
    mapRef,
  };
}
