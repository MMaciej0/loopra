import { notFound } from 'next/navigation';
import TopNav from '@/features/shell/components/top-nav';
import { PageBody } from '@/features/shell/components/page-body';
import { getRide } from '@/features/rides/detail/get-ride';
import { mapCenter } from '@/features/rides/detail/map-center';
import { RideMap } from '@/features/rides/detail/components/ride-map/ride-map';
import { RideHeader } from '@/features/rides/detail/components/ride-header/ride-header';
import { OrganiserCard } from '@/features/rides/detail/components/organiser-card';

type Props = Readonly<{ params: Promise<{ id: string }> }>;

export default async function RidePage({ params }: Props) {
  const { id } = await params;
  const ride = await getRide(id);

  if (!ride) {
    notFound();
  }

  const center = mapCenter(ride);

  return (
    <>
      <TopNav />
      <PageBody>
        <div className="h-full lg:overflow-y-auto">
          {center && (
            <div className="pt-3">
              <RideMap
                title={ride.title}
                center={center}
                start={ride.start_location}
                path={ride.route?.path ?? null}
              />
            </div>
          )}
          <div className="grid grid-cols-1 items-start lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <div className="border-border flex min-w-0 flex-col px-1 pt-6 pb-12 md:px-3 lg:border-r lg:px-8 lg:pt-[26px]">
              <RideHeader ride={ride} />
              <OrganiserCard description={ride.description} creator={ride.creator} />
            </div>
            <aside className="flex flex-col gap-4 lg:sticky lg:top-0 lg:px-7 lg:pt-[26px] lg:pb-12" />
          </div>
        </div>
      </PageBody>
    </>
  );
}
