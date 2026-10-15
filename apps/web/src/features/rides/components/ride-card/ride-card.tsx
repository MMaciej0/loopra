import { rideAvailability } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Bike, MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { RideBanner } from './banner';
import { RideStartTime } from './start-time';
import type { RideCardData } from './types';

interface RideCardProps {
  data: RideCardData;
  className?: string;
}

export function RideCard({ data, className }: RideCardProps) {
  const t = useTranslations('RideCard');
  const tBike = useTranslations('BikeTypes');
  const tExperience = useTranslations('ExperiencePolicies');

  const title = data.title || t('titlePlaceholder');
  const isTitlePlaceholder = !data.title;

  const location = data.start_location_name || t('locationPlaceholder');
  const isLocationPlaceholder = !data.start_location_name;

  const creatorName = data.creator?.name || t('creatorPlaceholder');
  const participants = data.participant_count ?? 1;
  const isCancelled = data.status === 'cancelled';
  const isOrganiser = data.viewer === 'organiser';
  const isFull =
    data.viewer === undefined &&
    data.participant_count !== undefined &&
    data.max_participants !== undefined &&
    rideAvailability(data.participant_count, data.max_participants) === 'full';

  const distanceKm = data.elevation?.distance_km ?? data.distance_km;

  return (
    <article
      className={cn(
        'bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm',
        className,
      )}
    >
      <RideBanner
        rideType={data.ride_type}
        distanceKm={distanceKm}
        paceKmh={data.average_pace_kmh}
        ascentM={data.elevation?.ascent_m}
      />

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="accentDeep" size="sm">
            <Bike aria-hidden className="size-3 shrink-0" />
            {tBike(data.bike_type)}
          </Badge>
          <Badge size="sm">{tExperience(`${data.experience_policy}.label`)}</Badge>
          {(isOrganiser || isCancelled || isFull) && (
            <div className="ml-auto flex items-center gap-1.5">
              {isOrganiser && (
                <Badge variant="accent" size="sm">
                  {t('organiser')}
                </Badge>
              )}
              {isCancelled && (
                <Badge variant="destructive" size="sm">
                  {t('cancelled')}
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive" size="sm">
                  {t('full')}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Text
          variant="body-l"
          as="h3"
          className={cn(
            'line-clamp-2 font-semibold',
            isTitlePlaceholder ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {title}
        </Text>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
          <RideStartTime startTime={data.start_time} />
          <Text
            variant="body-s"
            className={cn(
              'flex min-w-0 items-center gap-1.5',
              isLocationPlaceholder && 'opacity-60',
            )}
          >
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </Text>
        </div>
      </div>

      <footer className="border-border flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <UserAvatar size="sm" name={creatorName} />
          <Text variant="body-s" className="text-foreground/80">
            {creatorName}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <UserAvatar size="sm" name={creatorName} />
          <Text variant="meta" className="text-muted-foreground">
            {data.max_participants === undefined
              ? t('participantsOpen', { count: participants })
              : t('participants', { count: participants, max: data.max_participants })}
          </Text>
        </div>
      </footer>
    </article>
  );
}
