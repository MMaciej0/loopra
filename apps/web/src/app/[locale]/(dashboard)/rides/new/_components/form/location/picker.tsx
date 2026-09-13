'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';

import type { CreateRideInput } from '../../../schema';
import { useMap, type PickedLocation } from '@/hooks/use-map';
import { useCallback } from 'react';

export function LocationPicker() {
  const { setValue } = useFormContext<CreateRideInput>();
  const locale = useLocale();
  const t = useTranslations('CreateRide');

  const onPick = useCallback(
    (loc: PickedLocation) => {
      setValue('start_location', loc.coords, { shouldValidate: true });
      setValue('city', loc.city, { shouldValidate: true });
      setValue('country', loc.country, { shouldValidate: true });
      setValue('region', loc.region, { shouldValidate: true });
      setValue('municipality', loc.municipality, { shouldValidate: true });
      setValue('postal_code', loc.postal_code, { shouldValidate: true });
      setValue('full_address', loc.full_address, { shouldValidate: true });
    },
    [setValue],
  );
  const startLocation = useWatch<CreateRideInput, 'start_location'>({ name: 'start_location' });

  const { mapContainerRef } = useMap({
    onPick,
    initialCoords: startLocation,
    language: locale,
    searchPlaceholder: t('mapSearchPlaceholder'),
  });

  return <div ref={mapContainerRef} className="relative min-h-0 w-full flex-1 overflow-hidden" />;
}
