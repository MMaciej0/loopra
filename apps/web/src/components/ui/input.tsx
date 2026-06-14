import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 rounded-[10px] border border-input bg-secondary px-[14px] py-3 font-ui text-sm text-foreground transition-[border-color] duration-150 outline-none',
        'placeholder:text-muted-foreground',
        'hover:border-foreground/30',
        'focus-visible:border-foreground',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:bg-muted',
        'aria-invalid:border-destructive',
        'file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
