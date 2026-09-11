import type { ZodError } from 'zod';
import { ERROR_TYPES } from '@loopra/domain';

export const FORM_ERROR_TYPES = {
  REQUIRED: 'REQUIRED',
  INVALID_EMAIL: 'INVALID_EMAIL',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_REQUIRES_UPPERCASE: 'PASSWORD_REQUIRES_UPPERCASE',
  PASSWORD_REQUIRES_SPECIAL_CHAR: 'PASSWORD_REQUIRES_SPECIAL_CHAR',
  USERNAME_TOO_SHORT: 'USERNAME_TOO_SHORT',
  TITLE_TOO_SHORT: 'TITLE_TOO_SHORT',
  TITLE_TOO_LONG: 'TITLE_TOO_LONG',
  START_POINT_REQUIRED: 'START_POINT_REQUIRED',
  LOCATION_NAME_REQUIRED: 'LOCATION_NAME_REQUIRED',
  LOCATION_NAME_TOO_LONG: 'LOCATION_NAME_TOO_LONG',
  DATE_REQUIRED: 'DATE_REQUIRED',
  START_TOO_SOON: 'START_TOO_SOON',
  PACE_REQUIRED: 'PACE_REQUIRED',
  PACE_OUT_OF_RANGE: 'PACE_OUT_OF_RANGE',
  MAX_PARTICIPANTS_REQUIRED: 'MAX_PARTICIPANTS_REQUIRED',
  MAX_PARTICIPANTS_OUT_OF_RANGE: 'MAX_PARTICIPANTS_OUT_OF_RANGE',
  DISTANCE_OUT_OF_RANGE: 'DISTANCE_OUT_OF_RANGE',
  UNKNOWN: 'UNKNOWN',
} as const;

export const APP_ERROR_TYPES = {
  ...ERROR_TYPES,
  ...FORM_ERROR_TYPES,
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
