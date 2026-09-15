import { useEffect, useEffectEvent, useRef, type RefObject } from 'react';
import { useTheme } from 'next-themes';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { nearbyCircle, nearbyConstraints } from './nearby-area';
import type { StartPointGroup } from './start-points';

const CITY_ZOOM = 16;
const NEARBY_AREA_ID = 'nearby-area';
const NEARBY_AREA_COLOR = '#6d8ff2';
const MARKER_CLEARANCE_PX = 24;
const SHOW_ALL_PADDING_PX = 64;

export type RidesMapMarker = StartPointGroup & Readonly<{ label: string }>;

type UseRidesMapProps = Readonly<{
  lng: number;
  lat: number;
  radiusKm: number;
  language: string;
  markers: readonly RidesMapMarker[];
  selectedId: string | null;
  panelRef: RefObject<HTMLElement | null>;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onMarkersInViewChange: (hasMarkerInView: boolean) => void;
}>;

function toMapStyle(resolvedTheme: string) {
  return resolvedTheme === 'dark'
    ? maptilersdk.MapStyle.STREETS.DARK
    : maptilersdk.MapStyle.STREETS;
}

function addNearbyArea(map: maptilersdk.Map, center: [number, number], radiusKm: number) {
  if (map.getSource(NEARBY_AREA_ID)) return;

  map.addSource(NEARBY_AREA_ID, { type: 'geojson', data: nearbyCircle(center, radiusKm) });
  map.addLayer({
    id: `${NEARBY_AREA_ID}-fill`,
    type: 'fill',
    source: NEARBY_AREA_ID,
    paint: { 'fill-color': NEARBY_AREA_COLOR, 'fill-opacity': 0.06 },
  });
  map.addLayer({
    id: `${NEARBY_AREA_ID}-outline`,
    type: 'line',
    source: NEARBY_AREA_ID,
    paint: { 'line-color': NEARBY_AREA_COLOR, 'line-opacity': 0.5, 'line-width': 1.5 },
  });
}

function constrainToNearbyArea(map: maptilersdk.Map, center: [number, number], radiusKm: number) {
  const { clientWidth: width, clientHeight: height } = map.getContainer();
  if (width === 0 || height === 0) return;

  const { minZoom, maxBounds } = nearbyConstraints(center, radiusKm, { width, height });
  map.setMaxBounds(null);
  map.setMinZoom(minZoom);
  map.setMaxBounds(maxBounds);
}

function revealMarker(map: maptilersdk.Map, marker: RidesMapMarker, panel: HTMLElement) {
  const container = map.getContainer().getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const point = map.project([marker.lng, marker.lat]);

  const isCovered =
    point.x > panelRect.left - container.left - MARKER_CLEARANCE_PX &&
    point.x < panelRect.right - container.left + MARKER_CLEARANCE_PX &&
    point.y > panelRect.top - container.top - MARKER_CLEARANCE_PX &&
    point.y < panelRect.bottom - container.top + MARKER_CLEARANCE_PX;

  if (!isCovered) return;

  const isBottomSheet = panelRect.width >= container.width - 1;
  const offset: [number, number] = isBottomSheet
    ? [0, -(container.bottom - panelRect.top) / 2]
    : [(panelRect.right - container.left) / 2, 0];

  map.easeTo({ center: [marker.lng, marker.lat], offset });
}

function hasMarkerInView(map: maptilersdk.Map, markers: readonly RidesMapMarker[]) {
  const bounds = map.getBounds();
  return markers.some(({ lng, lat }) => bounds.contains([lng, lat]));
}

function setMarkerSelected(element: HTMLElement, isSelected: boolean) {
  element.setAttribute('aria-pressed', String(isSelected));
  element.style.zIndex = isSelected ? '1' : '';
}

