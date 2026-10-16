const APP_ENVS = ['development', 'staging', 'production'] as const;

export type AppEnv = (typeof APP_ENVS)[number];

function isAppEnv(value: string | undefined): value is AppEnv {
  return APP_ENVS.some((appEnv) => appEnv === value);
}

export function getAppEnv(): AppEnv {
  const value = process.env.APP_ENV;

  if (!isAppEnv(value)) {
    throw new Error(`APP_ENV must be one of ${APP_ENVS.join(', ')}, got ${value}`);
  }

  return value;
}
