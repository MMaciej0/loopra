import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { BBox, Point } from '@loopra/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { anyInView, boundsOf, revealOffset } from './map-geometry';
import { createMarkerElement, setMarkerSelected } from './marker-element';
import { searchAreaMinZoom, viewSearchArea } from './search-area';
import type { StartPointGroup } from './start-points';

const CITY_ZOOM = 16;
const SHOW_ALL_PADDING_PX = 64;
const RELOAD_DELAY_MS = 300;

type UseRidesMapProps = Readonly<{
  center: Point;
  startPoints: readonly StartPointGroup[];
  onSearchAreaChange: (searchArea: BBox) => void;
}>;

function toMapStyle(resolvedTheme: string) {
  return resolvedTheme === 'dark'
    ? maptilersdk.MapStyle.STREETS.DARK
    : maptilersdk.MapStyle.STREETS;
}

function applySearchAreaMinZoom(map: maptilersdk.Map) {
  const minZoom = searchAreaMinZoom(map);
  if (minZoom !== null) {
    map.setMinZoom(minZoom);
  }
}

export function useRidesMap({ center, startPoints, onSearchAreaChange }: UseRidesMapProps) {
  const t = useTranslations('RidesPage');
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const markerElementsRef = useRef(new Map<string, HTMLElement>());
  const [map, setMap] = useState<maptilersdk.Map | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isThemeResolved = resolvedTheme !== undefined;
  const selected = startPoints.find(({ id }) => id === selectedId) ?? null;

  if (selectedId !== null && selected === null) {
    setSelectedId(null);
  }

  const subscribeToMove = useCallback(
    (onMove: () => void) => {
      map?.on('move', onMove);
      return () => {
        map?.off('move', onMove);
      };
    },
    [map],
  );
  const hasStartPointInView = useSyncExternalStore(
    subscribeToMove,
    () => (map ? anyInView(map.getBounds().toArray(), startPoints) : null),
    () => null,
  );

  const readCreationOptions = useEffectEvent(() => ({
    center: [center.x, center.y] as [number, number],
    language: locale,
    theme: resolvedTheme,
  }));
  const reportSearchArea = useEffectEvent((searchArea: BBox) => onSearchAreaChange(searchArea));
  const applyTheme = useEffectEvent(() => {
    if (resolvedTheme === undefined) return;
    map?.setStyle(toMapStyle(resolvedTheme));
  });
  const revealSelected = useEffectEvent(() => {
    const panel = panelRef.current;
    if (!map || !panel || !selected) return;

    const offset = revealOffset(
      map.project([selected.lng, selected.lat]),
      panel.getBoundingClientRect(),
      map.getContainer().getBoundingClientRect(),
    );
    if (offset) {
      map.easeTo({ center: [selected.lng, selected.lat], offset });
    }
  });

  useEffect(() => {
    applyTheme();
  }, [resolvedTheme]);

  useEffect(() => {
    const container = containerRef.current;
    const { center, language, theme } = readCreationOptions();
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
      zoom: CITY_ZOOM,
      language,
      navigationControl: false,
      geolocateControl: false,
      attributionControl: { compact: true },
    });

    applySearchAreaMinZoom(newMap);
    newMap.on('resize', () => applySearchAreaMinZoom(newMap));

    let reloadTimeout: ReturnType<typeof setTimeout> | undefined;
    newMap.on('moveend', () => {
      applySearchAreaMinZoom(newMap);
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(() => reportSearchArea(viewSearchArea(newMap)), RELOAD_DELAY_MS);
    });

    let isStyleLoaded = false;
    newMap.on('style.load', () => {
      isStyleLoaded = true;
    });

    newMap.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    newMap.on('click', (event) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('.maplibregl-marker')) return;
      setSelectedId(null);
    });

    newMap.on('load', () => {
      mapElement
        .querySelector('.maplibregl-ctrl-attrib')
        ?.classList.remove('maplibregl-compact-show');
    });

    setMap(newMap);

    return () => {
      clearTimeout(reloadTimeout);
      setMap(null);
      mapElement.remove();

      if (isStyleLoaded) {
        newMap.remove();
      } else {
        newMap.once('style.load', () => newMap.remove());
      }
    };
  }, [isThemeResolved]);

  useEffect(() => {
    if (!map) return;

    const markerElements = markerElementsRef.current;
    const mapMarkers = startPoints.map((group) => {
      const label = group.name
        ? t('mapMarkerLabel', { count: group.rides.length, name: group.name })
        : t('mapMarkerLabelUnnamed', { count: group.rides.length });
      const element = createMarkerElement(group, label);
      element.addEventListener('click', () => setSelectedId(group.id));
      markerElements.set(group.id, element);

      return new maptilersdk.Marker({ element }).setLngLat([group.lng, group.lat]).addTo(map);
    });

    return () => {
      for (const mapMarker of mapMarkers) {
        mapMarker.remove();
      }
      markerElements.clear();
    };
  }, [map, startPoints, t]);

  useEffect(() => {
    for (const [id, element] of markerElementsRef.current) {
      setMarkerSelected(element, id === selectedId);
    }
  }, [map, startPoints, t, selectedId]);

  useEffect(() => {
    revealSelected();
  }, [selectedId]);

  const showAll = () => {
    if (!map || startPoints.length === 0) return;
    map.fitBounds(boundsOf(startPoints), { padding: SHOW_ALL_PADDING_PX, maxZoom: CITY_ZOOM });
  };

  return {
    containerRef,
    panelRef,
    selected,
    clearSelection: () => setSelectedId(null),
    hasStartPointInView,
    showAll,
  };
}
