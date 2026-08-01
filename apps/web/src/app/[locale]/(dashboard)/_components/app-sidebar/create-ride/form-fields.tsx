'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { MIN_LEAD_HOURS, TITLE_MIN_LENGTH } from '@/config/ride';
import { DividerHeader } from './divider-header';
import { LocationInput } from './location/input';
import { DateTimeInput } from './date-time-input';
import type { CreateRideInput } from './schema';
import { Separator } from '@/components/ui/separator';
import { BikeTypeInput } from './bike-type-input';
import { RideTypeInput } from './ride-type-input';
import { DropPolicyInput } from './drop-policy-input';

export function FormFields({ onEditLocation }: { onEditLocation: () => void }) {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  return (
    <div>
      <div className="pb-6">
        <DividerHeader text={t('basicsSection')} />
      </div>
      <div className="flex flex-col gap-y-4">
        <Field
          id="title"
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
          size="sm"
          {...register('title')}
          error={errors.title?.message && tErrors(errors.title.message, { min: TITLE_MIN_LENGTH })}
        />

        <div className="flex flex-col gap-y-1.5">
          <LocationInput onOpen={onEditLocation} />
        </div>

        <div className="flex flex-col gap-y-1.5">
          <DateTimeInput />
          {errors.start_time && (
            <p role="alert" className="text-destructive text-[11.5px]">
              {tErrors(errors.start_time.message ?? 'UNKNOWN', { hours: MIN_LEAD_HOURS })}
            </p>
          )}
        </div>
      </div>
      <Separator className="my-6 w-full" />
      <div className="pb-6">
        <DividerHeader text={t('shapeSection')} />
      </div>
      <div className="flex flex-col gap-y-4">
        <BikeTypeInput />
        <RideTypeInput />
      </div>
      <Separator className="my-6 w-full" />
      <div className="pb-6">
        <DividerHeader text={t('policySection')} />
      </div>
      <div className="flex flex-col gap-y-4">
        <DropPolicyInput />
      </div>
    </div>
  );
}
