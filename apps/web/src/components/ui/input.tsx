import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input bg-secondary font-ui text-foreground w-full min-w-0 rounded-[10px] border px-[14px] py-3 text-sm transition-[border-color] duration-150 outline-none',
        'placeholder:text-muted-foreground',
        'hover:border-foreground/30',
        'focus-visible:border-foreground',
        'disabled:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45',
        'aria-invalid:border-destructive',
        'file:text-foreground file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
