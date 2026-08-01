import { BIKE_TYPES } from '@/config/ride';
import { Button } from '@/components/ui/button';
import { useFormContext, useWatch } from 'react-hook-form';
import { useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { CreateRideInput } from './schema';
import { useRadioGroupKeyNavigation } from '@/hooks/use-key-navigation';

const BIKE_TYPE_OPTIONS = ['all', ...BIKE_TYPES] as const;
type BikeTypeOption = (typeof BIKE_TYPE_OPTIONS)[number];

export function BikeTypeInput() {
  const t = useTranslations('CreateRide');
  const tBikeTypes = useTranslations('CreateRide.bikeTypes');
  const { control, setValue } = useFormContext<CreateRideInput>();
  const groupRef = useRef<HTMLDivElement>(null);

  const bike_type = useWatch({ control, name: 'bike_type' });
  const selectedIndex = Math.max(0, BIKE_TYPE_OPTIONS.indexOf(bike_type));

  const select = useCallback(
    (bikeType: BikeTypeOption) => {
      setValue('bike_type', bikeType, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const { onKeyDown } = useRadioGroupKeyNavigation(groupRef, BIKE_TYPE_OPTIONS, select);

  return (
    <div>
      <span
        id="bike-type-label"
        className="text-muted-foreground font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase"
      >
        {t('bikeTypeLabel')}
      </span>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby="bike-type-label"
        className="mt-2 flex flex-wrap gap-2"
      >
        {BIKE_TYPE_OPTIONS.map((option, index) => (
          <Button
            type="button"
            key={option}
            variant="chip"
            size="sm"
            role="radio"
            aria-checked={option === bike_type}
            tabIndex={index === selectedIndex ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => select(option)}
          >
            {tBikeTypes(option)}
          </Button>
        ))}
      </div>
    </div>
  );
}
