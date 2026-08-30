'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { TITLE_MAX_LENGTH, TITLE_MIN_LENGTH } from '@/config/ride';
import type { CreateRideInput } from '../../schema';

export function TitleInput() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <Field
      id="title"
      label={t('titleLabel')}
      placeholder={t('titlePlaceholder')}
      size="sm"
      maxLength={TITLE_MAX_LENGTH}
      {...register('title')}
      error={errors.title?.message && tErrors(errors.title.message, { min: TITLE_MIN_LENGTH })}
    />
  );
}
