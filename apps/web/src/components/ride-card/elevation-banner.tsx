'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import { CHART_HEIGHT, CHART_WIDTH, type ElevationPath } from './geometry';

interface ElevationBannerProps {
  paths: ElevationPath[];
  className?: string;
}

export function ElevationBanner({ paths, className }: ElevationBannerProps) {
  const gradientId = `elevation-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      aria-hidden="true"
      className={cn('block h-full w-full', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {paths.map((path, index) => (
        <g key={index}>
          <path d={path.fill} fill={`url(#${gradientId})`} />
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
  );
}
