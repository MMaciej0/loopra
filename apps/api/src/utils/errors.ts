export const ErrorType = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_INPUT: 'INVALID_INPUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  STALE_TOKEN: 'STALE_TOKEN',
  OAUTH_ONLY_ACCOUNT: 'OAUTH_ONLY_ACCOUNT',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_UPDATE_BAD_BODY: 'EVENT_UPDATE_BAD_BODY',
  EVENT_HAS_PARTICIPANTS: 'EVENT_HAS_PARTICIPANTS',
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly type: ErrorType,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}
