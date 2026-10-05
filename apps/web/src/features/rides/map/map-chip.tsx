import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function MapChip({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-background/95 border-border text-foreground pointer-events-auto flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-3.5 text-[13px] shadow-md backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}
