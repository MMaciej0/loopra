import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';

export class UserNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.USER_NOT_FOUND, 'User not found');
  }
}
