import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, ERROR_TYPES.UNAUTHORIZED, 'Unauthorized');
  }
}

export class RateLimitExceededError extends AppError {
  constructor() {
    super(429, ERROR_TYPES.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded');
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super(409, ERROR_TYPES.USER_ALREADY_EXISTS, 'User already exists');
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.USER_NOT_FOUND, 'User not found');
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, ERROR_TYPES.INVALID_CREDENTIALS, 'Invalid credentials');
  }
}

export class OAuthAccountExistsError extends AppError {
  constructor() {
    super(
      409,
      ERROR_TYPES.OAUTH_ONLY_ACCOUNT,
      'This email is registered via Google. Please log in with Google.',
    );
  }
}

export class OAuthLoginRequiredError extends AppError {
  constructor() {
    super(
      401,
      ERROR_TYPES.OAUTH_ONLY_ACCOUNT,
      'This account uses Google sign-in. Please log in with Google.',
    );
  }
}

export class OAuthOnlyAccountError extends AppError {
  constructor() {
    super(
      409,
      ERROR_TYPES.OAUTH_ONLY_ACCOUNT,
      'This account uses Google sign-in and has no password.',
    );
  }
}

export class InvalidPasswordError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.INVALID_PASSWORD, 'Invalid password');
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super(401, ERROR_TYPES.INVALID_TOKEN, 'Invalid token');
  }
}

export class InvalidResetTokenError extends AppError {
  constructor() {
    super(401, ERROR_TYPES.INVALID_TOKEN, 'Invalid token');
  }
}

export class InvalidEmailVerificationTokenError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.INVALID_TOKEN, 'Invalid or expired verification token');
  }
}
