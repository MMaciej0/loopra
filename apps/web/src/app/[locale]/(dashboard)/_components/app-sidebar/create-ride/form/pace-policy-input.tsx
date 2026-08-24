'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { PACE_MAX_KMH, PACE_MIN_KMH, PACE_POLICIES } from '@/config/ride';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { Field } from '@/components/ui/field';
import { CreateRideInput } from '../schema';

export function PacePolicyInput() {
  const t = useTranslations('CreateRide');
  const tPacePolicies = useTranslations('PacePolicies');
  const tErrors = useTranslations('Errors');
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  const pacePolicy = useWatch({ control, name: 'pace_policy' });

  return (
    <>
      <RadioCardGroup<CreateRideInput>
        name="pace_policy"
        legend={t('pacePolicyLabel')}
        options={PACE_POLICIES.map((option) => ({
          value: option,
          label: tPacePolicies(`${option}.label`),
          description: tPacePolicies(`${option}.description`),
        }))}
      />

      {pacePolicy === 'leader' && (
        <Field
          id="average_pace_kmh"
          type="number"
          inputMode="numeric"
          min={PACE_MIN_KMH}
          max={PACE_MAX_KMH}
          label={t('averagePaceLabel')}
          placeholder={t('averagePacePlaceholder')}
          size="sm"
          {...register('average_pace_kmh', {
            setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
          })}
          error={
            errors.average_pace_kmh?.message &&
            tErrors(errors.average_pace_kmh.message, { min: PACE_MIN_KMH, max: PACE_MAX_KMH })
          }
        />
      )}
    </>
  );
}
