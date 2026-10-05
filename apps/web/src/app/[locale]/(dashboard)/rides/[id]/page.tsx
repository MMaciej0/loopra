import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import TopNav from '@/features/shell/components/top-nav';
import { PageBody } from '@/features/shell/components/page-body';
import { Text } from '@/components/ui/text';
import { getRide } from '@/features/rides/detail/get-ride';
import { mapCenter } from '@/features/rides/detail/map-center';
import { RideMap } from '@/features/rides/detail/components/ride-map/ride-map';

type Props = Readonly<{ params: Promise<{ id: string }> }>;

export default async function RidePage({ params }: Props) {
  const { id } = await params;
  const ride = await getRide(id);

  if (!ride) {
    notFound();
  }

  const center = mapCenter(ride);

  if (!center) {
    const t = await getTranslations('RidesPage');

    return (
      <>
        <TopNav />
        <PageBody>
          <div className="border-border flex h-full min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed">
            <Text variant="body-xs" className="text-muted-foreground p-6">
              {t('ridePagePlaceholder')}
            </Text>
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <PageBody>
        <div className="pt-3">
          <RideMap
            title={ride.title}
            center={center}
            start={ride.start_location}
            path={ride.route?.path ?? null}
          />
        </div>
      </PageBody>
    </>
  );
}
