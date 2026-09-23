'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';
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
import { LocationModalBody, useLocationModal } from '@/components/location-modal';
import type { LocationSuggestion } from '@/utils/geocoding';

type Props = Readonly<{
  storedLocation: LocationSuggestion;
  favorites: LocationSuggestion[];
}>;

export function FavoriteLocationPillDialog({ storedLocation, favorites }: Props) {
  const t = useTranslations('FavoriteLocation');
  const [open, setOpen] = useState(false);
  const modal = useLocationModal({
    favorites,
    selected: storedLocation,
    onApplied: () => setOpen(false),
  });

  const onOpenChange = (nextOpen: boolean) => {
    if (modal.isApplying) return;

    modal.reset();
    setOpen(nextOpen);
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
          <span aria-hidden className="max-w-48 truncate md:max-w-none">
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

        <LocationModalBody modal={modal} />

        <DialogFooter showCancel cancelLabel={t('cancel')}>
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
