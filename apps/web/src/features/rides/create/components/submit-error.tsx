'use client';

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FormError } from '@/components/ui/form-error';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function SubmitError() {
  const tErrors = useTranslations('Errors');
  const ref = useRef<HTMLDivElement>(null);
  const {
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  useEffect(() => {
    if (errors.root) ref.current?.scrollIntoView({ block: 'start' });
  }, [errors.root]);

  if (!errors.root) return null;

  return (
    <FormError ref={ref} role="alert" aria-live="assertive" className="mb-0 scroll-mt-24">
      {tErrors(errors.root.message ?? 'UNKNOWN')}
    </FormError>
  );
}
