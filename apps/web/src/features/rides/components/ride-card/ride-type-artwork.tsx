import { Camera, Coffee, Sun, Timer, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RideType } from '@loopra/domain';

const RIDE_TYPE_ICON: Record<RideType, LucideIcon> = {
  casual: Sun,
  coffee_ride: Coffee,
  sightseeing: Camera,
  training: Timer,
};

interface RideTypeIconProps {
  rideType: RideType;
  tone?: 'solid' | 'watermark';
  className?: string;
}

export function RideTypeIcon({ rideType, tone = 'solid', className }: RideTypeIconProps) {
  const Icon = RIDE_TYPE_ICON[rideType];
  const watermark = tone === 'watermark';

  return (
    <Icon
      aria-hidden
      className={cn(
        watermark ? 'text-accent-deep/20 size-16' : 'text-accent-deep size-7',
        className,
      )}
      strokeWidth={watermark ? 1.5 : 2}
    />
  );
}
