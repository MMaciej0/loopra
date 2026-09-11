export class RideNotFoundError extends Error {}
export class RouteNotFoundError extends Error {}
export class RideUpdateBadBodyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RideUpdateBadBodyError';
  }
}
export class RideHasParticipantsError extends Error {}

export class ParticipantExistsError extends Error {}
export class MaxParticipantsError extends Error {}
export class ParticipantNotFoundError extends Error {}
export class CreatorCannotLeaveError extends Error {}
