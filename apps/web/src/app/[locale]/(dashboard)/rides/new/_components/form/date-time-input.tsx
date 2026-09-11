'use client';

import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { InputLabel } from '@/components/ui/input-label';
import { Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MIN_LEAD_HOURS } from '@loopra/domain';
import type { CreateRideInput } from '../../schema';

export function DateTimeInput() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateRideInput>();
  const [open, setOpen] = useState(false);

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + MIN_LEAD_HOURS);

  return (
    <div className="flex flex-col gap-y-1.5">
      <InputLabel id="start_time" className="flex items-center">
        <span className="inline-flex pr-2">
          <Clock className="size-2.5" />
        </span>
        {t('whenLabel')}
      </InputLabel>
      <Controller
        control={control}
        name="start_time"
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="justify-start gap-x-2 font-normal">
                {field.value ? (
                  format(field.value, 'dd/MM/yyyy HH:mm')
                ) : (
                  <span className="text-muted-foreground">{t('datePlaceholder')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="flex flex-col items-center gap-3">
              <Calendar
                mode="single"
                selected={field.value}
                disabled={{ before: minDate }}
                onSelect={(d) => {
                  if (!d) return field.onChange(undefined);
                  const next = new Date(d);
                  const base = field.value ?? minDate;
                  next.setHours(base.getHours(), base.getMinutes());
                  if (next.getTime() < minDate.getTime()) {
                    next.setHours(minDate.getHours(), minDate.getMinutes());
                  }
                  field.onChange(next);
                }}
                autoFocus
              />
              <div className="flex w-full items-center gap-x-2 border-t pt-3">
                <Clock className="text-muted-foreground size-4" />
                <input
                  type="time"
                  value={field.value ? format(field.value, 'HH:mm') : ''}
                  min={
                    field.value && isSameDay(field.value, minDate)
                      ? format(minDate, 'HH:mm')
                      : undefined
                  }
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const next = field.value ? new Date(field.value) : new Date(minDate);
                    next.setHours(h, m);
                    if (next.getTime() < minDate.getTime()) {
                      next.setHours(minDate.getHours(), minDate.getMinutes());
                    }
                    field.onChange(next);
                  }}
                  className="focus-visible:ring-ring/50 flex-1 rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      />
      {errors.start_time && (
        <p role="alert" className="text-destructive text-[11.5px]">
          {tErrors(errors.start_time.message ?? 'UNKNOWN', { hours: MIN_LEAD_HOURS })}
        </p>
      )}
    </div>
  );
}
