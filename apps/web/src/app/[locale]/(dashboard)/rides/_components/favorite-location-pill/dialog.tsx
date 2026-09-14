'use client';

import { MapPin } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { LocationSuggestion } from '@/utils/geocoding';
import { LocationPicker, SelectedLocationPreview } from '../../../_components/location-picker';
import { saveFavoriteLocation } from '../../../_actions/favorite-location';

type Props = Readonly<{ storedLocation: LocationSuggestion }>;

export function FavoriteLocationPillDialog({ storedLocation }: Props) {
  const t = useTranslations('FavoriteLocation');
  const [open, setOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [hasSaveError, setHasSaveError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(
    storedLocation,
  );
  const comboboxPortalRef = useRef<HTMLDivElement>(null);

  const onOpenChange = (nextOpen: boolean) => {
    if (isSaving) return;

    if (nextOpen) {
      setSelectedLocation(storedLocation);
      setHasSaveError(false);
    }

    setOpen(nextOpen);
  };

  const save = () => {
    if (!selectedLocation || selectedLocation.id === storedLocation.id || isSaving) return;

    setHasSaveError(false);
    startSaveTransition(async () => {
      const result = await saveFavoriteLocation(selectedLocation);

      if (result.ok) {
        setOpen(false);
      } else {
        setHasSaveError(true);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 py-0"
          aria-label={t('pill.triggerLabel', { location: storedLocation.label })}
        >
          <MapPin />
          <span aria-hidden className="max-w-48 truncate">
            {storedLocation.label}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogSubheader>{t('pill.eyebrow')}</DialogSubheader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('pill.description')}</DialogDescription>
        </DialogHeader>

        <div ref={comboboxPortalRef}>
          <div className="flex flex-col gap-3">
            <LocationPicker
              value={selectedLocation}
              onSelect={(location) => {
                setHasSaveError(false);
                setSelectedLocation(location);
              }}
              portalContainer={comboboxPortalRef}
            />

            <SelectedLocationPreview location={selectedLocation} />

            {hasSaveError && <p className="text-destructive text-xs">{t('saveError')}</p>}
          </div>
        </div>

        <DialogFooter showCancel cancelLabel={t('cancel')}>
          <Button
            variant="accent"
            disabled={!selectedLocation || selectedLocation.id === storedLocation.id}
            loading={isSaving}
            onClick={save}
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
