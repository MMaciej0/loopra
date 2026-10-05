'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Text } from '@/components/ui/text';
import type { CreateRideInput } from '@/features/rides/create/schema';

interface RideContractProps {
  values: CreateRideInput;
}

export function RideContract({ values }: RideContractProps) {
  const t = useTranslations('CreateRide');
  const tDrop = useTranslations('DropPolicies');
  const tPace = useTranslations('PacePolicies');
  const tFormation = useTranslations('FormationPolicies');
  const tExperience = useTranslations('ExperiencePolicies');

  const paceDescription = tPace(`${values.pace_policy}.description`);

  const items = [
    tDrop(`${values.drop_policy}.description`),
    values.average_pace_kmh !== undefined
      ? `${paceDescription} ${t('contractPace', { value: values.average_pace_kmh })}`
      : paceDescription,
    tFormation(`${values.formation_policy}.description`),
    tExperience(`${values.experience_policy}.description`),
  ];

  return (
    <section className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4">
      <Text variant="label" className="text-muted-foreground">
        {t('contractHeading')}
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
