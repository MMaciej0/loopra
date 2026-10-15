'use client';

import type { Point, RoutePath } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRideMap } from './use-ride-map';

type Props = Readonly<{
  title: string;
  center: Point;
  start: Point | null;
  path: RoutePath | null;
  routeDownloadHref: string | null;
}>;

export function RideMap({ title, center, start, path, routeDownloadHref }: Props) {
  const t = useTranslations('RidesPage');
  const tRide = useTranslations('RidePage');
  const { containerRef } = useRideMap({ center, start, path });

  return (
    <div className="border-border relative h-[35svh] min-h-52 w-full overflow-hidden rounded-xl border">
      <div
        ref={containerRef}
        role="region"
        aria-label={t('rideMapLabel', { title })}
        className="absolute inset-0"
      />
      {routeDownloadHref && (
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="absolute top-2.5 left-2.5 shadow-md"
        >
          <a href={routeDownloadHref}>
            <Download />
            {tRide('downloadRoute')}
          </a>
        </Button>
      )}
    </div>
  );
}
