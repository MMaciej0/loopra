import type { ZodError } from 'zod';
import { APP_ERROR_TYPES, isAppErrorType, type AppErrorType } from '@loopra/domain';

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
