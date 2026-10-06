import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import TopNav from '@/features/shell/components/top-nav';
import { PageBody } from '@/features/shell/components/page-body';
import { getRide } from '@/features/rides/detail/get-ride';
import { mapCenter } from '@/features/rides/detail/map-center';
import { RideMap } from '@/features/rides/detail/components/ride-map/ride-map';
import { RideHeader } from '@/features/rides/detail/components/ride-header/ride-header';
import { RideStats } from '@/features/rides/detail/components/ride-stats';
import { ElevationProfileCard } from '@/features/rides/detail/components/elevation-profile-card/elevation-profile-card';
import { RideContractCards } from '@/features/rides/detail/components/ride-contract-cards';
import { OrganiserCard } from '@/features/rides/detail/components/organiser-card';
import { JoinCard } from '@/features/rides/detail/components/join-card';
import { ParticipantsCard } from '@/features/rides/detail/components/participants-card';

type Props = Readonly<{ params: Promise<{ id: string }> }>;

export default async function RidePage({ params }: Props) {
  const { id } = await params;
  const ride = await getRide(id);

  if (!ride) {
    notFound();
  }

  if (new Date(ride.start_time) <= new Date()) {
    redirect({ href: '/rides', locale: await getLocale() });
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
          <div className="grid grid-cols-1 items-start px-1 pt-6 pb-12 md:px-3 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:p-0">
            <div className="border-border contents min-w-0 lg:flex lg:flex-col lg:border-r lg:px-8 lg:pt-[26px] lg:pb-12">
              <RideHeader ride={ride} />
              <RideStats ride={ride} />
              <ElevationProfileCard ride={ride} />
              <RideContractCards ride={ride} />
              <OrganiserCard ride={ride} />
            </div>
            <aside className="contents lg:sticky lg:top-0 lg:flex lg:flex-col lg:gap-4 lg:px-7 lg:pt-[26px] lg:pb-12 xl:max-h-[calc(100svh-4rem)] xl:pb-[26px]">
              <JoinCard ride={ride} />
              <ParticipantsCard ride={ride} />
            </aside>
          </div>
        </div>
      </PageBody>
    </>
  );
}
