'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { MAX_PARTICIPANTS_MAX, MAX_PARTICIPANTS_MIN } from '@/config/ride';
import type { CreateRideInput } from '../../schema';

export function MaxParticipantsInput() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <Field
      id="max_participants"
      type="number"
      inputMode="numeric"
      min={MAX_PARTICIPANTS_MIN}
      max={MAX_PARTICIPANTS_MAX}
      label={t('maxParticipantsLabel')}
      placeholder={t('maxParticipantsPlaceholder')}
      hint={t('maxParticipantsHint', {
        min: MAX_PARTICIPANTS_MIN,
        max: MAX_PARTICIPANTS_MAX,
      })}
      size="sm"
      {...register('max_participants', {
        setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
      })}
      error={
        errors.max_participants?.message &&
        tErrors(errors.max_participants.message, {
          min: MAX_PARTICIPANTS_MIN,
          max: MAX_PARTICIPANTS_MAX,
        })
      }
    />
  );
}
