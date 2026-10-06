import type { RideDetail } from '@loopra/domain';
import { useFormatter, useTranslations } from 'next-intl';
import { Card, CardLabel } from '@/components/ui/card';
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
  width: 720,
  height: 160,
  bandTop: 8,
  bandBottom: 152,
};

const GRID_LINE_COUNT = 4;

const GRID_LINES = Array.from(
  { length: GRID_LINE_COUNT },
  (_, index) =>
    CHART_FRAME.bandTop +
    (index * (CHART_FRAME.bandBottom - CHART_FRAME.bandTop)) / (GRID_LINE_COUNT - 1),
);

const BAND_TOP_OFFSET = `${(CHART_FRAME.bandTop / CHART_FRAME.height) * 100}%`;
const BAND_BOTTOM_OFFSET = `${(1 - CHART_FRAME.bandBottom / CHART_FRAME.height) * 100}%`;

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
    { key: 'highest', value: route.max_elevation_m, style: { top: BAND_TOP_OFFSET } },
    { key: 'lowest', value: route.min_elevation_m, style: { bottom: BAND_BOTTOM_OFFSET } },
  ].filter((label): label is typeof label & { value: number } => label.value !== null);

  const ticks = distanceTicks(distanceKm);

  return (
    <Card className="mb-7 min-w-0">
      <CardLabel className="mb-3.5">{t('elevationHeading')}</CardLabel>

      {stats.length > 0 && (
        <dl className="mb-4 flex flex-wrap gap-x-8 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.key} className="flex flex-col gap-1.5">
              <dt className="font-data text-muted-foreground text-[9.5px] leading-none font-medium tracking-[0.12em] uppercase">
                {stat.label}
              </dt>
              <dd className="font-ui text-foreground text-[20px] leading-none font-semibold tracking-[-0.02em]">
                {format.number(stat.value, { maximumFractionDigits: 0 })}
                <span className="text-muted-foreground ml-1 text-xs font-normal tracking-normal">
                  {stat.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="relative h-40 w-full">
        <svg
          viewBox={`0 0 ${CHART_FRAME.width} ${CHART_FRAME.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block h-full w-full"
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
              <path d={path.fill} fill="var(--accent)" fillOpacity="0.12" />
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

        {heightLabels.map((label) => (
          <span
            key={label.key}
            aria-hidden="true"
            style={label.style}
            className="font-data text-muted-foreground absolute left-0 m-1 text-[10px] leading-none whitespace-nowrap"
          >
            {t('elevationHeightLabel', {
              value: format.number(label.value, { maximumFractionDigits: 0 }),
            })}
          </span>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="font-data text-muted-foreground relative mt-2 h-3 text-[10px] leading-none"
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
    </Card>
  );
}
