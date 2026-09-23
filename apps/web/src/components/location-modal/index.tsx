'use client';

import { MapPin } from 'lucide-react';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { LocationSuggestion } from '@/utils/geocoding';
import { LocationPicker } from './picker';

type Props = Readonly<{
  pendingLocation: LocationSuggestion | null;
  onPick: (location: LocationSuggestion | null) => void;
  errorMessage?: string;
}>;

export function LocationModalBody({ pendingLocation, onPick, errorMessage }: Props) {
  const comboboxPortalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={comboboxPortalRef}>
      <div className="flex flex-col gap-3">
        <LocationPicker
          value={pendingLocation}
          onSelect={onPick}
          portalContainer={comboboxPortalRef}
        />

        {pendingLocation && <PickedLocationRow location={pendingLocation} />}

        {errorMessage && <p className="text-destructive text-xs">{errorMessage}</p>}
      </div>
    </div>
  );
}

function PickedLocationRow({ location }: { location: LocationSuggestion }) {
  const t = useTranslations('FavoriteLocation');

  return (
    <div className="bg-card border-border flex items-center gap-3 rounded-xl border px-3 py-2.5">
      <span className="bg-secondary text-accent flex size-9 shrink-0 items-center justify-center rounded-full">
        <MapPin className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="type-label text-muted-foreground block">{t('picker.pickedLabel')}</span>
        <span className="block truncate font-medium">{location.label}</span>
      </span>
    </div>
  );
}
