'use client';

import { useTranslations } from 'next-intl';
import { RideCardList } from '@/features/rides/components/ride-card-list';
import { useCurrentUser } from '@/features/shell/components/current-user-provider';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link } from '@/i18n/navigation';
import { loadMyRidesPage } from '@/features/rides/my-rides/actions/load-my-rides-page';
import type { MyRidesFilters } from '@/features/rides/my-rides/filters';

export function MyRidesList({ filters }: { filters: MyRidesFilters }) {
  const t = useTranslations('MyRidesPage');
  const user = useCurrentUser();

  const loadPage = async (cursor: string | null) => {
    const page = await loadMyRidesPage(filters, cursor);

    if (!page.ok) return page;

    return {
      ok: true as const,
      cards: page.rides.map(({ id, organiserId, data }) => ({
        id,
        data: {
          ...data,
          viewer: organiserId === user?.id ? ('organiser' as const) : ('participant' as const),
        },
      })),
      nextCursor: page.nextCursor,
    };
  };

  return (
    <RideCardList
      loadPage={loadPage}
      empty={
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <Text variant="body-l" as="h2" className="text-foreground font-semibold">
            {t(`empty.${filters.phase}.${filters.role ?? 'all'}`)}
          </Text>
          {filters.phase === 'upcoming' && (
            <Button asChild variant="secondary" size="sm">
              <Link href="/rides">{t('emptyDiscover')}</Link>
            </Button>
          )}
        </div>
      }
    />
  );
}
