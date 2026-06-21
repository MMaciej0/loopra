'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { InputLabel } from '@/components/ui/input-label';
import { Text } from '@/components/ui/text';
import { Clock, MapPin } from 'lucide-react';
import { DividerHeader } from './divider-header';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function CreateRideForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <form>
      <div>
        <div className="pb-6">
          <DividerHeader text="THE BASICS" />
        </div>
        <div className="flex flex-col gap-y-4">
          <Field
            id="title"
            label="Ride Title"
            placeholder="e.g. Sunday Coffee Ride to your favorite cafe"
            size="sm"
          />

          <div className="flex flex-col gap-y-1.5">
            <InputLabel id="location" className="flex items-center">
              <span className="inline-flex pr-2">
                <MapPin className="size-2.5" />
              </span>
              WHERE (MEETUP START POINT)
            </InputLabel>
            <Button variant="outline" className="justify-start gap-x-2">
              <span className="border-accent bg-accent flex size-10 items-center justify-center rounded-xl text-[#0d0f12]">
                <MapPin className="size-5" />
              </span>
              <span className="flex flex-col">
                <Text variant="body-m" className="text-start">
                  Begatela Tram Stop
                </Text>
                <Text variant="body-xs" className="text-muted-foreground">
                  123 Main St, San Francisco, CA
                </Text>
              </span>
            </Button>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <InputLabel id="location" className="flex items-center">
              <span className="inline-flex pr-2">
                <Clock className="size-2.5" />
              </span>
              WHEN
            </InputLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start gap-x-2 font-normal">
                  {date ? (
                    format(date, "PPP 'at' HH:mm")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="flex flex-col items-center gap-3">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (!d) return setDate(undefined);
                    // keep current time when changing the day
                    if (date) {
                      d.setHours(date.getHours(), date.getMinutes());
                    }
                    setDate(d);
                  }}
                  autoFocus
                />
                <div className="flex w-full items-center gap-x-2 border-t pt-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={date ? format(date, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      const next = date ? new Date(date) : new Date();
                      next.setHours(h, m);
                      setDate(next);
                    }}
                    className="flex-1 rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </form>
  );
}
