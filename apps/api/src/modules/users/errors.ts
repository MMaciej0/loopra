import { ERROR_TYPES, MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';

export class UserNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.USER_NOT_FOUND, 'User not found');
  }
}

export class MaxFavoriteLocationsError extends AppError {
  constructor() {
    super(
      409,
      ERROR_TYPES.MAX_FAVORITE_LOCATIONS,
      `A rider can save at most ${MAX_FAVORITE_LOCATIONS} favourite locations`,
    );
  }
}

export class DuplicateFavoriteLocationError extends AppError {
  constructor() {
    super(409, ERROR_TYPES.DUPLICATE_FAVORITE_LOCATION, 'This place is already saved');
  }
}

export class FavoriteLocationNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.FAVORITE_LOCATION_NOT_FOUND, 'Favourite location not found');
  }
}
