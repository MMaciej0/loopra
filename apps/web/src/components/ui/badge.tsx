import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-[5px] rounded-full border font-ui font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground/60 border-border',
        accent: 'bg-accent/10 text-accent border-accent/30',
        accentDeep: 'bg-accent-deep/10 text-accent-deep border-accent-deep/25',
        destructive: 'bg-destructive/10 text-destructive border-destructive/20',
        inverse: 'bg-primary text-primary-foreground border-primary',
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

function BadgeDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('size-[5px] shrink-0 rounded-full bg-current', className)} />
  );
}

function PosterBadge({ className, style, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="poster-badge"
      className={cn(
        'inline-flex w-max items-center gap-[9px] rounded-full border',
        'px-[15px] py-[7px]',
        'font-data text-[16px] tracking-[0.06em] uppercase',
        className,
      )}
      style={{
        background: 'color-mix(in oklch, oklch(0.985 0 0) 6%, transparent)',
        borderColor: 'color-mix(in oklch, oklch(0.985 0 0) 16%, transparent)',
        color: 'color-mix(in oklch, oklch(0.985 0 0) 70%, transparent)',
        ...style,
      }}
      {...props}
    />
  );
}

function PosterBadgeDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn('bg-accent size-2 shrink-0 rounded-full', className)} />;
}

export { Badge, BadgeDot, badgeVariants, PosterBadge, PosterBadgeDot };
