import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding font-medium tracking-[-0.005em] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // ink on bg — primary CTA ("Create ride")
        default:
          'bg-primary text-primary-foreground border-primary hover:bg-[color-mix(in_oklch,var(--primary)_88%,var(--background))] hover:border-[color-mix(in_oklch,var(--primary)_88%,var(--background))] active:bg-[color-mix(in_oklch,var(--primary)_75%,var(--background))]',
        // surface + line border ("Cancel", secondary actions)
        secondary:
          'bg-secondary text-secondary-foreground border-border hover:bg-accent hover:border-border-strong active:bg-muted',
        // cobalt brand CTA ("Join ride", "Confirmed")
        accent:
          'bg-brand text-[#0d0f12] border-brand hover:bg-[color-mix(in_oklch,var(--brand)_85%,black)] hover:border-[color-mix(in_oklch,var(--brand)_85%,black)] active:bg-[color-mix(in_oklch,var(--brand)_75%,black)]',
        // transparent ("Skip", icon-only nav)
        ghost: 'border-transparent text-foreground hover:bg-muted active:bg-accent',
        // selectable filter chip — use with aria-pressed for selected state
        chip: 'rounded-full px-[13px] py-[7px] text-[12.5px] bg-secondary text-foreground/60 border-border hover:border-foreground hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary aria-pressed:hover:bg-[color-mix(in_oklch,var(--primary)_88%,var(--background))] aria-pressed:active:bg-[color-mix(in_oklch,var(--primary)_75%,var(--background))]',
        // kept for shadcn compat
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        destructive:
          'bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        // Design system sizes: sm / md (default) / lg
        sm: "px-3 py-1.5 text-[13px] rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        default: 'px-4 py-2.5 text-sm rounded-[10px]',
        lg: 'px-[22px] py-3.5 text-[15px] rounded-xl',
        // Extra utility sizes
        xs: "px-2 py-1 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3",
        icon: 'size-9 rounded-[10px]',
        'icon-sm': "size-[27px] rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-lg': 'size-11 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
