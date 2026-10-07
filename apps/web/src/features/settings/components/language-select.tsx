'use client';

import { useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { InputLabel } from '@/components/ui/input-label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
};

export function LanguageSelect() {
  const t = useTranslations('SettingsPage.appearance');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <InputLabel id={id}>{t('languageLabel')}</InputLabel>
      <Select value={locale} onValueChange={(next) => router.replace(pathname, { locale: next })}>
        <SelectTrigger id={id} className="w-full min-w-0 data-[size=default]:h-10 sm:w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {routing.locales.map((option) => (
            <SelectItem key={option} value={option}>
              {LANGUAGE_NAMES[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
