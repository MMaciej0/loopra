'use client';

import { useTranslations } from 'next-intl';
import { RideCardList } from '@/features/rides/components/ride-card-list';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { loadRidesPage } from '@/features/rides/browse/actions/load-rides-page';
import { hasActiveRidesFilters } from '@/features/rides/browse/filters';
import type { RidesListQuery } from '@/features/rides/browse/list-query';
import { buildRidesTimeWindow } from '@/features/rides/browse/time-window';
import { useClearRidesFilters } from '@/features/rides/browse/use-clear-rides-filters';

export function RidesList({ query }: { query: RidesListQuery }) {
  const t = useTranslations('RidesPage');
  const clearFilters = useClearRidesFilters('list');
  const filtered = hasActiveRidesFilters(query.filters);

  return (
    <RideCardList
      loadPage={(cursor) => loadRidesPage(query, buildRidesTimeWindow(query.filters.when), cursor)}
      empty={
        <div
          className={cn(
            'border-border flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center',
            filtered ? 'gap-3' : 'gap-1.5',
          )}
        >
          <Text variant="body-l" as="h2" className="text-foreground font-semibold">
            {filtered ? t('filteredEmpty') : t('listEmptyTitle')}
          </Text>
          {filtered ? (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              {t('filteredEmptyClear')}
            </Button>
          ) : (
            <Text variant="body-s" className="text-muted-foreground max-w-sm">
              {t('listEmptyHint')}
            </Text>
          )}
        </div>
      }
    />
  );
}
