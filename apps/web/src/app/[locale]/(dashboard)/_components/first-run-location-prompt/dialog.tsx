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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const comboboxPortalRef = useRef<HTMLDivElement>(null);

  const acceptDefault = () => {
    if (isAcceptingDefault || isSaving) return;

    setErrorMessage(null);
    startAcceptDefaultTransition(async () => {
      const result = await acceptDefaultFavoriteLocation();

      if (result.ok) {
        setOpen(false);
      } else {
        setErrorMessage('Could not use the default location. Try again.');
      }
    });
  };

  const save = () => {
    if (!selectedLocation || isSaving) return;

    setErrorMessage(null);
    startSaveTransition(async () => {
      const result = await saveFavoriteLocation(selectedLocation);

      if (result.ok) {
        setOpen(false);
      } else {
        setErrorMessage('Could not save your location. Try again.');
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
            Pick the area you ride in — roughly is fine, no address needed. Loopra centres your map
            there and finds rides and riders near you. Skip it and you&apos;ll start in Nowa Huta,
            Kraków, Poland — where Loopra was born.
          </DialogDescription>
        </DialogHeader>

        <div ref={comboboxPortalRef}>
          <div className="flex flex-col gap-3">
            <LocationPicker
              value={selectedLocation}
              onSelect={(location) => {
                setErrorMessage(null);
                setSelectedLocation(location);
              }}
              portalContainer={comboboxPortalRef}
            />

            <SelectedLocationPreview location={selectedLocation} />

            {errorMessage && <p className="text-destructive text-xs">{errorMessage}</p>}
          </div>
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
