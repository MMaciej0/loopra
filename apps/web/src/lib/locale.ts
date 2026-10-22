import { SUPPORTED_LOCALES } from '@/i18n/routing';

export const stripLocale = (pathname: string) => {
  const localePattern = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(?=/|$)`);

  return pathname.replace(localePattern, '') || '/';
};

const OPEN_GRAPH_LOCALES: Record<string, string> = {
  en: 'en_US',
  pl: 'pl_PL',
};

export const toOpenGraphLocale = (locale: string) => OPEN_GRAPH_LOCALES[locale] ?? 'en_US';
