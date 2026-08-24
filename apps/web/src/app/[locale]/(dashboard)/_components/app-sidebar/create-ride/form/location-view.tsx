'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LocationPicker } from './location/picker';
import { type CreateRideInput } from '../schema';

export function LocationView({ onClose }: { onClose: () => void }) {
  const t = useTranslations('CreateRide');
  const { control, trigger, getValues, resetField } = useFormContext<CreateRideInput>();

  const startLocation = useWatch({ control, name: 'start_location' });
  const startLocationName = useWatch({ control, name: 'start_location_name' });

  const canUseStartPoint = Boolean(startLocation) && Boolean(startLocationName?.trim());

  const onUseStartPoint = async () => {
    const valid = await trigger('start_location_name');
    if (valid) onClose();
  };

  const onBack = () => {
    if (!getValues('start_location_name')?.trim()) {
      resetField('start_location');
      resetField('city');
      resetField('country');
      resetField('region');
      resetField('municipality');
      resetField('postal_code');
      resetField('full_address');
    }
    onClose();
  };

  return (
    <>
      <DialogHeader className="shrink-0 p-4 md:px-7.5 md:pt-5.5">
        <DialogSubheader>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center gap-x-2"
          >
            <ArrowLeft aria-hidden size={12} /> {t('backToDetails')}
          </button>
        </DialogSubheader>
        <DialogTitle>{t('locationTitle')}</DialogTitle>
        <DialogDescription className="sr-only">{t('description')}</DialogDescription>
      </DialogHeader>
      <Separator className="shrink-0" />
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:px-7.5 md:pt-5.5">
        <LocationPicker />
      </div>
      <DialogFooter className="mx-0 mb-0 shrink-0 md:px-7.5">
        <Button type="button" variant="ghost" onClick={onBack}>
          {t('back')}
        </Button>
        <Button
          type="button"
          variant="accent"
          onClick={onUseStartPoint}
          disabled={!canUseStartPoint}
        >
          {t('useStartPoint')}
          <ArrowRight />
        </Button>
      </DialogFooter>
    </>
  );
}
