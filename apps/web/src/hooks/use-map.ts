import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { Coords } from '@/app/[locale]/(dashboard)/_components/app-sidebar/create-ride/schema';

const DEFAULT_CENTER: [number, number] = [19.9275, 50.0616]; // [lng, lat] — Kraków
const DEFAULT_ZOOM = 14;

interface UseMapProps {
  onPick: (coords: Coords) => void;
}

export function useMap({ onPick }: UseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      navigationControl: false,
      geolocateControl: false,
    });
    mapRef.current = map;

    map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const pointer = new maptilersdk.Marker({ color: accent });

    map.on('click', (e) => {
      pointer.setLngLat(e.lngLat).addTo(map);
      onPick({ x: e.lngLat.lng, y: e.lngLat.lat });
    });

    return () => {
      mapRef.current = null;

      if (map.loaded()) {
        map.remove();
      } else {
        map.once('load', () => map.remove());
      }
    };
  }, []);

  return {
    mapContainerRef,
  };
}
