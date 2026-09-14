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
} from '@/components/ui/dialog';
import type { LocationSuggestion } from '@/utils/geocoding';
import { LocationPicker } from '../location-picker';
import { acceptDefaultFavoriteLocation, saveFavoriteLocation } from './actions';

export function FavoriteLocationDialog() {
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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && acceptDefault()}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogSubheader>Make Loopra yours</DialogSubheader>
          <DialogTitle>Where do you usually ride?</DialogTitle>
          <DialogDescription>
            Set a favourite location to find rides and cyclists near you.
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

          <div className="border-border bg-muted/40 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center">
            <span className="bg-secondary text-accent flex size-10 items-center justify-center rounded-full">
              <MapPin className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">
              {selectedLocation?.label ?? 'Choose a location'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {selectedLocation
                ? `${selectedLocation.city || selectedLocation.municipality}, ${selectedLocation.country}`
                : 'Search for a place to use as your favourite location.'}
            </p>
          </div>

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
