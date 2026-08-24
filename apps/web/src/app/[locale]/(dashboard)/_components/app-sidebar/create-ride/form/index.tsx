'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type CreateRideInput } from '../schema';
import { createRide } from '../_actions/action';
import { DetailsView } from './details-view';
import { LocationView } from './location-view';

type View = 'form' | 'location';

export function RideForm() {
  const [view, setView] = useState<View>('form');
  const form = useFormContext<CreateRideInput>();

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    const result = await createRide(data);
    if (!result.ok) {
      form.setError('root', { message: result.errorType });
      return;
    }
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
      {view === 'form' ? (
        <DetailsView onEditLocation={() => setView('location')} />
      ) : (
        <LocationView onClose={() => setView('form')} />
      )}
    </form>
  );
}
