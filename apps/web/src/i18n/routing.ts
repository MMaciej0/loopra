import { defineRouting } from 'next-intl/routing';
import { LOCALES } from '@loopra/domain';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
