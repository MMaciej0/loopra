import type { RideDetail } from '@loopra/domain';
import { useFormatter, useTranslations } from 'next-intl';

type Props = Readonly<{
  ride: RideDetail;
}>;

type Stat = {
  key: string;
  label: string;
  value: string;
  unit: string;
};

const HOUR_MS = 60 * 60 * 1000;

function toPositiveNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : null;
}

function durationHours(ride: RideDetail, distanceKm: number | null, paceKmh: number | null) {
  if (ride.end_time) {
    const hours = (Date.parse(ride.end_time) - Date.parse(ride.start_time)) / HOUR_MS;

    return toPositiveNumber(hours);
  }

  if (distanceKm !== null && paceKmh !== null) {
    return distanceKm / paceKmh;
  }

  return null;
}

export function RideStats({ ride }: Props) {
  const t = useTranslations('RidePage');
  const format = useFormatter();

  const distanceKm =
    toPositiveNumber(ride.route?.distance_km) ?? toPositiveNumber(ride.distance_km);
  const ascentM = toPositiveNumber(ride.route?.ascent_m);
  const paceKmh = toPositiveNumber(ride.average_pace_kmh);
  const hours = durationHours(ride, distanceKm, paceKmh);
  const roundedHours = hours === null ? null : Math.max(1, Math.round(hours));

  const stats: Stat[] = [];

  if (distanceKm !== null) {
    stats.push({
      key: 'distance',
      label: t('distance'),
      value: format.number(distanceKm, { maximumFractionDigits: 1 }),
      unit: t('unitKm'),
    });
  }

  if (ascentM !== null) {
    stats.push({
      key: 'elevation',
      label: t('elevation'),
      value: format.number(ascentM, { maximumFractionDigits: 0 }),
      unit: t('unitElevation'),
    });
  }

  if (paceKmh !== null) {
    stats.push({
      key: 'pace',
      label: t('pace'),
      value: format.number(paceKmh),
      unit: t('unitKmh'),
    });
  }

  if (roundedHours !== null) {
    stats.push({
      key: 'duration',
      label: t('duration'),
      value: format.number(roundedHours),
      unit: t('unitHoursEstimate', { count: roundedHours }),
    });
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <dl className="bg-border border-border mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-px overflow-hidden rounded-[14px] border">
      {stats.map((stat) => (
        <div key={stat.key} className="bg-card flex flex-col gap-1.5 px-[18px] py-4">
          <dt className="font-data text-muted-foreground text-[9.5px] leading-none font-medium tracking-[0.12em] uppercase">
            {stat.label}
          </dt>
          <dd className="font-ui text-foreground text-[26px] leading-none font-semibold tracking-[-0.02em]">
            {stat.value}
            <span className="text-muted-foreground ml-1 text-xs font-normal tracking-normal">
              {stat.unit}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
