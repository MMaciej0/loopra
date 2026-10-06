import * as React from 'react';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="card"
      className={cn('bg-card border-border rounded-[14px] border px-[22px] py-5', className)}
      {...props}
    />
  );
}

function CardLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Text variant="label" as="h2" className={cn('text-muted-foreground mb-2.5', className)}>
      {children}
    </Text>
  );
}

export { Card, CardLabel };
