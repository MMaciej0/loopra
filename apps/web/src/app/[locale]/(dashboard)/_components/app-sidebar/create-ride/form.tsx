'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { createRideSchema, type CreateRideInput } from './schema';
import { createRide } from './_actions/action';
import { FormFields } from './form-fields';
import { LocationPicker } from './location/picker';

type View = 'form' | 'location';

export function RideForm() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const [view, setView] = useState<View>('form');
  const form = useForm<CreateRideInput>({
    resolver: zodResolver(createRideSchema),
    mode: 'onBlur',
    defaultValues: {
      ride_type: 'casual',
      title: '',
      start_location: undefined,
      start_location_name: '',
      city: '',
      country: '',
      region: '',
      municipality: '',
      postal_code: '',
      full_address: '',
      bike_type: 'all',
      drop_policy: 'no_drop',
    },
  });

  const startLocation = useWatch({ control: form.control, name: 'start_location' });
  const startLocationName = useWatch({ control: form.control, name: 'start_location_name' });

  const canUseStartPoint = Boolean(startLocation) && Boolean(startLocationName?.trim());

  const onUseStartPoint = async () => {
    const valid = await form.trigger('start_location_name');
    if (valid) setView('form');
  };

  const onBack = () => {
    if (!form.getValues('start_location_name')?.trim()) {
      form.resetField('start_location');
      form.resetField('city');
      form.resetField('country');
      form.resetField('region');
      form.resetField('municipality');
      form.resetField('postal_code');
      form.resetField('full_address');
    }
    setView('form');
  };

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    const result = await createRide(data);
    if (!result.ok) {
      form.setError('root', { message: result.errorType });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
        <DialogHeader className="shrink-0 p-4 md:px-7.5 md:pt-5.5">
          <DialogSubheader>
            {view === 'form' ? (
              t('eyebrow')
            ) : (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex cursor-pointer items-center gap-x-2"
              >
                <ArrowLeft aria-hidden size={12} /> {t('backToDetails')}
              </button>
            )}
          </DialogSubheader>
          <DialogTitle>{view === 'form' ? t('title') : t('locationTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('description')}</DialogDescription>
        </DialogHeader>
        <Separator className="shrink-0" />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:px-7.5 md:pt-5.5">
          {view === 'form' ? (
            <FormFields onEditLocation={() => setView('location')} />
          ) : (
            <LocationPicker />
          )}
        </div>
        {form.formState.errors.root && (
          <p role="alert" className="text-destructive px-4 pb-2 text-[11.5px] md:px-7.5">
            {tErrors(form.formState.errors.root.message ?? 'UNKNOWN')}
          </p>
        )}
        <DialogFooter className="mx-0 mb-0 shrink-0 md:px-7.5">
          {view === 'location' ? (
            <Button type="button" variant="ghost" onClick={onBack}>
              {t('back')}
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="ghost" type="button">
                {t('cancel')}
              </Button>
            </DialogClose>
          )}
          {view === 'location' ? (
            <Button
              type="button"
              variant="accent"
              onClick={onUseStartPoint}
              disabled={!canUseStartPoint}
            >
              {t('useStartPoint')}
              <ArrowRight />
            </Button>
          ) : (
            <Button type="submit" loading={form.formState.isSubmitting}>
              {t('submit')}
            </Button>
          )}
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
