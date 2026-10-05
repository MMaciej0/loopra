import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { Point, RoutePath } from '@loopra/domain';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { readCssColor } from './read-css-color';

const STREET_ZOOM = 16;
const PATH_SOURCE_ID = 'ride-path';
const PATH_LAYER_ID = 'ride-path-line';
const PATH_LINE_WIDTH_PX = 4;

type UseRideMapProps = Readonly<{
  center: Point;
  start: Point | null;
  path: RoutePath | null;
}>;

function toMapStyle(resolvedTheme: string) {
  return resolvedTheme === 'dark'
    ? maptilersdk.MapStyle.STREETS.DARK
    : maptilersdk.MapStyle.STREETS;
}

function addPath(map: maptilersdk.Map, path: RoutePath) {
  map.addSource(PATH_SOURCE_ID, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiLineString', coordinates: path },
    },
  });
  map.addLayer({
    id: PATH_LAYER_ID,
    type: 'line',
    source: PATH_SOURCE_ID,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': readCssColor('--accent'),
      'line-width': PATH_LINE_WIDTH_PX,
    },
  });
}

function createStartMarkerElement() {
  const element = document.createElement('span');
  element.className =
    'bg-accent border-background block size-5 rounded-full border-[3px] shadow-md';
  return element;
}

export function useRideMap({ center, start, path }: UseRideMapProps) {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maptilersdk.Map | null>(null);
  const isThemeResolved = resolvedTheme !== undefined;

  const readCreationOptions = useEffectEvent(() => ({
    center: [center.x, center.y] as [number, number],
    start,
    path,
    language: locale,
    theme: resolvedTheme,
  }));
  const applyTheme = useEffectEvent(() => {
    if (resolvedTheme === undefined) return;
    map?.setStyle(toMapStyle(resolvedTheme));
  });

  useEffect(() => {
    applyTheme();
  }, [resolvedTheme]);

  useEffect(() => {
    const container = containerRef.current;
    const { center, start, path, language, theme } = readCreationOptions();
    if (!container || theme === undefined) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

    const mapElement = document.createElement('div');
    mapElement.style.width = '100%';
    mapElement.style.height = '100%';
    container.appendChild(mapElement);

    const newMap = new maptilersdk.Map({
      container: mapElement,
      style: toMapStyle(theme),
      center,
      zoom: STREET_ZOOM,
      language,
      navigationControl: false,
      geolocateControl: false,
      attributionControl: { compact: true },
    });

    let isStyleLoaded = false;
    newMap.on('style.load', () => {
      isStyleLoaded = true;
      if (path) {
        addPath(newMap, path);
      }
    });

    newMap.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    if (start) {
      new maptilersdk.Marker({ element: createStartMarkerElement() })
        .setLngLat([start.x, start.y])
        .addTo(newMap);
    }

    newMap.on('load', () => {
      mapElement
        .querySelector('.maplibregl-ctrl-attrib')
        ?.classList.remove('maplibregl-compact-show');
    });

    setMap(newMap);

    return () => {
      setMap(null);
      mapElement.remove();

      if (isStyleLoaded) {
        newMap.remove();
      } else {
        newMap.once('style.load', () => newMap.remove());
      }
    };
  }, [isThemeResolved]);

  return { containerRef };
}
