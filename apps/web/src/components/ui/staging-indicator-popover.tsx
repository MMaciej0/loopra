'use client';

import { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={t('label')}
        className="focus-visible:ring-ring hover:bg-muted group relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2"
      >
        <span
          aria-hidden
          className="bg-accent/40 absolute size-4 rounded-full group-hover:hidden motion-safe:animate-ping"
        />
        <Info aria-hidden className="text-accent-deep relative size-4.5" />
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>{t('title')}</PopoverTitle>
          <PopoverDescription>{t('showcase')}</PopoverDescription>
          <PopoverDescription>{t('rides')}</PopoverDescription>
          <PopoverDescription>{t('data')}</PopoverDescription>
        </PopoverHeader>
        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="text-accent-deep inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          {t('contact')}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
