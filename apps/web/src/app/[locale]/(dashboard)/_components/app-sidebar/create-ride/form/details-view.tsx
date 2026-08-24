'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FormFields } from './fields';
import { type CreateRideInput } from '../schema';

export function DetailsView({ onEditLocation }: { onEditLocation: () => void }) {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const {
    formState: { errors, isSubmitting },
  } = useFormContext<CreateRideInput>();

  return (
    <>
      <DialogHeader className="shrink-0 p-4 md:px-7.5 md:pt-5.5">
        <DialogSubheader>{t('eyebrow')}</DialogSubheader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('description')}</DialogDescription>
      </DialogHeader>
      <Separator className="shrink-0" />
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:px-7.5 md:pt-5.5">
        <FormFields onEditLocation={onEditLocation} />
      </div>
      {errors.root && (
        <p role="alert" className="text-destructive px-4 pb-2 text-[11.5px] md:px-7.5">
          {tErrors(errors.root.message ?? 'UNKNOWN')}
        </p>
      )}
      <DialogFooter className="mx-0 mb-0 shrink-0 md:px-7.5">
        <DialogClose asChild>
          <Button variant="ghost" type="button">
            {t('cancel')}
          </Button>
        </DialogClose>
        <Button type="submit" loading={isSubmitting}>
          {t('submit')}
        </Button>
      </DialogFooter>
    </>
  );
}
