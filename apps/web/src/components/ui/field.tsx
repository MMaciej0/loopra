import type { ComponentProps, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const fieldSizes = {
  default: 'px-[14px] py-3',
  sm: 'px-3 py-2',
} as const;

export interface FieldProps extends Omit<ComponentProps<'input'>, 'id' | 'size'> {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  size?: keyof typeof fieldSizes;
}

export function Field({
  id,
  label,
  error,
  hint,
  size = 'default',
  className,
  ...inputProps
}: FieldProps) {
  return (
    <div>
      <div className="mb-[6px] flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-muted-foreground font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase"
        >
          {label}
        </label>
        {hint && <span className="text-muted-foreground text-[11px]">{hint}</span>}
      </div>
      <Input
        id={id}
        aria-invalid={!!error}
        className={cn(fieldSizes[size], className)}
        {...inputProps}
      />
      {error && <p className="text-destructive mt-1 text-[11.5px]">{error}</p>}
    </div>
  );
}
