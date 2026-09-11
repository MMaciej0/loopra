import type { ErrorType } from '@loopra/domain';

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
