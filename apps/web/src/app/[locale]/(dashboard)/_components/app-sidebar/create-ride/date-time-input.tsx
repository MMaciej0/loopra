'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { InputLabel } from '@/components/ui/input-label';
import { Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CreateRideInput } from './schema';

export function DateTimeInput() {
  const { control } = useFormContext<CreateRideInput>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <InputLabel id="start_time" className="flex items-center">
        <span className="inline-flex pr-2">
          <Clock className="size-2.5" />
        </span>
        WHEN
      </InputLabel>
      <Controller
        control={control}
        name="start_time"
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="justify-start gap-x-2 font-normal">
                {field.value ? (
                  format(field.value, "PPP 'at' HH:mm")
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="flex flex-col items-center gap-3">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(d) => {
                  if (!d) return field.onChange(undefined);
                  // keep current time when changing the day
                  if (field.value) {
                    d.setHours(field.value.getHours(), field.value.getMinutes());
                  }
                  field.onChange(d);
                }}
                autoFocus
              />
              <div className="flex w-full items-center gap-x-2 border-t pt-3">
                <Clock className="text-muted-foreground size-4" />
                <input
                  type="time"
                  value={field.value ? format(field.value, 'HH:mm') : ''}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const next = field.value ? new Date(field.value) : new Date();
                    next.setHours(h, m);
                    field.onChange(next);
                  }}
                  className="focus-visible:ring-ring/50 flex-1 rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      />
    </>
  );
}
