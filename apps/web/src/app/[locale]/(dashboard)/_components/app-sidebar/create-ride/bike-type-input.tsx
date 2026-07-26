import { BIKE_TYPES, BIKE_TYPE_LABELS } from '@/config/ride';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useCallback, useRef, type KeyboardEvent } from 'react';
import { CreateRideInput } from './schema';

const BIKE_TYPE_OPTIONS = ['all', ...BIKE_TYPES] as const;
type BikeTypeOption = (typeof BIKE_TYPE_OPTIONS)[number];

export function BikeTypeInput() {
  const { watch, setValue } = useFormContext<CreateRideInput>();
  const groupRef = useRef<HTMLDivElement>(null);

  const bike_type = watch('bike_type');
  const selectedIndex = Math.max(0, BIKE_TYPE_OPTIONS.indexOf(bike_type));

  const select = useCallback(
    (bikeType: BikeTypeOption) => {
      setValue('bike_type', bikeType, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const focusRadio = useCallback((index: number) => {
    const radios = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = BIKE_TYPE_OPTIONS.length - 1;
      let next: number;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = index === last ? 0 : index + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = index === 0 ? last : index - 1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = last;
          break;
        default:
          return;
      }

      event.preventDefault();
      select(BIKE_TYPE_OPTIONS[next]);
      focusRadio(next);
    },
    [select, focusRadio],
  );

  return (
    <div>
      <span
        id="bike-type-label"
        className="text-muted-foreground font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase"
      >
        Bike type
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
            {BIKE_TYPE_LABELS[option]}
          </Button>
        ))}
      </div>
    </div>
  );
}
