import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const CITY_ZOOM = 11;

type UseRidesMapProps = Readonly<{ lng: number; lat: number; language: string }>;

export function useRidesMap({ lng, lat, language }: UseRidesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<[number, number]>([lng, lat]);
  const languageRef = useRef(language);

  useEffect(() => {
    centerRef.current = [lng, lat];
    languageRef.current = language;
  });

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

    const map = new maptilersdk.Map({
      container,
      style: maptilersdk.MapStyle.STREETS,
      center: centerRef.current,
      zoom: CITY_ZOOM,
      language: languageRef.current,
      navigationControl: false,
      geolocateControl: false,
      attributionControl: { compact: true },
    });

    let isStyleLoaded = false;
    map.once('style.load', () => {
      isStyleLoaded = true;
    });

    map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      container
        .querySelector('.maplibregl-ctrl-attrib')
        ?.classList.remove('maplibregl-compact-show');
    });

    return () => {
      if (isStyleLoaded) {
        map.remove();
      } else {
        map.once('style.load', () => map.remove());
      }
    };
  }, []);

  return mapContainerRef;
}
