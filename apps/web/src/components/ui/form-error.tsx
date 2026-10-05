import type { ComponentProps } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormError({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-destructive-border bg-destructive-bg text-destructive mb-4 flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm',
        className,
      )}
      aria-live="polite"
      {...props}
    >
      <CircleAlert className="size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
