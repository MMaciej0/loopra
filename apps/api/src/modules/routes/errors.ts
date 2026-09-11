import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';

export class InvalidGpxError extends AppError {
  constructor(cause?: string) {
    super(400, ERROR_TYPES.INVALID_GPX, 'Invalid GPX file');
    this.cause = cause;
  }
}

export class FileRequiredError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.FILE_REQUIRED, 'File is required');
  }
}
