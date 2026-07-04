'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { CreateRideInput } from '../schema';

const PLACEHOLDER = {
  start_location: { x: 19.9275, y: 50.0616 },
  start_location_name: 'Bagatela Tram Stop',
  city: 'Kraków',
  country: 'PL',
};

export function LocationPicker({ onDone }: { onDone: () => void }) {
  const { setValue } = useFormContext<CreateRideInput>();

  const pick = () => {
    setValue('start_location', PLACEHOLDER.start_location, { shouldValidate: true });
    setValue('start_location_name', PLACEHOLDER.start_location_name, { shouldValidate: true });
    setValue('city', PLACEHOLDER.city, { shouldValidate: true });
    setValue('country', PLACEHOLDER.country, { shouldValidate: true });
    onDone();
  };

  return (
    // min-h-full fills the scroll body; map region flex-1 takes the leftover space
    <div className="flex min-h-full flex-col gap-3">
      <input
        type="text"
        placeholder="Search a place…"
        className="focus-visible:ring-ring/50 w-full shrink-0 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
      />
      <div className="bg-muted flex min-h-0 flex-1 items-center justify-center rounded-[10px]">
        <Text variant="body-xs" className="text-muted-foreground">
          Map — coming soon
        </Text>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="button" onClick={pick}>
          Use Bagatela
        </Button>
      </div>
    </div>
  );
}
