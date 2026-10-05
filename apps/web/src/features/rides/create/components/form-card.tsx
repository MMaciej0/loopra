import type { ReactNode } from 'react';
import { Text } from '@/components/ui/text';

interface FormCardProps {
  title: string;
  sub?: string;
  children: ReactNode;
}

export function FormCard({ title, sub, children }: FormCardProps) {
  return (
    <section className="border-border bg-background rounded-2xl border px-5 pt-[18px] pb-5">
      <div className="mb-[15px]">
        <Text
          variant="label"
          as="h2"
          className="text-foreground text-[11px] font-semibold tracking-[0.16em] uppercase"
        >
          {title}
        </Text>
        {sub && (
          <Text variant="body-xs" className="text-muted-foreground mt-1">
            {sub}
          </Text>
        )}
      </div>
      <div className="flex flex-col gap-y-4">{children}</div>
    </section>
  );
}
