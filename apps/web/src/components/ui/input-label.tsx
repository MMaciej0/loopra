import { cn } from '@/lib/utils';

export function InputLabel({ id, children, className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      {...props}
      htmlFor={id}
      className={cn(
        'text-muted-foreground font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase',
        className,
      )}
    >
      {children}
    </label>
  );
}
