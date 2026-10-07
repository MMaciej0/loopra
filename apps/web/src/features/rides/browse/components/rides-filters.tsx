'use client';

import { BIKE_TYPES, RIDE_TYPES } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  RIDES_WHEN,
  ridesHref,
  withRidesFilter,
  type RidesFilterKey,
  type RidesFilters,
} from '@/features/rides/browse/filters';
import type { RidesView } from '@/features/rides/browse/view';

const ALL = 'all';

type Option<Value extends string> = Readonly<{ value: Value; label: string }>;

type FilterSelectProps<Key extends RidesFilterKey> = Readonly<{
  label: string;
  allLabel: string;
  options: readonly Option<NonNullable<RidesFilters[Key]>>[];
  value: RidesFilters[Key];
  onChange: (value: RidesFilters[Key]) => void;
}>;

function FilterSelect<Key extends RidesFilterKey>({
  label,
  allLabel,
  options,
  value,
  onChange,
}: FilterSelectProps<Key>) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(options.find((option) => option.value === next)?.value)}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          'min-w-0 data-[size=default]:h-10',
          value && 'border-accent bg-accent/10 text-foreground dark:bg-accent/10',
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type Props = Readonly<{ view: RidesView; filters: RidesFilters }>;

export function RidesFilters({ view, filters }: Props) {
  const t = useTranslations('RidesPage');
  const tBikeTypes = useTranslations('BikeTypes');
  const tRideTypes = useTranslations('RideTypes');
  const router = useRouter();

  const setFilter = <Key extends RidesFilterKey>(key: Key, value: RidesFilters[Key]) => {
    router.replace(ridesHref(view, withRidesFilter(filters, key, value)));
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <FilterSelect<'when'>
        label={t('filterWhenLabel')}
        allLabel={t('filterWhenAll')}
        options={RIDES_WHEN.map((when) => ({ value: when, label: t(`filterWhen.${when}`) }))}
        value={filters.when}
        onChange={(value) => setFilter('when', value)}
      />
      <FilterSelect<'bike_type'>
        label={t('filterBikeTypeLabel')}
        allLabel={t('filterBikeTypeAll')}
        options={BIKE_TYPES.map((bikeType) => ({
          value: bikeType,
          label: bikeType === 'any' ? t('filterBikeTypeAny') : tBikeTypes(bikeType),
        }))}
        value={filters.bike_type}
        onChange={(value) => setFilter('bike_type', value)}
      />
      <FilterSelect<'ride_type'>
        label={t('filterRideTypeLabel')}
        allLabel={t('filterRideTypeAll')}
        options={RIDE_TYPES.map((rideType) => ({
          value: rideType,
          label: tRideTypes(`${rideType}.label`),
        }))}
        value={filters.ride_type}
        onChange={(value) => setFilter('ride_type', value)}
      />
    </div>
  );
}
