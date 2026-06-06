import type { ZodError } from 'zod';

export const APP_ERROR_TYPES = {
  REQUIRED: 'REQUIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  STALE_TOKEN: 'STALE_TOKEN',
  INVALID_EMAIL: 'INVALID_EMAIL',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  OAUTH_ONLY_ACCOUNT: 'OAUTH_ONLY_ACCOUNT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type AppErrorType = (typeof APP_ERROR_TYPES)[keyof typeof APP_ERROR_TYPES];

export type AppValidationFieldErrors<
  TData extends object,
  TError extends AppErrorType = AppErrorType,
> = Partial<Record<Extract<keyof TData, string>, TError[]>>;

export function getZodValidationErrorTypes<TData extends object>(
  errors: ZodError<TData>,
): AppValidationFieldErrors<TData> {
  const fieldErrors: AppValidationFieldErrors<TData> = {};

  for (const issue of errors.issues) {
    const rawField = issue.path[0];

    if (typeof rawField !== 'string') {
      continue;
    }

    const field = rawField as Extract<keyof TData, string>;

    const errorType = isAppErrorType(issue.message) ? issue.message : APP_ERROR_TYPES.UNKNOWN;

    fieldErrors[field] = [...(fieldErrors[field] ?? []), errorType];
  }

  return fieldErrors;
}

export function isAppErrorType(value: unknown): value is AppErrorType {
  return Object.values(APP_ERROR_TYPES).includes(value as AppErrorType);
}
