import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { RideSubtitle } from './ride-subtitle';

type Props = Readonly<{
  ride: RideDetail;
}>;

export function RideHeader({ ride }: Props) {
  const tBike = useTranslations('BikeTypes');
  const tRide = useTranslations('RideTypes');
  const tDrop = useTranslations('DropPolicies');
  const tExperience = useTranslations('ExperiencePolicies');
  const tPage = useTranslations('RidePage');

  return (
    <div className="-order-2 lg:order-none">
      {ride.status === 'cancelled' && (
        <div
          role="status"
          className="bg-destructive-bg text-destructive border-destructive-border font-ui mb-4 rounded-xl border px-3.5 py-3 text-[13.5px] font-medium"
        >
          {tPage('cancelledBanner')}
        </div>
      )}
      <div className="mb-3.5 flex flex-wrap gap-2">
        <Badge variant="accentDeep" size="sm" className="py-1 tracking-[0.02em]">
          <BadgeDot />
          {tBike(ride.bike_type)} · {tRide(`${ride.ride_type}.label`)}
        </Badge>
        <Badge size="sm" className="text-muted-foreground py-1 tracking-[0.02em]">
          {tDrop(`${ride.drop_policy}.label`)}
        </Badge>
        {ride.experience_policy === 'first_timers' && (
          <Badge
            size="sm"
            className="bg-destructive-bg text-destructive border-destructive-border py-1 tracking-[0.02em]"
          >
            {tExperience('first_timers.label')}
          </Badge>
        )}
      </div>
      <h1 className="font-editorial text-foreground mb-1.5 text-[34px] leading-[1.02] font-normal tracking-[-0.02em] text-pretty lg:text-[44px]">
        {ride.title}
      </h1>
      <RideSubtitle
        startTime={new Date(ride.start_time)}
        startLocationName={ride.start_location_name}
      />
    </div>
  );
}
