'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';

export function SafetyNotice() {
  const t = useTranslations('CreateRide');

  const points = [
    t('safetyResponsibility'),
    t('safetyRoadRules'),
    t('safetyBike'),
    t('safetyHelmet'),
    t('safetyMinors'),
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-card border-accent-deep/25 hover:border-accent-deep/50 flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors duration-150"
        >
          <ShieldCheck aria-hidden className="text-accent-deep size-4 shrink-0" />
          <Text variant="label" className="text-accent-deep">
            {t('safetyHeading')}
          </Text>
          <ChevronRight aria-hidden className="text-muted-foreground ml-auto size-3.5 shrink-0" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogSubheader>{t('safetyHeading')}</DialogSubheader>
          <DialogTitle>{t('safetyDialogTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('safetySummary')}</DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2.5">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="bg-accent-deep/60 mt-[7px] size-1.5 shrink-0 rounded-full"
              />
              <Text variant="body-s" className="text-foreground/85">
                {point}
              </Text>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
