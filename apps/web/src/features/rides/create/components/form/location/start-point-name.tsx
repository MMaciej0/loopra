'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { LOCATION_NAME_MAX_LENGTH } from '@loopra/domain';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function StartPointName() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <div className="flex flex-col gap-y-1.5">
      <Field
        id="start_location_name"
        label={t('startPointNameLabel')}
        placeholder={t('startPointNamePlaceholder')}
        size="sm"
        maxLength={LOCATION_NAME_MAX_LENGTH}
        className="font-semibold"
        {...register('start_location_name')}
      />
      {errors.start_location_name ? (
        <p role="alert" className="text-destructive text-[11.5px]">
          {tErrors(errors.start_location_name.message ?? 'UNKNOWN')}
        </p>
      ) : (
        <p className="text-muted-foreground text-[11px]">{t('startPointNameHint')}</p>
      )}
    </div>
  );
}
