'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { useContractLines } from '@/features/rides/components/use-contract-lines';
import type { CreateRideInput } from '@/features/rides/create/schema';

interface RideContractProps {
  values: CreateRideInput;
}

export function RideContract({ values }: RideContractProps) {
  const t = useTranslations('RideContract');
  const items = useContractLines(values);

  return (
    <section className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4">
      <Text variant="label" className="text-muted-foreground">
        {t('heading')}
      </Text>

      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="bg-accent mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
              <Check aria-hidden className="text-accent-foreground size-3" strokeWidth={3} />
            </span>
            <Text variant="body-s" className="text-foreground">
              {item}
            </Text>
          </li>
        ))}
      </ul>
    </section>
  );
}
