import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import type { StartPointGroup } from './start-points';

const CITY_ZOOM = 16;

export type RidesMapMarker = StartPointGroup & Readonly<{ label: string }>;

type UseRidesMapProps = Readonly<{
  lng: number;
  lat: number;
  language: string;
  markers: readonly RidesMapMarker[];
}>;

function toMapStyle(resolvedTheme: string) {
  return resolvedTheme === 'dark'
    ? maptilersdk.MapStyle.STREETS.DARK
    : maptilersdk.MapStyle.STREETS;
}

function createMarkerElement({ rideCount, label }: RidesMapMarker) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.className =
    'bg-accent border-background focus-visible:ring-ring/50 grid size-8 cursor-pointer place-items-center rounded-full border-2 shadow-md outline-none focus-visible:ring-3';

  const dot = document.createElement('span');
  dot.className = 'bg-accent-foreground size-2.5 rounded-full';
  button.appendChild(dot);

  if (rideCount > 1) {
    const badge = document.createElement('span');
    badge.setAttribute('aria-hidden', 'true');
    badge.className =
      'bg-foreground text-background absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-semibold';
    badge.textContent = String(rideCount);
    button.appendChild(badge);
  }

  return button;
}

export function useRidesMap({ lng, lat, language, markers }: UseRidesMapProps) {
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const mapMarkers = markers.map((marker) =>
      new maptilersdk.Marker({ element: createMarkerElement(marker) })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map),
    );

    return () => {
      for (const mapMarker of mapMarkers) {
        mapMarker.remove();
      }
    };
  }, [markers, isThemeResolved]);

  return mapContainerRef;
}
