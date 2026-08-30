'use client';

import { RIDE_TYPES } from '@/config/ride';
import { useTranslations } from 'next-intl';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { CreateRideInput } from '../../schema';

export function RideTypeInput() {
  const t = useTranslations('CreateRide');
  const tRideTypes = useTranslations('RideTypes');

  return (
    <RadioCardGroup<CreateRideInput>
      name="ride_type"
      legend={t('rideTypeLabel')}
      options={RIDE_TYPES.map((option) => ({
        value: option,
        label: tRideTypes(`${option}.label`),
        description: tRideTypes(`${option}.description`),
      }))}
    />
  );
}