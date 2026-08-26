import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ElevationBanner } from './elevation-banner';
import { buildElevationPaths, CHART_HEIGHT, CHART_WIDTH } from './geometry';
import type { RideCardElevation } from './types';

interface ElevationHeaderProps {
  elevation?: RideCardElevation;
  className?: string;
}

interface PillProps {
  value: number;
  unit: string;
  icon?: ReactNode;
  className?: string;
}

function Pill({ value, unit, icon, className }: PillProps) {
  return (
    <span
      className={cn(
        'bg-card border-border absolute top-2.5 flex items-center gap-0.5 rounded-full border px-2 py-0.5 shadow-sm',
        className,
      )}
    >
      {icon}
      <span className="type-meta text-foreground">{Math.round(value)}</span>
      <span className="type-label text-muted-foreground">{unit}</span>
    </span>
  );
}

export function ElevationHeader({ elevation, className }: ElevationHeaderProps) {
  const t = useTranslations('RideCard');

  const paths = elevation ? buildElevationPaths(elevation.profile, elevation.distance_km) : [];
  const chart = elevation && paths.length > 0 ? elevation : null;

  return (
    <div
      style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
      className={cn('relative w-full overflow-hidden', className)}
    >
      {chart ? (
        <>
          <ElevationBanner paths={paths} />
          <Pill className="left-3" value={chart.distance_km} unit={t('unitKm')} />
          <Pill
            className="right-3"
            value={chart.ascent_m}
            unit={t('unitM')}
            icon={<ArrowUp className="text-accent size-3" strokeWidth={2.5} />}
          />
        </>
      ) : (
        <p className="bg-muted text-muted-foreground type-label flex h-full items-center justify-center px-4 text-center">
          {elevation ? t('elevationEmpty') : t('elevationMissing')}
        </p>
      )}
    </div>
  );
}
