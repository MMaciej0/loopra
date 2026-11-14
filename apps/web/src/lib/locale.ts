import { LOCALES } from '@loopra/domain';

export const stripLocale = (pathname: string) => {
  const localePattern = new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`);

  return pathname.replace(localePattern, '') || '/';
};

const OPEN_GRAPH_LOCALES: Record<string, string> = {
  en: 'en_US',
  pl: 'pl_PL',
};

export const toOpenGraphLocale = (locale: string) => OPEN_GRAPH_LOCALES[locale] ?? 'en_US';
