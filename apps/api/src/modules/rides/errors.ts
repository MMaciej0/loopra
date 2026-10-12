import { ERROR_TYPES } from '@loopra/domain';
import { AppError } from '../../utils/errors.js';

export class RideNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.RIDE_NOT_FOUND, 'Ride not found');
  }
}

export class RideAlreadyStartedError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.RIDE_ALREADY_STARTED, 'Ride has already started');
  }
}

export class RouteNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.ROUTE_NOT_FOUND, 'Route not found');
  }
}

export class RideUpdateBadBodyError extends AppError {
  constructor(message: string) {
    super(400, ERROR_TYPES.RIDE_UPDATE_BAD_BODY, message);
  }
}

export class RideCancelledError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.RIDE_CANCELLED, 'Ride is cancelled');
  }
}

export class ParticipantExistsError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.PARTICIPANT_EXISTS, 'Participant already exists');
  }
}

export class MaxParticipantsError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.MAX_PARTICIPANTS, 'Max participants reached');
  }
}

export class ParticipantNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.PARTICIPANT_NOT_FOUND, 'Participant not found');
  }
}

export class CreatorCannotLeaveError extends AppError {
  constructor() {
    super(400, ERROR_TYPES.CREATOR_CANNOT_LEAVE, 'Creator cannot leave own ride');
  }
}
