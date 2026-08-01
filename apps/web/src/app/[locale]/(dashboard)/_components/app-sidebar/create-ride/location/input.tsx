'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { InputLabel } from '@/components/ui/input-label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { Text } from '@/components/ui/text';
import type { CreateRideInput } from '../schema';

export function LocationInput({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    watch,
    formState: { errors },
  } = useFormContext<CreateRideInput>();
  const name = watch('start_location_name');
  const full_address = watch('full_address');

  return (
    <>
      <InputLabel id="start_location" className="flex items-center">
        <span className="inline-flex pr-2">
          <MapPin className="size-2.5" />
        </span>
        {t('locationLabel')}
      </InputLabel>
      <Button type="button" variant="outline" onClick={onOpen} className="justify-start gap-x-2">
        <span className="border-accent bg-accent flex size-10 items-center justify-center rounded-xl text-[#0d0f12]">
          <MapPin className="size-5" />
        </span>
        <span className="flex flex-col">
          <Text variant="body-m" className="text-start">
            {errors.start_location_name ? (
              <span className="text-destructive">
                {tErrors(errors.start_location_name.message ?? 'UNKNOWN')}
              </span>
            ) : (
              name || t('locationEmpty')
            )}
          </Text>
          <Text variant="body-xs" className="text-muted-foreground text-start">
            {full_address ? full_address : t('locationHint')}
          </Text>
        </span>
      </Button>
    </>
  );
}
