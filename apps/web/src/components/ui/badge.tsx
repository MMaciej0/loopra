import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-[5px] rounded-full border font-ui font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        // status metadata, counts, dates
        default: 'bg-muted text-foreground/60 border-border',
        // discipline tags, road/gravel/mtb
        accent: 'bg-brand-muted text-brand-fg border-brand-line',
        // alerts: FULL, first-timers welcome
        coral: 'bg-coral-bg text-destructive border-coral-line',
        // joined, host, confirmed
        inverse: 'bg-primary text-primary-foreground border-primary',
        // drop ride, subtle flags
        soft: 'bg-transparent text-muted-foreground border-border',
      },
      size: {
        md: 'text-[12px] px-[10px] py-[5px]',
        sm: 'text-[11px] px-[8px] py-[3px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Dot indicator used inside accent/coral pills: <Badge variant="accent"><BadgeDot />Road · Social</Badge>
function BadgeDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('size-[5px] shrink-0 rounded-full bg-current', className)} />
  );
}

// Large editorial badge for dark poster surfaces (auth layout)
function PosterBadge({ className, style, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="poster-badge"
      className={cn(
        'inline-flex items-center gap-[9px] w-max rounded-full border',
        'px-[15px] py-[7px]',
        'font-data text-[16px] tracking-[0.06em] uppercase',
        className,
      )}
      style={{
        background: 'color-mix(in oklch, var(--brand-foreground) 6%, transparent)',
        borderColor: 'color-mix(in oklch, var(--brand-foreground) 16%, transparent)',
        color: 'color-mix(in oklch, var(--brand-foreground) 70%, transparent)',
        ...style,
      }}
      {...props}
    />
  );
}

// 8px cobalt dot for PosterBadge
function PosterBadgeDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn('size-2 shrink-0 rounded-full bg-brand', className)} />;
}

export { Badge, BadgeDot, badgeVariants, PosterBadge, PosterBadgeDot };
