'use client';

import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
export function StagingIndicatorPopover() {
  const t = useTranslations('StagingIndicator');

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t('label')}
        className="focus-visible:ring-ring relative flex size-7 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2"
      >
        <span
          aria-hidden
          className="bg-accent absolute size-2.5 rounded-full motion-safe:animate-ping"
        />
        <span aria-hidden className="bg-accent relative size-2.5 rounded-full" />
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>{t('title')}</PopoverTitle>
          <PopoverDescription>{t('showcase')}</PopoverDescription>
          <PopoverDescription>{t('rides')}</PopoverDescription>
          <PopoverDescription>{t('data')}</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
