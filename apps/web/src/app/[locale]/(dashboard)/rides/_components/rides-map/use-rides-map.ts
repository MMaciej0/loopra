import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const CITY_ZOOM = 11;

type UseRidesMapProps = Readonly<{ lng: number; lat: number; language: string }>;

function toMapStyle(resolvedTheme: string) {
  return resolvedTheme === 'dark'
    ? maptilersdk.MapStyle.STREETS.DARK
    : maptilersdk.MapStyle.STREETS;
}

export function useRidesMap({ lng, lat, language }: UseRidesMapProps) {
  const { resolvedTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const centerRef = useRef<[number, number]>([lng, lat]);
  const languageRef = useRef(language);
  const themeRef = useRef(resolvedTheme);
  const isThemeResolved = resolvedTheme !== undefined;

  useEffect(() => {
    centerRef.current = [lng, lat];
    languageRef.current = language;
    themeRef.current = resolvedTheme;
  });

  useEffect(() => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: CITY_ZOOM });
  }, [lng, lat]);

  useEffect(() => {
    if (resolvedTheme === undefined) return;
    mapRef.current?.setStyle(toMapStyle(resolvedTheme));
  }, [resolvedTheme]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || !isThemeResolved || themeRef.current === undefined) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

    const mapElement = document.createElement('div');
    mapElement.style.width = '100%';
    mapElement.style.height = '100%';
    container.appendChild(mapElement);

    const map = new maptilersdk.Map({
      container: mapElement,
      style: toMapStyle(themeRef.current),
      center: centerRef.current,
      zoom: CITY_ZOOM,
      language: languageRef.current,
      navigationControl: false,
      geolocateControl: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    let isStyleLoaded = false;
    map.once('style.load', () => {
      isStyleLoaded = true;
    });

    map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      mapElement
        .querySelector('.maplibregl-ctrl-attrib')
        ?.classList.remove('maplibregl-compact-show');
    });

    return () => {
      mapRef.current = null;
      mapElement.remove();

      if (isStyleLoaded) {
        map.remove();
      } else {
        map.once('style.load', () => map.remove());
      }
    };
  }, [isThemeResolved]);

  return mapContainerRef;
}
