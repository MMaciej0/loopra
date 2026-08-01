'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import type { CreateRideInput } from '../schema';

export function StartingPointInputBanner() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <div className="bg-popover border-border absolute bottom-9 left-1/2 z-10 flex w-[calc(100%-1rem)] -translate-x-1/2 flex-col gap-2 rounded-md border p-3">
      <div className="min-w-0">
        <Field
          id="start_location_name"
          label={t('startPointNameLabel')}
          placeholder={t('startPointNamePlaceholder')}
          size="sm"
          {...register('start_location_name')}
        />
      </div>
      {errors.start_location_name ? (
        <p role="alert" className="text-destructive text-[11.5px]">
          {tErrors(errors.start_location_name.message ?? 'UNKNOWN')}
        </p>
      ) : (
        <p className="text-muted-foreground text-[11.5px]">{t('startPointNameHint')}</p>
      )}
    </div>
  );
}
