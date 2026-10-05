'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function PageBar() {
  const t = useTranslations('CreateRide');
  const router = useRouter();
  const {
    formState: { isSubmitting },
  } = useFormContext<CreateRideInput>();

  const onCancel = () => router.push('/rides');

  return (
    <div className="border-border bg-background sticky top-0 z-20 -mx-2 flex min-h-[68px] shrink-0 items-center gap-3 border-b px-4 py-3 md:-mx-4 md:gap-4 md:px-7 md:py-0">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onCancel}
        aria-label={t('back')}
        className="size-[34px] shrink-0"
      >
        <ArrowLeft className="size-[17px]" />
      </Button>

      <div className="min-w-0 flex-1">
        <Text variant="label" className="text-muted-foreground hidden md:block">
          {t('pageEyebrow')}
        </Text>
        <Text variant="heading-l" as="h1" className="truncate text-base md:mt-px md:text-[21px]">
          {t('title')}
        </Text>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3.5">
        <Button type="button" variant="ghost" onClick={onCancel} className="hidden sm:inline-flex">
          {t('cancel')}
        </Button>
        <Button type="submit" variant="accent" loading={isSubmitting} className="px-3 md:px-4">
          {t('submit')}
          <ArrowRight className="hidden md:block" />
        </Button>
      </div>
    </div>
  );
}
