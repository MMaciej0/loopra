import type { ReactNode } from 'react';
import { Text } from '@/components/ui/text';

export function AuthHeader({
  eyebrow,
  heading,
  description,
}: {
  eyebrow: string;
  heading: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="mb-[28px] flex flex-col gap-[10px]">
      <Text variant="label" className="text-muted-foreground">
        {eyebrow}
      </Text>
      <Text variant="heading-xl" as="h1">
        {heading}
      </Text>
      {description && (
        <Text variant="body-s" className="text-muted-foreground">
          {description}
        </Text>
      )}
    </header>
  );
}
