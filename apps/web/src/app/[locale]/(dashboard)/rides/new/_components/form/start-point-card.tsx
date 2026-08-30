'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LocationPicker } from './location/picker';
import { StartPointName } from './location/start-point-name';
import type { CreateRideInput } from '../../schema';

const LOCATION_FIELDS = [
  'start_location',
  'city',
  'country',
  'region',
  'municipality',
  'postal_code',
  'full_address',
] as const;

export function StartPointCard() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const [open, setOpen] = useState(false);
  const {
    control,
    trigger,
    getValues,
    resetField,
    formState: { errors },
  } = useFormContext<CreateRideInput>();

  const startLocation = useWatch({ control, name: 'start_location' });
  const name = useWatch({ control, name: 'start_location_name' });
  const fullAddress = useWatch({ control, name: 'full_address' });

  const picked = Boolean(startLocation);
  const canConfirm = picked && Boolean(name?.trim());

  const onConfirm = async () => {
    if (await trigger('start_location_name')) setOpen(false);
  };

  // closing without a name means the pick was never committed — drop it
  const onOpenChange = (next: boolean) => {
    if (!next && !getValues('start_location_name')?.trim()) {
      LOCATION_FIELDS.forEach((field) => resetField(field));
    }
    setOpen(next);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="bg-secondary border-border hover:border-border-strong flex w-full items-center gap-3 rounded-[10px] border px-[13px] py-[11px] text-left transition-colors duration-150"
          >
            <span
              aria-hidden
              className={cn(
                'flex size-[34px] shrink-0 items-center justify-center rounded-[9px]',
                picked ? 'bg-accent text-[#0d0f12]' : 'bg-muted text-muted-foreground',
              )}
            >
              <MapPin className="size-4" />
            </span>

            <span className="min-w-0 flex-1">
              {picked ? (
                <>
                  <Text variant="body-m" className="truncate text-sm font-semibold">
                    {name || t('locationEmpty')}
                  </Text>
                  <Text variant="body-xs" className="text-muted-foreground mt-px truncate">
                    {fullAddress || t('locationHint')}
                  </Text>
                </>
              ) : (
                <Text variant="body-s" className="text-muted-foreground">
                  {t('locationEmpty')}
                </Text>
              )}
            </span>

            <Text variant="body-xs" className="text-accent-deep shrink-0 font-semibold">
              {picked ? t('changeStartPoint') : t('pickOnMap')}
            </Text>
          </button>
        </DialogTrigger>

        <DialogContent
          className="grid h-[min(90svh,760px)] grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-0 p-0 sm:max-w-3xl lg:max-w-4xl"
          buttonClassName="top-4 right-4"
        >
          <DialogHeader className="border-border shrink-0 border-b px-5 pt-5 pb-4">
            <DialogSubheader>{t('startPointSection')}</DialogSubheader>
            <DialogTitle>{t('locationTitle')}</DialogTitle>
            <DialogDescription className="sr-only">{t('startPointSectionSub')}</DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-col">
            <LocationPicker />
          </div>

          <div className="border-border bg-secondary shrink-0 border-t px-4 py-3.5">
            <StartPointName />
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="button" variant="accent" disabled={!canConfirm} onClick={onConfirm}>
              {t('useStartPoint')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {errors.start_location_name && (
        <p role="alert" className="text-destructive mt-1.5 text-[11.5px]">
          {tErrors(errors.start_location_name.message ?? 'UNKNOWN')}
        </p>
      )}
    </div>
  );
}
