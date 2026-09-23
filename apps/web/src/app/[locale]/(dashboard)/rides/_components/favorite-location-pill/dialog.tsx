'use client';

import { MapPin } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocationModalBody } from '@/components/location-modal';
import type { LocationSuggestion } from '@/utils/geocoding';
import { saveSelectedLocation } from '../../../_actions/selected-location';

type Props = Readonly<{ storedLocation: LocationSuggestion }>;

export function FavoriteLocationPillDialog({ storedLocation }: Props) {
  const t = useTranslations('FavoriteLocation');
  const [open, setOpen] = useState(false);
  const [isApplying, startApplyTransition] = useTransition();
  const [hasApplyError, setHasApplyError] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<LocationSuggestion | null>(null);

  const canApply = Boolean(pendingLocation) && pendingLocation?.label !== storedLocation.label;

  const onOpenChange = (nextOpen: boolean) => {
    if (isApplying) return;

    setPendingLocation(null);
    setHasApplyError(false);
    setOpen(nextOpen);
  };

  const showRides = () => {
    if (!pendingLocation || !canApply || isApplying) return;

    setHasApplyError(false);
    startApplyTransition(async () => {
      const result = await saveSelectedLocation(pendingLocation);

      if (result.ok) {
        setOpen(false);
      } else {
        setHasApplyError(true);
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

        <LocationModalBody
          pendingLocation={pendingLocation}
          onPick={(location) => {
            setHasApplyError(false);
            setPendingLocation(location);
          }}
          errorMessage={hasApplyError ? t('saveError') : undefined}
        />

        <DialogFooter showCancel cancelLabel={t('cancel')}>
          <Button variant="accent" disabled={!canApply} loading={isApplying} onClick={showRides}>
            {t('showRides')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
