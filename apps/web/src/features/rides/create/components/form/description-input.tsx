'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function DescriptionInput() {
  const t = useTranslations('CreateRide');
  const { register } = useFormContext<CreateRideInput>();

  return (
    <Textarea
      id="description"
      aria-label={t('additionalInfoSection')}
      placeholder={t('descriptionPlaceholder')}
      className="bg-secondary font-ui hover:border-foreground/30 focus-visible:border-foreground min-h-32 rounded-[10px] px-3 py-2 transition-[border-color] duration-150 focus-visible:ring-0 md:text-sm"
      {...register('description')}
    />
  );
}
