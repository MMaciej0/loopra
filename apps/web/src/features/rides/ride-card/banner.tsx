import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { RideTypeIcon } from './ride-type-artwork';
import type { RideType } from '@loopra/domain';

const BANNER_WIDTH = 360;
const BANNER_HEIGHT = 80;

interface RideBannerProps {
  rideType: RideType;
  distanceKm?: number;
  paceKmh?: number;
  ascentM?: number;
  className?: string;
}

interface PillProps {
  value: number;
  unit: string;
  icon?: ReactNode;
}

function Pill({ value, unit, icon }: PillProps) {
  return (
    <span className="bg-card border-border flex items-center gap-1 rounded-lg border px-2 py-1 shadow-sm">
      {icon}
      <span className="type-meta text-foreground font-semibold">{Math.round(value)}</span>
      <span className="type-meta text-muted-foreground">{unit}</span>
    </span>
  );
}

export function RideBanner({ rideType, distanceKm, paceKmh, ascentM, className }: RideBannerProps) {
  const t = useTranslations('RideCard');
  const tRide = useTranslations('RideTypes');

  return (
    <div
      style={{ aspectRatio: `${BANNER_WIDTH} / ${BANNER_HEIGHT}` }}
      className={cn('bg-muted relative w-full overflow-hidden', className)}
    >
      <RideTypeIcon
        rideType={rideType}
        tone="watermark"
        className="absolute -right-5 -bottom-7 size-28"
      />

      <div className="absolute inset-0 flex items-center justify-center gap-2">
        <RideTypeIcon rideType={rideType} className="size-5" />
        <Text variant="label" className="text-foreground">
          {tRide(`${rideType}.label`)}
        </Text>
      </div>

      <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
        {distanceKm !== undefined && <Pill value={distanceKm} unit={t('unitKm')} />}
        {paceKmh !== undefined && <Pill value={paceKmh} unit={t('unitKmh')} />}
      </div>

      {ascentM !== undefined && (
        <div className="absolute top-3 right-3">
          <Pill
            value={ascentM}
            unit={t('unitM')}
            icon={<ArrowUp aria-hidden className="text-foreground size-3" strokeWidth={2.5} />}
          />
        </div>
      )}
    </div>
  );
}
