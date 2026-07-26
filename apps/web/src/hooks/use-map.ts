import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { Coords } from '@/app/[locale]/(dashboard)/_components/app-sidebar/create-ride/schema';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import { reverseGeocode, type RideLocation } from '@/utils/geocoding';

const DEFAULT_CENTER: [number, number] = [19.9275, 50.0616]; // [lng, lat] — Kraków
const DEFAULT_ZOOM = 14;

export interface PickedLocation extends RideLocation {
  coords: Coords;
}

interface UseMapProps {
  initialCoords?: Coords;
  onPick: (loc: PickedLocation) => void;
  language?: string; // ISO 639-1, localizes reverse-geocoded place names
}

export function useMap({ onPick, initialCoords, language = 'en' }: UseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  // keep latest language for the click handler without re-creating the map
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: initialCoords ? [initialCoords.x, initialCoords.y] : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      navigationControl: false,
      geolocateControl: false,
    });
    mapRef.current = map;

    const geocoder = new GeocodingControl({
      types: ['municipality', 'address', 'country'],
      proximity: [{ type: 'map-center' }],
      placeholder: 'Search country, city or street',
      language: languageRef.current,
      marker: false,
      showResultMarkers: false,
    });

    map.addControl(geocoder, 'top-left');
    map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const pointer = new maptilersdk.Marker({ color: accent });

    if (initialCoords) {
      pointer.setLngLat([initialCoords.x, initialCoords.y]).addTo(map);
    }

    map.on('click', async (e) => {
      const coords: Coords = { x: e.lngLat.lng, y: e.lngLat.lat };
      pointer.setLngLat(e.lngLat).addTo(map); // instant marker, no wait
      const location = await reverseGeocode(coords, languageRef.current);
      onPick({ coords, ...location });
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
