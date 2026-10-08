'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

interface LanguageSwitchLinkProps {
  query?: Record<string, string>;
}

function LanguageSwitchLink({ query }: LanguageSwitchLinkProps) {
  const t = useTranslations('LanguageSwitch');
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = routing.locales.find((candidate) => candidate !== locale) ?? locale;

  return (
    <Button variant="ghost" size="sm" asChild className="font-data">
      <Link href={{ pathname, query }} locale={otherLocale}>
        {otherLocale.toUpperCase()}
        <span className="sr-only">, {t('label')}</span>
      </Link>
    </Button>
  );
}

function LanguageSwitchLinkWithQuery() {
  const searchParams = useSearchParams();

  return <LanguageSwitchLink query={Object.fromEntries(searchParams)} />;
}

export function LanguageSwitch() {
  return (
    <Suspense fallback={<LanguageSwitchLink />}>
      <LanguageSwitchLinkWithQuery />
    </Suspense>
  );
}
