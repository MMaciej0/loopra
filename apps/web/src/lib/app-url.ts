import { APP_URLS, type AppUrl } from '@loopra/domain';

function isAppUrl(value: string | undefined): value is AppUrl {
  return APP_URLS.some((appUrl) => appUrl === value);
}

export function getAppUrl(): URL {
  const value = process.env.APP_URL;

  if (!isAppUrl(value)) {
    throw new Error(`APP_URL must be one of ${APP_URLS.join(', ')}, got ${value}`);
  }

  return new URL(value);
}
