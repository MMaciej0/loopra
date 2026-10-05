'use client';

import { EXPERIENCE_POLICIES } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { CreateRideInput } from '@/features/rides/create/schema';

export function ExperiencePolicyInput() {
  const t = useTranslations('CreateRide');
  const tExperiencePolicies = useTranslations('ExperiencePolicies');

  return (
    <RadioCardGroup<CreateRideInput>
      name="experience_policy"
      legend={t('experiencePolicyLabel')}
      options={EXPERIENCE_POLICIES.map((option) => ({
        value: option,
        label: tExperiencePolicies(`${option}.label`),
        description: tExperiencePolicies(`${option}.description`),
      }))}
    />
  );
}
