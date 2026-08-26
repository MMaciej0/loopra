import { useFormatter, useTranslations } from 'next-intl';
import { Clock, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, getAvatarColorIndex } from '@/components/ui/avatar';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ElevationHeader } from './elevation-header';
import type { RideCardData } from './types';

interface RideCardProps {
  data: RideCardData;
  className?: string;
}

export function RideCard({ data, className }: RideCardProps) {
  const t = useTranslations('RideCard');
  const tBike = useTranslations('BikeTypes');
  const tRide = useTranslations('RideTypes');
  const tDrop = useTranslations('DropPolicies');
  const tPace = useTranslations('PacePolicies');
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

  const stats = [
    !data.elevation && data.distance_km !== undefined
      ? t('distance', { value: Math.round(data.distance_km) })
      : null,
    data.average_pace_kmh !== undefined
      ? t('paceAverage', { value: data.average_pace_kmh })
      : tPace(`${data.pace_policy}.label`),
    tDrop(`${data.drop_policy}.label`),
  ].filter((stat) => stat !== null);

  return (
    <article
      className={cn(
        'bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm',
        className,
      )}
    >
      <ElevationHeader elevation={data.elevation} />

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="accent" size="sm">
            <BadgeDot />
            {data.bike_type === 'all'
              ? tRide(`${data.ride_type}.label`)
              : `${tBike(data.bike_type)} · ${tRide(`${data.ride_type}.label`)}`}
          </Badge>
          <Badge size="sm">{tExperience(`${data.experience_policy}.label`)}</Badge>
        </div>

        <Text
          variant="body-l"
          as="h3"
          className={cn(
            'font-semibold',
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
            className={cn('flex items-center gap-1.5', isLocationPlaceholder && 'opacity-60')}
          >
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            {location}
          </Text>
        </div>

        <Text variant="meta" className="text-foreground/70">
          {stats.join('  ·  ')}
        </Text>
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
