import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { RidesTopNav } from '@/features/rides/components/rides-top-nav';
import { PageBody } from '@/features/shell/components/page-body';
import { RidesBar } from '@/features/rides/browse/components/rides-bar';
import { ViewPane } from '@/features/rides/browse/components/view-pane';
import {
  parseRidesFilters,
  ridesHref,
  type RidesFilterParams,
} from '@/features/rides/browse/filters';
import { resolveRidesView, type RidesViewParams } from '@/features/rides/browse/view';

type Props = Readonly<{ searchParams: Promise<RidesViewParams & Partial<RidesFilterParams>> }>;

export default async function RidesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { view, shouldRedirect } = resolveRidesView(params);
  const filters = parseRidesFilters(params);

  if (shouldRedirect) {
    redirect({
      href: ridesHref(view, filters),
      locale: await getLocale(),
    });
  }

  return (
    <>
      <RidesTopNav />
      <PageBody>
        <div className="flex h-full min-h-0 flex-col">
          <RidesBar view={view} filters={filters} />
          <div className="flex min-h-0 flex-1 flex-col pt-3">
            <ViewPane view={view} filters={filters} />
          </div>
        </div>
      </PageBody>
    </>
  );
}
