import type { RideDetail } from '@loopra/domain';
import { useFormatter, useTranslations } from 'next-intl';
import { Text } from '@/components/ui/text';
import {
  projectElevationProfile,
  type ElevationFrame,
} from '@/features/rides/project-elevation-profile';
import { cn } from '@/lib/utils';
import { distanceTicks } from './distance-ticks';

type Props = Readonly<{
  ride: RideDetail;
}>;

type Stat = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
};

const CHART_FRAME: ElevationFrame = {
  width: 600,
  height: 160,
  bandTop: 6,
  bandBottom: 153,
};

const GRID_LINES = [0, 53, 106, 159];

function toNumber(value: string | null) {
  if (value === null || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export function ElevationProfileCard({ ride }: Props) {
  const t = useTranslations('RidePage');
  const format = useFormatter();

  const route = ride.route;
  const distanceKm = toNumber(route?.distance_km ?? null);

  if (!route?.elevation_profile || distanceKm === null) {
    return null;
  }

  const paths = projectElevationProfile(route.elevation_profile, distanceKm, CHART_FRAME);

  if (paths.length === 0) {
    return null;
  }

  const stats = (
    [
      {
        key: 'totalGain',
        label: t('elevationTotalGain'),
        value: toNumber(route.ascent_m),
        unit: t('unitM'),
      },
      {
        key: 'highestPoint',
        label: t('elevationHighestPoint'),
        value: route.max_elevation_m,
        unit: t('unitM'),
      },
      {
        key: 'lowestPoint',
        label: t('elevationLowestPoint'),
        value: route.min_elevation_m,
        unit: t('unitM'),
      },
    ] satisfies Stat[]
  ).filter((stat): stat is Stat & { value: number } => stat.value !== null);

  const heightLabels = [
    { key: 'highest', value: route.max_elevation_m },
    { key: 'lowest', value: route.min_elevation_m },
  ].filter((label): label is typeof label & { value: number } => label.value !== null);

  const ticks = distanceTicks(distanceKm);

  return (
    <section className="mb-7 min-w-0">
      <Text variant="label" as="h2" className="text-muted-foreground mb-2.5">
        {t('elevationHeading')}
      </Text>

      <div className="bg-card border-border overflow-hidden rounded-[14px] border">
        {stats.length > 0 && (
          <dl className="border-border grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] border-b">
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className={cn('border-border px-4 py-3', index > 0 && 'border-l')}
              >
                <dt className="font-data text-muted-foreground mb-1 text-[9.5px] font-medium tracking-[0.12em] uppercase">
                  {stat.label}
                </dt>
                <dd className="font-ui text-foreground text-base font-semibold tracking-[-0.01em]">
                  {format.number(stat.value, { maximumFractionDigits: 0 })}
                  <span className="text-muted-foreground ml-[3px] text-[11px] font-normal tracking-normal">
                    {stat.unit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="relative px-4 pt-4 pb-2.5">
          <svg
            viewBox={`0 0 ${CHART_FRAME.width} ${CHART_FRAME.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="block h-40 w-full overflow-visible"
          >
            {GRID_LINES.map((y) => (
              <line
                key={y}
                x1="0"
                x2={CHART_FRAME.width}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {paths.map((path, index) => (
              <g key={index}>
                <path d={path.fill} fill="var(--accent)" fillOpacity="0.14" />
                <path
                  d={path.stroke}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>

          {heightLabels.length > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-4 left-4 flex h-40 flex-col items-start justify-between"
            >
              {heightLabels.map((label) => (
                <span
                  key={label.key}
                  className="font-data text-muted-foreground bg-card pr-1 text-[9.5px] leading-normal whitespace-nowrap"
                >
                  {t('elevationHeightLabel', {
                    value: format.number(label.value, { maximumFractionDigits: 0 }),
                  })}
                </span>
              ))}
            </div>
          )}

          <div
            aria-hidden="true"
            className="font-data text-muted-foreground relative mt-1.5 h-3 text-[10px] leading-none"
          >
            {ticks.map((tick) => (
              <span
                key={tick}
                style={{ left: `${(tick / distanceKm) * 100}%` }}
                className={cn('absolute top-0 whitespace-nowrap', tick > 0 && '-translate-x-1/2')}
              >
                {t('elevationDistanceTick', { value: format.number(tick) })}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
