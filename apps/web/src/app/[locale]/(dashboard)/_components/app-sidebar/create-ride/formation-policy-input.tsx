import { FORMATION_POLICIES } from '@/config/ride';
import { useTranslations } from 'next-intl';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { CreateRideInput } from './schema';

export function FormationPolicyInput() {
  const t = useTranslations('CreateRide');
  const tFormationPolicies = useTranslations('FormationPolicies');

  return (
    <RadioCardGroup<CreateRideInput>
      name="formation_policy"
      legend={t('formationPolicyLabel')}
      options={FORMATION_POLICIES.map((option) => ({
        value: option,
        label: tFormationPolicies(`${option}.label`),
        description: tFormationPolicies(`${option}.description`),
      }))}
    />
  );
}
