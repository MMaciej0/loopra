import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding font-medium tracking-[-0.005em] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover',
        secondary:
          'border-border bg-secondary text-secondary-foreground hover:border-border-strong hover:bg-secondary-hover',
        accent:
          'border-accent bg-accent text-[#0d0f12] hover:border-accent-hover hover:bg-accent-hover',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
        chip: 'rounded-full px-[13px] py-[7px] text-[12.5px] bg-transparent text-foreground/60 border-border hover:border-border-strong hover:text-foreground aria-pressed:bg-accent/10 aria-pressed:text-foreground aria-pressed:border-accent aria-pressed:hover:border-accent aria-checked:bg-accent/10 aria-checked:text-foreground aria-checked:border-accent aria-checked:hover:border-accent peer-checked:bg-accent/10 peer-checked:text-foreground peer-checked:border-accent peer-checked:hover:border-accent peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
        nav: 'border-transparent bg-transparent p-0 text-[13px] font-ui text-muted-foreground hover:text-foreground',
        outline:
          'border-border bg-secondary text-secondary-foreground hover:border-border-strong hover:bg-secondary-hover',
        destructive:
          'bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: "px-3 py-1.5 text-[13px] rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        default: 'px-4 py-2.5 text-sm rounded-[10px]',
        lg: 'px-[22px] py-3.5 text-[15px] rounded-xl',
        xs: "px-2 py-1 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3",
        icon: 'size-9 rounded-[10px]',
        'icon-sm': "size-[27px] rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-md': 'size-10 rounded-[10px]',
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
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
