'use client';

import { DROP_POLICIES } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { CreateRideInput } from '../../schema';

export function DropPolicyInput() {
  const t = useTranslations('CreateRide');
  const tDropPolicies = useTranslations('DropPolicies');

  return (
    <RadioCardGroup<CreateRideInput>
      name="drop_policy"
      legend={t('dropPolicyLabel')}
      options={DROP_POLICIES.map((option) => ({
        value: option,
        label: tDropPolicies(`${option}.label`),
        description: tDropPolicies(`${option}.description`),
      }))}
    />
  );
}
