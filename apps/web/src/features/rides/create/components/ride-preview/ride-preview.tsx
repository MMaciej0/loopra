'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { RideCard } from '@/features/rides/components/ride-card/ride-card';
import { Text } from '@/components/ui/text';
import { RideContract } from './ride-contract';
import { SafetyNotice } from './safety-notice';
import { toRideCard } from './to-ride-card';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function RidePreview() {
  const t = useTranslations('CreateRide');
  const { watch } = useFormContext<CreateRideInput>();
  const values = watch();

  return (
    <aside className="sticky top-[26px] hidden max-h-[calc(100svh-11rem)] flex-col gap-3.5 overflow-y-auto lg:flex [&>*]:shrink-0">
      <div className="flex items-center justify-between gap-2">
        <Text variant="label" className="text-muted-foreground flex items-center gap-2">
          <span aria-hidden className="relative flex size-3 shrink-0 items-center justify-center">
            <span className="bg-accent/15 absolute inset-0 rounded-full" />
            <span className="bg-accent/40 absolute inset-0 animate-ping rounded-full motion-reduce:animate-none" />
            <span className="bg-accent shadow-accent/40 relative size-1.5 rounded-full shadow-[0_0_4px_1px]" />
          </span>
          {t('previewLabel')}
        </Text>
        <Text variant="caption" className="text-muted-foreground">
          {t('previewHint')}
        </Text>
      </div>

      <RideCard data={toRideCard(values)} />
      <RideContract values={values} />
      <SafetyNotice />
    </aside>
  );
}
