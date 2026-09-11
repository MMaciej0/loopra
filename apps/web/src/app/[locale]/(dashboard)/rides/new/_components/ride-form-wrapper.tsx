'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { createRide } from '../_actions/action';
import { createRideSchema, type CreateRideInput } from '../schema';

export function RideFormWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const form = useForm<CreateRideInput>({
    resolver: zodResolver(createRideSchema),
    mode: 'onBlur',
    defaultValues: {
      ride_type: 'casual',
      title: '',
      description: '',
      start_location: undefined,
      start_time: undefined,
      start_location_name: '',
      city: '',
      country: '',
      region: '',
      municipality: '',
      postal_code: '',
      full_address: '',
      bike_type: 'any',
      drop_policy: 'no_drop',
      pace_policy: 'slowest_rider',
      average_pace_kmh: undefined,
      formation_policy: 'free',
      experience_policy: 'first_timers',
      max_participants: undefined,
      route: undefined,
      distance_km: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await createRide(data);
    if (!result.ok) {
      form.setError('root', { message: result.errorType });
      return;
    }
    router.push('/rides');
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col">
        {children}
      </form>
    </FormProvider>
  );
}
