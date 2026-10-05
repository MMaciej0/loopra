import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import TopNav from '@/features/shell/components/top-nav';
import { PageBody } from '@/features/shell/components/page-body';
import { RidesBar } from '@/features/rides/browse/components/rides-bar';
import { ViewPane } from '@/features/rides/browse/components/view-pane';
import { resolveRidesView, type RidesViewParams } from '@/features/rides/browse/view';

type Props = Readonly<{ searchParams: Promise<RidesViewParams> }>;

export default async function RidesPage({ searchParams }: Props) {
  const { view, shouldRedirect } = resolveRidesView(await searchParams);

  if (shouldRedirect) {
    redirect({
      href: { pathname: '/rides', query: { view } },
      locale: await getLocale(),
    });
  }

  return (
    <>
      <TopNav />
      <PageBody>
        <div className="flex h-full min-h-0 flex-col">
          <RidesBar view={view} />
          <div className="flex min-h-0 flex-1 flex-col pt-3">
            <ViewPane view={view} />
          </div>
        </div>
      </PageBody>
    </>
  );
}
