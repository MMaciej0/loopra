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
        'group/avatar relative flex shrink-0 rounded-full select-none',
        'size-8 data-[size=lg]:size-10 data-[size=sm]:size-[26px]',
        className,
      )}
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
        'font-ui flex size-full items-center justify-center rounded-full font-semibold',
        bg ? 'text-[#101317]' : 'bg-muted text-foreground/60',
        // text size matches the three avatar sizes
        'text-[13px] group-data-[size=lg]/avatar:text-[17px] group-data-[size=sm]/avatar:text-[11px]',
        className,
      )}
      {...props}
    />
  );
}

function UserAvatar({
  name,
  ...props
}: Omit<React.ComponentProps<typeof Avatar>, 'children'> & { name: string }) {
  return (
    <Avatar {...props}>
      <AvatarFallback color={getAvatarColorIndex(name)}>
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarFallback, UserAvatar };
