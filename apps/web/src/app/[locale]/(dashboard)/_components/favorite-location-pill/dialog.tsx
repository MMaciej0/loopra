'use client';

import { MapPin } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
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
import { LocationPicker, SelectedLocationPreview } from '../location-picker';
import { saveFavoriteLocation } from '../../_actions/favorite-location';

type Props = Readonly<{ storedLocation: LocationSuggestion }>;

export function FavoriteLocationPillDialog({ storedLocation }: Props) {
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
          size="sm"
          className="rounded-full max-sm:size-9 max-sm:p-0"
          aria-label={`${storedLocation.label} — change your favourite location`}
        >
          <MapPin />
          <span aria-hidden className="hidden max-w-48 truncate sm:inline">
            {storedLocation.label}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogSubheader>Favourite location</DialogSubheader>
          <DialogTitle>Where do you usually ride?</DialogTitle>
          <DialogDescription>
            Loopra looks for rides and cyclists near this place.
          </DialogDescription>
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

            {hasSaveError && (
              <p className="text-destructive text-xs">Could not save your location. Try again.</p>
            )}
          </div>
        </div>

        <DialogFooter showCancel>
          <Button
            variant="accent"
            disabled={!selectedLocation || selectedLocation.id === storedLocation.id}
            loading={isSaving}
            onClick={save}
          >
            Save location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
