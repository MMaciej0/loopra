'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

// Deterministic palette — index mod 6 for consistent per-user color
export const AVATAR_COLORS = [
  '#7da9ff',
  '#e08850',
  '#82d8b6',
  '#d09be0',
  '#e0c44a',
  '#b6c2ff',
] as const;

// Hash a string or use a number directly → palette index
export function getAvatarColorIndex(seed: string | number): number {
  if (typeof seed === 'number') return Math.abs(seed) % AVATAR_COLORS.length;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

function Avatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 'sm' | 'default' | 'lg';
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex shrink-0 select-none rounded-full',
        'size-8 data-[size=sm]:size-[26px] data-[size=lg]:size-10',
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full rounded-full object-cover', className)}
      {...props}
    />
  );
}

// Pass `color` (0–5) for palette background, or omit for muted fallback.
// Use getAvatarColorIndex(userId) to derive a stable index from an ID/name.
function AvatarFallback({
  className,
  color,
  ...props
}: Omit<React.ComponentProps<typeof AvatarPrimitive.Fallback>, 'color'> & { color?: number }) {
  const bg = color !== undefined ? AVATAR_COLORS[color % AVATAR_COLORS.length] : undefined;

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      style={bg ? { background: bg } : undefined}
      className={cn(
        'flex size-full items-center justify-center rounded-full font-ui font-semibold',
        bg ? 'text-[#101317]' : 'bg-muted text-foreground/60',
        // text size matches the three avatar sizes
        'text-[13px] group-data-[size=sm]/avatar:text-[11px] group-data-[size=lg]/avatar:text-[17px]',
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
        'size-2.5 [&>svg]:size-2',
        'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
        'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
        className,
      )}
      {...props}
    />
  );
}

// Wrap Avatar components in AvatarGroup for the stacked overlap effect
function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group flex items-center',
        // each avatar gets a 2px background-colored ring to separate discs
        '*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
        // overlap: -8px (matches design's margin-left: -8px)
        '-space-x-2',
        className,
      )}
      {...props}
    />
  );
}

// "+3" overflow indicator — inherits size from AvatarGroup context
function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full',
        'bg-muted text-foreground/60 font-ui font-semibold',
        'text-[10px] ring-2 ring-background',
        // size mirrors Avatar sizes
        'size-8 group-has-data-[size=sm]/avatar-group:size-[26px] group-has-data-[size=lg]/avatar-group:size-10',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