function createMarkerElement({ rides, label }: RidesMapMarker) {
  const rideCount = rides.length;
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-pressed', 'false');
  button.className =
    'group focus-visible:ring-ring/50 grid size-8 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-3';

  const pin = document.createElement('span');
  pin.className =
    'bg-accent border-background group-aria-pressed:bg-foreground relative grid size-8 place-items-center rounded-full border-2 shadow-md transition-[scale,background-color] group-aria-pressed:scale-125';
  button.appendChild(pin);

  const dot = document.createElement('span');
  dot.className = 'bg-accent-foreground group-aria-pressed:bg-accent size-2.5 rounded-full';
  pin.appendChild(dot);

  if (rideCount > 1) {
    const badge = document.createElement('span');
    badge.setAttribute('aria-hidden', 'true');
    badge.className =
      'bg-foreground text-background absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-semibold';
    badge.textContent = String(rideCount);
    pin.appendChild(badge);
  }

  return button;
}

export function useRidesMap({
  lng,
  lat,
  radiusKm,
  language,
  markers,
  selectedId,
  panelRef,
  onSelect,
  onDeselect,
  onMarkersInViewChange,
}: UseRidesMapProps) {
  const { resolvedTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const markerElementsRef = useRef(new Map<string, HTMLElement>());
  const centerRef = useRef<[number, number]>([lng, lat]);
  const radiusRef = useRef(radiusKm);
  const languageRef = useRef(language);
  const themeRef = useRef(resolvedTheme);
  const isThemeResolved = resolvedTheme !== undefined;

  useEffect(() => {
    centerRef.current = [lng, lat];
    radiusRef.current = radiusKm;
    languageRef.current = language;
    themeRef.current = resolvedTheme;
  });

  const selectMarker = useEffectEvent((id: string) => onSelect(id));
  const deselectMarker = useEffectEvent(() => onDeselect());
  const reportMarkersInView = useEffectEvent(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    onMarkersInViewChange(hasMarkerInView(map, markers));
  });
  const revealSelectedMarker = useEffectEvent(() => {
    const map = mapRef.current;
    const panel = panelRef.current;
    const marker = markers.find(({ id }) => id === selectedId);
    if (!map || !panel || !marker) return;

    revealMarker(map, marker, panel);
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

    const center = centerRef.current;
    const radius = radiusRef.current;
    constrainToNearbyArea(map, center, radius);
    map.on('resize', () => constrainToNearbyArea(map, center, radius));

    let isStyleLoaded = false;
    map.on('style.load', () => {
      isStyleLoaded = true;
      addNearbyArea(map, center, radius);
    });

    map.addControl(new maptilersdk.NavigationControl({ showCompass: false }), 'top-right');

    map.on('move', () => reportMarkersInView());

    map.on('click', (event) => {
      const target = event.originalEvent.target;
      if (target instanceof Element && target.closest('.maplibregl-marker')) return;
      deselectMarker();
    });

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

    const markerElements = markerElementsRef.current;
    const mapMarkers = markers.map((marker) => {
      const element = createMarkerElement(marker);
      element.addEventListener('click', () => selectMarker(marker.id));
      markerElements.set(marker.id, element);

      return new maptilersdk.Marker({ element }).setLngLat([marker.lng, marker.lat]).addTo(map);
    });
    reportMarkersInView();

    return () => {
      for (const mapMarker of mapMarkers) {
        mapMarker.remove();
      }
      markerElements.clear();
    };
  }, [markers, isThemeResolved]);

  useEffect(() => {
    for (const [id, element] of markerElementsRef.current) {
      setMarkerSelected(element, id === selectedId);
    }
  }, [selectedId, markers, isThemeResolved]);

  useEffect(() => {
    revealSelectedMarker();
  }, [selectedId]);

  const showAllMarkers = () => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    const bounds = new maptilersdk.LngLatBounds();
    for (const { lng, lat } of markers) {
      bounds.extend([lng, lat]);
    }
    map.fitBounds(bounds, { padding: SHOW_ALL_PADDING_PX, maxZoom: CITY_ZOOM });
  };

  return { mapContainerRef, showAllMarkers };
}
