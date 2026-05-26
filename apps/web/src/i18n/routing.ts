import { defineRouting } from 'next-intl/routing';

export const SUPPORTED_LOCALES = ['en', 'pl'];

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
