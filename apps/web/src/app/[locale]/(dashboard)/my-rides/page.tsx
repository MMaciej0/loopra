import { getTranslations } from 'next-intl/server';
import { PageBody } from '@/features/shell/components/page-body';
import { RidesTopNav } from '@/features/rides/components/rides-top-nav';
import { MyRidesBar } from '@/features/rides/my-rides/components/my-rides-bar';
import { MyRidesList } from '@/features/rides/my-rides/components/my-rides-list';
import {
  myRidesListKey,
  parseMyRidesFilters,
  type MyRidesFilterParams,
} from '@/features/rides/my-rides/filters';

type Props = Readonly<{ searchParams: Promise<Partial<MyRidesFilterParams>> }>;

export default async function MyRidesPage({ searchParams }: Props) {
  const t = await getTranslations('MyRidesPage');
  const filters = parseMyRidesFilters(await searchParams);

  return (
    <>
      <RidesTopNav />
      <h1 className="sr-only">{t('title')}</h1>
      <PageBody>
        <div className="flex h-full min-h-0 flex-col">
          <MyRidesBar filters={filters} />
          <div className="min-h-0 flex-1 overflow-y-auto pt-3">
            <MyRidesList key={myRidesListKey(filters)} filters={filters} />
          </div>
        </div>
      </PageBody>
    </>
  );
}
