import { useTranslations } from 'next-intl';
import type { DropPolicy, ExperiencePolicy, FormationPolicy, PacePolicy } from '@loopra/domain';

export interface ContractPolicies {
  drop_policy: DropPolicy;
  pace_policy: PacePolicy;
  formation_policy: FormationPolicy;
  experience_policy: ExperiencePolicy;
  average_pace_kmh?: number | null;
}

export function useContractLines({
  drop_policy,
  pace_policy,
  formation_policy,
  experience_policy,
  average_pace_kmh,
}: ContractPolicies): string[] {
  const t = useTranslations('RideContract');
  const tDrop = useTranslations('DropPolicies');
  const tPace = useTranslations('PacePolicies');
  const tFormation = useTranslations('FormationPolicies');
  const tExperience = useTranslations('ExperiencePolicies');

  const paceDescription = tPace(`${pace_policy}.description`);

  return [
    tDrop(`${drop_policy}.description`),
    average_pace_kmh != null
      ? `${paceDescription} ${t('pace', { value: average_pace_kmh })}`
      : paceDescription,
    tFormation(`${formation_policy}.description`),
    tExperience(`${experience_policy}.description`),
  ];
}
