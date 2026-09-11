'use client';

import { BIKE_TYPES } from '@/config/ride';
import { buttonVariants } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { CreateRideInput } from '../../schema';
import { cn } from '@/lib/utils';

export function BikeTypeInput() {
  const t = useTranslations('CreateRide');
  const tBikeTypes = useTranslations('BikeTypes');
  const { register } = useFormContext<CreateRideInput>();

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="text-muted-foreground p-0 font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase">
        {t('bikeTypeLabel')}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {BIKE_TYPES.map((option) => (
          <label key={option}>
            <input
              type="radio"
              value={option}
              {...register('bike_type')}
              className="peer sr-only"
            />
            <span className={cn(buttonVariants({ variant: 'chip', size: 'sm' }))}>
              {tBikeTypes(option)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}