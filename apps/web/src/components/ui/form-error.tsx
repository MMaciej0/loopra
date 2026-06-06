import type { ReactNode } from 'react';

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className="text-destructive mb-4 text-sm" aria-live="polite">
      {children}
    </p>
  );
}
