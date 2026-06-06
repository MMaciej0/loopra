import type { ComponentProps, ReactNode } from 'react';
import { Input } from '@/components/ui/input';

export interface FieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
}

export function Field({ id, label, error, hint, ...inputProps }: FieldProps) {
  return (
    <div className="mb-[14px]">
      <div className="mb-[6px] flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
        >
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <Input id={id} aria-invalid={!!error} {...inputProps} />
      {error && <p className="mt-1 text-[11.5px] text-destructive">{error}</p>}
    </div>
  );
}
