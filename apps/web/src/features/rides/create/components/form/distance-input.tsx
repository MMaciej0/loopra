'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { DISTANCE_MAX_KM, DISTANCE_MIN_KM } from '@loopra/domain';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function DistanceInput() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  const route = useWatch({ control, name: 'route' });

  return (
    <Field
      id="distance_km"
      type="number"
      inputMode="decimal"
      step="0.01"
      min={DISTANCE_MIN_KM}
      max={DISTANCE_MAX_KM}
      disabled={Boolean(route)}
      label={t('distanceLabel')}
      placeholder={t('distancePlaceholder')}
      hint={route ? t('distanceHintFromRoute') : t('distanceHint')}
      size="sm"
      {...register('distance_km', {
        setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
      })}
      error={
        errors.distance_km?.message &&
        tErrors(errors.distance_km.message, { min: DISTANCE_MIN_KM, max: DISTANCE_MAX_KM })
      }
    />
  );
}
