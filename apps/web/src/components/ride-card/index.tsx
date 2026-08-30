import { useFormatter, useTranslations } from 'next-intl';
import { Bike, Clock, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, getAvatarColorIndex } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { RideBanner } from './banner';
import type { RideCardData } from './types';

interface RideCardProps {
  data: RideCardData;
  className?: string;
}

export function RideCard({ data, className }: RideCardProps) {
  const t = useTranslations('RideCard');
  const tBike = useTranslations('BikeTypes');
  const tExperience = useTranslations('ExperiencePolicies');
  const format = useFormatter();

  const title = data.title || t('titlePlaceholder');
  const isTitlePlaceholder = !data.title;

  const location = data.start_location_name || t('locationPlaceholder');
  const isLocationPlaceholder = !data.start_location_name;

  const timeZone = data.timezone;
  const startTime = data.start_time
    ? [
        format.dateTime(data.start_time, { weekday: 'short', timeZone }),
        format.dateTime(data.start_time, { month: 'short', day: 'numeric', timeZone }),
        format.dateTime(data.start_time, { hour: '2-digit', minute: '2-digit', timeZone }),
      ].join(' · ')
    : t('datePlaceholder');
  const isTimePlaceholder = !data.start_time;

  const creatorName = data.creator?.name || t('creatorPlaceholder');
  const participants = data.participant_count ?? 1;

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
          <Text
            variant="body-s"
            className={cn('flex items-center gap-1.5', isTimePlaceholder && 'opacity-60')}
          >
            <Clock aria-hidden className="size-3.5 shrink-0" />
            {startTime}
          </Text>
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
          <Avatar size="sm">
            <AvatarFallback color={getAvatarColorIndex(creatorName)}>
              {creatorName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Text variant="body-s" className="text-foreground/80">
            {creatorName}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback color={getAvatarColorIndex(creatorName)}>
              {creatorName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
