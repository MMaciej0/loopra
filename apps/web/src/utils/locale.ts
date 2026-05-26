import { SUPPORTED_LOCALES } from '@/i18n/routing';

export const stripLocale = (pathname: string) => {
  const localePattern = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(?=/|$)`);

  return pathname.replace(localePattern, '') || '/';
};
