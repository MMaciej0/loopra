'use client';

import { useState, useTransition } from 'react';
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
import { LocationModalBody } from '@/components/location-modal';
import type { LocationSuggestion } from '@/utils/geocoding';
import {
  acceptDefaultSelectedLocation,
  saveSelectedLocation,
} from '../../_actions/selected-location';

export function FirstRunLocationDialog() {
  const t = useTranslations('FavoriteLocation');
  const [open, setOpen] = useState(true);
  const [isAcceptingDefault, startAcceptDefaultTransition] = useTransition();
  const [isApplying, startApplyTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<'defaultError' | 'saveError' | null>(null);
  const [pendingLocation, setPendingLocation] = useState<LocationSuggestion | null>(null);

  const acceptDefault = () => {
    if (isAcceptingDefault || isApplying) return;

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

  const showRides = () => {
    if (!pendingLocation || isApplying) return;

    setErrorKey(null);
    startApplyTransition(async () => {
      const result = await saveSelectedLocation(pendingLocation);

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

        <LocationModalBody
          pendingLocation={pendingLocation}
          onPick={(location) => {
            setErrorKey(null);
            setPendingLocation(location);
          }}
          errorMessage={errorKey ? t(errorKey) : undefined}
        />

        <DialogFooter>
          <Button variant="ghost" loading={isAcceptingDefault} onClick={acceptDefault}>
            {t('firstRun.useDefault')}
          </Button>
          <Button
            variant="accent"
            disabled={!pendingLocation}
            loading={isApplying}
            onClick={showRides}
          >
            {t('showRides')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
