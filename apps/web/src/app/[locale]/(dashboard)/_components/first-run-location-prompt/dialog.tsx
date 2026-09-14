'use client';

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
} from '@/components/ui/dialog';
import type { LocationSuggestion } from '@/utils/geocoding';
import { LocationPicker, SelectedLocationPreview } from '../location-picker';
import {
  acceptDefaultFavoriteLocation,
  saveFavoriteLocation,
} from '../../_actions/favorite-location';

export function FirstRunLocationDialog() {
  const [open, setOpen] = useState(true);
  const [isAcceptingDefault, startAcceptDefaultTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [hasSaveError, setHasSaveError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const comboboxPortalRef = useRef<HTMLDivElement>(null);

  const acceptDefault = () => {
    if (isAcceptingDefault || isSaving) return;

    startAcceptDefaultTransition(async () => {
      const result = await acceptDefaultFavoriteLocation();
      if (result.ok) setOpen(false);
    });
  };

  const save = () => {
    if (!selectedLocation || isSaving) return;

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
    <Dialog open={open}>
      <DialogContent
        className="gap-5 p-5 sm:max-w-md"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="gap-2">
          <DialogSubheader>Make Loopra yours</DialogSubheader>
          <DialogTitle>Where do you usually ride?</DialogTitle>
          <DialogDescription>
            Until you pick your own, Loopra uses Kraków city centre to find rides and cyclists near
            you.
          </DialogDescription>
        </DialogHeader>

        <div ref={comboboxPortalRef} className="space-y-3">
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

        <DialogFooter>
          <Button variant="ghost" loading={isAcceptingDefault} onClick={acceptDefault}>
            Use default location
          </Button>
          <Button variant="accent" disabled={!selectedLocation} loading={isSaving} onClick={save}>
            Save location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
