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
import { LocationModalBody } from '@/features/locations/components/location-modal/location-modal-body';
import { useLocationModal } from '@/features/locations/components/location-modal/use-location-modal';
import type { LocationSuggestion } from '@/features/locations/geocoding';
import { acceptDefaultSelectedLocation } from '@/features/locations/actions/selected-location';

type Props = Readonly<{ favorites: LocationSuggestion[] }>;

export function FirstRunLocationDialog({ favorites }: Props) {
  const t = useTranslations('FavoriteLocation');
  const [open, setOpen] = useState(true);
  const [isAcceptingDefault, startAcceptDefaultTransition] = useTransition();
  const modal = useLocationModal({
    favorites,
    selected: null,
    onApplied: () => setOpen(false),
  });

  const acceptDefault = () => {
    if (isAcceptingDefault || modal.isApplying) return;

    modal.setErrorKey(null);
    startAcceptDefaultTransition(async () => {
      const result = await acceptDefaultSelectedLocation();

      if (result.ok) {
        setOpen(false);
      } else {
        modal.setErrorKey('firstRun.defaultError');
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

        <LocationModalBody modal={modal} />

        <DialogFooter>
          <Button variant="ghost" loading={isAcceptingDefault} onClick={acceptDefault}>
            {t('firstRun.useDefault')}
          </Button>
          <Button
            variant="accent"
            disabled={!modal.canApply}
            loading={modal.isApplying}
            onClick={modal.showRides}
          >
            {t('showRides')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
