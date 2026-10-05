'use client';

import type { Point, RoutePath } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { useRideMap } from './use-ride-map';

type Props = Readonly<{
  title: string;
  center: Point;
  start: Point | null;
  path: RoutePath | null;
}>;

export function RideMap({ title, center, start, path }: Props) {
  const t = useTranslations('RidesPage');
  const { containerRef } = useRideMap({ center, start, path });

  return (
    <div className="border-border relative h-[35svh] min-h-52 w-full overflow-hidden rounded-xl border">
      <div
        ref={containerRef}
        role="region"
        aria-label={t('rideMapLabel', { title })}
        className="absolute inset-0"
      />
    </div>
  );
}
