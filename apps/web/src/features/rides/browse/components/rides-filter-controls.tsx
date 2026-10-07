'use client';

import { BIKE_TYPES, RIDE_TYPES } from '@loopra/domain';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
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
  activeRidesFilterCount,
  ridesHref,
  withRidesFilter,
  type RidesFilterKey,
  type RidesFilters,
} from '@/features/rides/browse/filters';
import { useClearRidesFilters } from '@/features/rides/browse/use-clear-rides-filters';
import type { RidesView } from '@/features/rides/browse/view';

const NO_FILTER = '__no_filter__';

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
      value={value ?? NO_FILTER}
      onValueChange={(next) => onChange(options.find((option) => option.value === next)?.value)}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          'w-full min-w-0 data-[size=default]:h-10',
          value && 'border-accent bg-accent/10 text-foreground dark:bg-accent/10',
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectItem value={NO_FILTER}>{allLabel}</SelectItem>
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

export function RidesFilterControls({ view, filters }: Props) {
  const t = useTranslations('RidesPage');
  const tBikeTypes = useTranslations('BikeTypes');
  const tRideTypes = useTranslations('RideTypes');
  const router = useRouter();
  const clearFilters = useClearRidesFilters(view);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const activeCount = activeRidesFilterCount(filters);

  const setFilter = <Key extends RidesFilterKey>(key: Key, value: RidesFilters[Key]) => {
    router.replace(ridesHref(view, withRidesFilter(filters, key, value)));
  };

  return (
    <>
      <Button
        variant="secondary"
        className={cn(
          'col-start-1 row-start-2 h-10 justify-self-start py-0 @3xl:hidden',
          activeCount > 0 && 'border-accent bg-accent/10 hover:border-accent hover:bg-accent/10',
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <SlidersHorizontal />
        {activeCount > 0 ? t('filtersButtonCount', { count: activeCount }) : t('filtersButton')}
      </Button>

      <div
        id={panelId}
        className={cn(
          'col-span-2 col-start-1 row-start-3 min-w-0 grid-cols-2 items-center gap-2 @3xl:row-start-2 @3xl:grid @3xl:grid-cols-[repeat(3,minmax(0,12rem))_auto] @7xl:col-span-1 @7xl:col-start-2 @7xl:row-start-1',
          open ? 'grid' : 'hidden',
        )}
      >
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
        <Button
          variant="ghost"
          size="sm"
          className="h-10 justify-self-start"
          disabled={activeCount === 0}
          onClick={clearFilters}
        >
          {t('filterClearAll')}
        </Button>
      </div>
    </>
  );
}
