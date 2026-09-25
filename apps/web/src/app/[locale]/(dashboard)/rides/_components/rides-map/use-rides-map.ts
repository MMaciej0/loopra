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
import { searchAreaConstraints, searchAreaPolygon } from './search-area';
import type { StartPointGroup } from './start-points';

const CITY_ZOOM = 16;
const SEARCH_AREA_ID = 'search-area';
const SEARCH_AREA_COLOR = '#6d8ff2';
const SHOW_ALL_PADDING_PX = 64;

type UseRidesMapProps = Readonly<{
  center: Point;
  searchArea: BBox;
  startPoints: readonly StartPointGroup[];
}>;

function toMapStyle(resolvedTheme: string) {
  return resolvedTheme === 'dark'
    ? maptilersdk.MapStyle.STREETS.DARK
    : maptilersdk.MapStyle.STREETS;
}

function addSearchArea(map: maptilersdk.Map, searchArea: BBox) {
  if (map.getSource(SEARCH_AREA_ID)) return;

  map.addSource(SEARCH_AREA_ID, { type: 'geojson', data: searchAreaPolygon(searchArea) });
  map.addLayer({
    id: `${SEARCH_AREA_ID}-fill`,
    type: 'fill',
    source: SEARCH_AREA_ID,
    paint: { 'fill-color': SEARCH_AREA_COLOR, 'fill-opacity': 0.06 },
  });
  map.addLayer({
    id: `${SEARCH_AREA_ID}-outline`,
    type: 'line',
    source: SEARCH_AREA_ID,
    paint: { 'line-color': SEARCH_AREA_COLOR, 'line-opacity': 0.5, 'line-width': 1.5 },
  });
}

function constrainToSearchArea(map: maptilersdk.Map, searchArea: BBox) {
  const { clientWidth: width, clientHeight: height } = map.getContainer();
  if (width === 0 || height === 0) return;

  const { minZoom, maxBounds } = searchAreaConstraints(searchArea, { width, height });
  map.setMaxBounds(null);
  map.setMinZoom(minZoom);
  map.setMaxBounds(maxBounds);
}

export function useRidesMap({ center, searchArea, startPoints }: UseRidesMapProps) {
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
    searchArea,
    language: locale,
    theme: resolvedTheme,
  }));
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
    const { center, searchArea, language, theme } = readCreationOptions();
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

    constrainToSearchArea(newMap, searchArea);
    newMap.on('resize', () => constrainToSearchArea(newMap, searchArea));

    let isStyleLoaded = false;
    newMap.on('style.load', () => {
      isStyleLoaded = true;
      addSearchArea(newMap, searchArea);
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
