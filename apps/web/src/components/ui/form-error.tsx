import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      className="border-destructive-border bg-destructive-bg text-destructive mb-4 flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm"
      aria-live="polite"
    >
      <CircleAlert className="size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
