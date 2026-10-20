import { ERROR_TYPES, type ErrorType } from '@loopra/domain';

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

export class RateLimitExceededError extends AppError {
  constructor() {
    super(429, ERROR_TYPES.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded');
  }
}
