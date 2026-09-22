'use client';

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
} from '@/components/ui/dialog';
import type { LocationSuggestion } from '@/utils/geocoding';
import { LocationPicker, SelectedLocationPreview } from '../location-picker';
import {
  acceptDefaultSelectedLocation,
  saveSelectedLocation,
} from '../../_actions/selected-location';

export function FirstRunLocationDialog() {
  const t = useTranslations('FavoriteLocation');
  const [open, setOpen] = useState(true);
  const [isAcceptingDefault, startAcceptDefaultTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<'defaultError' | 'saveError' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const comboboxPortalRef = useRef<HTMLDivElement>(null);

  const acceptDefault = () => {
    if (isAcceptingDefault || isSaving) return;

    setErrorKey(null);
    startAcceptDefaultTransition(async () => {
      const result = await acceptDefaultSelectedLocation();

      if (result.ok) {
        setOpen(false);
      } else {
        setErrorKey('defaultError');
      }
    });
  };

  const save = () => {
    if (!selectedLocation || isSaving) return;

    setErrorKey(null);
    startSaveTransition(async () => {
      const result = await saveSelectedLocation(selectedLocation);

      if (result.ok) {
        setOpen(false);
      } else {
        setErrorKey('saveError');
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
          <DialogSubheader>{t('firstRun.eyebrow')}</DialogSubheader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('firstRun.description')}</DialogDescription>
        </DialogHeader>

        <div ref={comboboxPortalRef}>
          <div className="flex flex-col gap-3">
            <LocationPicker
              value={selectedLocation}
              onSelect={(location) => {
                setErrorKey(null);
                setSelectedLocation(location);
              }}
              portalContainer={comboboxPortalRef}
            />

            <SelectedLocationPreview location={selectedLocation} />

            {errorKey && <p className="text-destructive text-xs">{t(errorKey)}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" loading={isAcceptingDefault} onClick={acceptDefault}>
            {t('firstRun.useDefault')}
          </Button>
          <Button variant="accent" disabled={!selectedLocation} loading={isSaving} onClick={save}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
