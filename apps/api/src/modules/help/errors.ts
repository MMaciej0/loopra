import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';

export class HelpAnswerNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.HELP_ANSWER_NOT_FOUND, 'Help answer not found');
  }
}
